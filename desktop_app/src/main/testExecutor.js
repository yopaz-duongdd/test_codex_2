const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { ipcMain } = require('electron');
const log = require('electron-log');
const axios = require('axios');

class TestExecutor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isRunning = false;
    this.currentTestId = null;
    this.apiUrl = 'http://localhost:3001';
    this.apiKey = '';
    this.setupIPC();
  }

  setupIPC() {
    ipcMain.handle('start-test-execution', async (event, testData) => {
      return await this.executeTest(testData, event.sender);
    });

    ipcMain.handle('stop-test-execution', async () => {
      return await this.stopExecution();
    });
  }

  async executeTest(testData, sender) {
    if (this.isRunning) {
      throw new Error('Test execution is already in progress');
    }

    try {
      this.isRunning = true;
      this.currentTestId = testData.id;

      // Khởi tạo browser
      this.browser = await puppeteer.launch({
        headless: false, // Hiển thị browser để user có thể theo dõi
        defaultViewport: null,
        args: [
          '--start-maximized',
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      });

      const results = [];

      // Nếu chạy tất cả kịch bản
      if (testData.runAll && testData.scripts && testData.scripts.length > 0) {
        for (let i = 0; i < testData.scripts.length; i++) {
          if (!this.isRunning) break; // Dừng nếu user cancel
          
          const script = testData.scripts[i];
          sender.webContents.send('test-progress', {
            message: `Đang chạy kịch bản ${i + 1}/${testData.scripts.length}: ${script.name}`,
            progress: (i / testData.scripts.length) * 100,
            currentScript: script
          });

          const result = await this.runSingleScript(script, sender);
          results.push(result);
        }
      } else {
        // Chạy một kịch bản duy nhất
        const result = await this.runSingleScript(testData, sender);
        results.push(result);
      }

      await this.cleanup();

      sender.webContents.send('test-complete', {
        results,
        totalTests: results.length,
        passedTests: results.filter(r => r.status === 'passed').length,
        failedTests: results.filter(r => r.status === 'failed').length
      });

      return { success: true, results };

    } catch (error) {
      log.error('Test execution error:', error);
      await this.cleanup();
      
      sender.webContents.send('test-error', {
        message: error.message,
        stack: error.stack
      });

      throw error;
    }
  }

  async runSingleScript(scriptData, sender) {
    const startTime = new Date().toISOString();
    let result = {
      testScriptId: scriptData.id,
      status: 'running',
      startTime,
      endTime: null,
      errorMessage: null,
      screenshots: [],
      consoleErrors: [],
      steps: []
    };

    try {
      // Tạo page mới cho mỗi script
      this.page = await this.browser.newPage();
      
      // Lắng nghe console errors
      this.page.on('console', (msg) => {
        if (msg.type() === 'error') {
          result.consoleErrors.push({
            message: msg.text(),
            timestamp: Date.now()
          });
        }
      });

      // Lắng nghe page errors
      this.page.on('pageerror', (error) => {
        result.consoleErrors.push({
          message: error.message,
          timestamp: Date.now()
        });
      });

      // Thực thi script content trực tiếp
      const scriptContent = scriptData.fileContent || await this.loadScriptFile(scriptData.fileName);
      
      // Parse script và extract các steps
      const steps = this.parseScriptSteps(scriptContent);
      
      // Thực hiện từng step
      for (let i = 0; i < steps.length; i++) {
        if (!this.isRunning) break;

        const step = steps[i];
        
        sender.webContents.send('test-progress', {
          message: `Step ${i + 1}/${steps.length}: ${step.type}`,
          progress: ((i + 1) / steps.length) * 100,
          step: step
        });

        const stepStartTime = new Date().toISOString();
        
        try {
          await this.executeStep(step);
          
          // Thu thập dữ liệu sau mỗi step
          const currentUrl = this.page.url();
          const screenshot = await this.takeScreenshot(`${scriptData.name}_step_${i + 1}`);
          
          const stepResult = {
            id: `step_${i + 1}`,
            stepNumber: i + 1,
            url: currentUrl,
            screenshot: screenshot ? screenshot.filename : null,
            consoleErrors: [...result.consoleErrors], // Copy current console errors
            timestamp: stepStartTime
          };
          
          result.steps.push(stepResult);
          
          if (screenshot) {
            result.screenshots.push(screenshot.filename);
          }

          // Delay giữa các step
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (stepError) {
          // Lỗi trong step, nhưng vẫn thu thập dữ liệu
          const currentUrl = this.page ? this.page.url() : 'unknown';
          const screenshot = await this.takeScreenshot(`${scriptData.name}_step_${i + 1}_error`);
          
          const stepResult = {
            id: `step_${i + 1}`,
            stepNumber: i + 1,
            url: currentUrl,
            screenshot: screenshot ? screenshot.filename : null,
            consoleErrors: [...result.consoleErrors],
            timestamp: stepStartTime,
            error: stepError.message
          };
          
          result.steps.push(stepResult);
          
          if (screenshot) {
            result.screenshots.push(screenshot.filename);
          }
          
          throw stepError; // Re-throw để dừng execution
        }
      }

      result.status = 'success';
      result.endTime = new Date().toISOString();

    } catch (error) {
      log.error(`Script execution failed for ${scriptData.name}:`, error);
      
      result.status = 'failed';
      result.errorMessage = error.message;
      result.endTime = new Date().toISOString();
      
      // Chụp screenshot khi lỗi
      try {
        const errorScreenshot = await this.takeScreenshot(`${scriptData.name}_error`);
        if (errorScreenshot) {
          result.screenshots.push(errorScreenshot.filename);
        }
      } catch (screenshotError) {
        log.error('Failed to take error screenshot:', screenshotError);
      }
    } finally {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
    }

    // Gửi kết quả về API server
    try {
      await this.sendResultToAPI(result);
    } catch (apiError) {
      log.error('Failed to send result to API:', apiError);
    }

    return result;
  }

  async loadScriptFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      throw new Error(`Cannot load script file: ${error.message}`);
    }
  }

  parseScriptSteps(scriptContent) {
    // Đơn giản hóa: tạo các step cơ bản từ script content
    // Trong thực tế, bạn cần parse script Puppeteer để extract các hành động
    const steps = [];
    
    // Extract các hành động cơ bản từ script
    const lines = scriptContent.split('\n');
    let stepCount = 1;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('.goto(') || trimmedLine.includes('.navigate(')) {
        const urlMatch = trimmedLine.match(/['"`]([^'"`]+)['"`]/);
        steps.push({
          type: 'navigate',
          description: `Navigate to URL`,
          url: urlMatch ? urlMatch[1] : 'unknown',
          stepNumber: stepCount++
        });
      } else if (trimmedLine.includes('.click(')) {
        const selectorMatch = trimmedLine.match(/['"`]([^'"`]+)['"`]/);
        steps.push({
          type: 'click',
          description: `Click element`,
          selector: selectorMatch ? selectorMatch[1] : 'unknown',
          stepNumber: stepCount++
        });
      } else if (trimmedLine.includes('.type(')) {
        const matches = trimmedLine.match(/['"`]([^'"`]+)['"`]/g);
        steps.push({
          type: 'type',
          description: `Type text`,
          selector: matches && matches[0] ? matches[0].slice(1, -1) : 'unknown',
          text: matches && matches[1] ? matches[1].slice(1, -1) : 'unknown',
          stepNumber: stepCount++
        });
      } else if (trimmedLine.includes('.waitForSelector(')) {
        const selectorMatch = trimmedLine.match(/['"`]([^'"`]+)['"`]/);
        steps.push({
          type: 'wait',
          description: `Wait for selector`,
          selector: selectorMatch ? selectorMatch[1] : 'unknown',
          stepNumber: stepCount++
        });
      }
    }

    // Nếu không parse được step nào, tạo step mặc định
    if (steps.length === 0) {
      steps.push({
        type: 'execute',
        description: 'Execute script',
        stepNumber: 1
      });
    }

    return steps;
  }

  async executeStep(step) {
    const stepResult = {
      stepNumber: step.stepNumber,
      type: step.type,
      description: step.description,
      status: 'running',
      startTime: Date.now(),
      endTime: null,
      error: null
    };

    try {
      switch (step.type) {
        case 'navigate':
          await this.page.goto(step.url, { waitUntil: 'networkidle2' });
          break;
          
        case 'click':
          await this.page.waitForSelector(step.selector, { timeout: 10000 });
          await this.page.click(step.selector);
          break;
          
        case 'type':
          await this.page.waitForSelector(step.selector, { timeout: 10000 });
          await this.page.type(step.selector, step.text);
          break;
          
        case 'wait':
          await this.page.waitForSelector(step.selector, { timeout: 15000 });
          break;
          
        case 'execute':
          // Thực hiện toàn bộ script
          // Ở đây bạn có thể thực hiện script bằng eval hoặc Function constructor
          break;
          
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      stepResult.status = 'passed';
      stepResult.endTime = Date.now();
      
    } catch (error) {
      stepResult.status = 'failed';
      stepResult.error = error.message;
      stepResult.endTime = Date.now();
      throw error; // Re-throw để dừng execution
    }

    return stepResult;
  }

  async takeScreenshot(filename) {
    if (!this.page) return null;

    try {
      const timestamp = Date.now();
      const screenshotFilename = `${filename}_${timestamp}.png`;
      const screenshotPath = path.join(__dirname, '../../screenshots', screenshotFilename);
      
      // Tạo thư mục screenshots nếu chưa có
      const screenshotsDir = path.dirname(screenshotPath);
      await fs.mkdir(screenshotsDir, { recursive: true });
      
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      return {
        filename: screenshotFilename,
        path: screenshotPath,
        timestamp
      };
    } catch (error) {
      log.error('Screenshot error:', error);
      return null;
    }
  }

  async sendResultToAPI(result) {
    try {
      const Store = require('electron-store');
      const store = new Store();
      
      const apiUrl = store.get('apiUrl', 'http://localhost:3001');
      const apiKey = store.get('apiKey', '');
      
      if (!apiKey) {
        log.warn('No API key configured, skipping result upload');
        return;
      }

      const response = await axios.post(`${apiUrl}/api/test-results`, result, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        timeout: 10000
      });

      log.info('Test result sent to API successfully:', response.data.id);
      return response.data;
    } catch (error) {
      log.error('Failed to send result to API:', error.message);
      throw error;
    }
  }

  async stopExecution() {
    this.isRunning = false;
    await this.cleanup();
    return { success: true, message: 'Test execution stopped' };
  }

  async cleanup() {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      log.error('Cleanup error:', error);
    } finally {
      this.isRunning = false;
      this.currentTestId = null;
    }
  }
}

// Khởi tạo executor
const testExecutor = new TestExecutor();

module.exports = TestExecutor;