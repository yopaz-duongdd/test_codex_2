import { Project, Screen, Tag, TestScript, TestResult, ApiKeyData } from '../types';

const API_KEY = 'test-automation-key-2025';

// Simulated API with localStorage
export class TestAutomationAPI {
  private static getStorageKey(entity: string): string {
    return `test-automation-${entity}`;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // API Key validation
  static validateApiKey(key: string): ApiKeyData {
    return {
      key: API_KEY,
      isValid: key === API_KEY
    };
  }

  static getApiKey(): string {
    return API_KEY;
  }

  // Projects
  static getProjects(): Project[] {
    const data = localStorage.getItem(this.getStorageKey('projects'));
    return data ? JSON.parse(data) : [];
  }

  static createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      ...project,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.push(newProject);
    localStorage.setItem(this.getStorageKey('projects'), JSON.stringify(projects));
    return newProject;
  }

  static updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.getStorageKey('projects'), JSON.stringify(projects));
    return projects[index];
  }

  static deleteProject(id: string): boolean {
    const projects = this.getProjects().filter(p => p.id !== id);
    localStorage.setItem(this.getStorageKey('projects'), JSON.stringify(projects));
    
    // Also delete related data
    const screens = this.getScreens().filter(s => s.projectId !== id);
    localStorage.setItem(this.getStorageKey('screens'), JSON.stringify(screens));
    
    const tags = this.getTags().filter(t => t.projectId !== id);
    localStorage.setItem(this.getStorageKey('tags'), JSON.stringify(tags));
    
    const scripts = this.getTestScripts().filter(s => s.projectId !== id);
    localStorage.setItem(this.getStorageKey('testScripts'), JSON.stringify(scripts));
    
    return true;
  }

  // Screens
  static getScreens(): Screen[] {
    const data = localStorage.getItem(this.getStorageKey('screens'));
    return data ? JSON.parse(data) : [];
  }

  static createScreen(screen: Omit<Screen, 'id' | 'createdAt' | 'updatedAt'>): Screen {
    const screens = this.getScreens();
    const newScreen: Screen = {
      ...screen,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    screens.push(newScreen);
    localStorage.setItem(this.getStorageKey('screens'), JSON.stringify(screens));
    return newScreen;
  }

  static updateScreen(id: string, updates: Partial<Screen>): Screen | null {
    const screens = this.getScreens();
    const index = screens.findIndex(s => s.id === id);
    if (index === -1) return null;

    screens[index] = {
      ...screens[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.getStorageKey('screens'), JSON.stringify(screens));
    return screens[index];
  }

  static deleteScreen(id: string): boolean {
    const screens = this.getScreens().filter(s => s.id !== id);
    localStorage.setItem(this.getStorageKey('screens'), JSON.stringify(screens));
    
    // Also delete related test scripts
    const scripts = this.getTestScripts().filter(s => s.screenId !== id);
    localStorage.setItem(this.getStorageKey('testScripts'), JSON.stringify(scripts));
    
    return true;
  }

  // Tags
  static getTags(): Tag[] {
    const data = localStorage.getItem(this.getStorageKey('tags'));
    return data ? JSON.parse(data) : [];
  }

  static createTag(tag: Omit<Tag, 'id' | 'createdAt'>): Tag {
    const tags = this.getTags();
    
    // Check if tag already exists in project
    const existingTag = tags.find(t => t.name === tag.name && t.projectId === tag.projectId);
    if (existingTag) {
      throw new Error('Tag already exists in this project');
    }
    
    const newTag: Tag = {
      ...tag,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    tags.push(newTag);
    localStorage.setItem(this.getStorageKey('tags'), JSON.stringify(tags));
    return newTag;
  }

  static deleteTag(id: string): boolean {
    const tags = this.getTags().filter(t => t.id !== id);
    localStorage.setItem(this.getStorageKey('tags'), JSON.stringify(tags));
    return true;
  }

  // Test Scripts
  static getTestScripts(): TestScript[] {
    const data = localStorage.getItem(this.getStorageKey('testScripts'));
    return data ? JSON.parse(data) : [];
  }

  static createTestScript(script: Omit<TestScript, 'id' | 'version' | 'createdAt' | 'updatedAt'>): TestScript {
    const scripts = this.getTestScripts();
    
    // Auto-increment version
    const existingVersions = scripts
      .filter(s => s.name === script.name && s.projectId === script.projectId && s.screenId === script.screenId)
      .map(s => s.version);
    
    const nextVersion = existingVersions.length > 0 ? Math.max(...existingVersions) + 1 : 1;
    
    const newScript: TestScript = {
      ...script,
      id: this.generateId(),
      version: nextVersion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    scripts.push(newScript);
    localStorage.setItem(this.getStorageKey('testScripts'), JSON.stringify(scripts));
    return newScript;
  }

  static updateTestScript(id: string, updates: Partial<TestScript>): TestScript | null {
    const scripts = this.getTestScripts();
    const index = scripts.findIndex(s => s.id === id);
    if (index === -1) return null;

    scripts[index] = {
      ...scripts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.getStorageKey('testScripts'), JSON.stringify(scripts));
    return scripts[index];
  }

  static deleteTestScript(id: string): boolean {
    const scripts = this.getTestScripts().filter(s => s.id !== id);
    localStorage.setItem(this.getStorageKey('testScripts'), JSON.stringify(scripts));
    return true;
  }

  // Test Results
  static getTestResults(): TestResult[] {
    const data = localStorage.getItem(this.getStorageKey('testResults'));
    return data ? JSON.parse(data) : [];
  }

  static createTestResult(result: Omit<TestResult, 'id' | 'createdAt'>): TestResult {
    const results = this.getTestResults();
    const newResult: TestResult = {
      ...result,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    results.push(newResult);
    localStorage.setItem(this.getStorageKey('testResults'), JSON.stringify(results));
    return newResult;
  }

  static deleteTestResult(id: string): boolean {
    const results = this.getTestResults().filter(r => r.id !== id);
    localStorage.setItem(this.getStorageKey('testResults'), JSON.stringify(results));
    return true;
  }

  // Initialize with sample data
  static initializeSampleData() {
    if (localStorage.getItem(this.getStorageKey('projects'))) return;

    // Sample projects
    const project1 = this.createProject({
      name: 'E-commerce Website',
      description: 'Main e-commerce platform testing'
    });

    const project2 = this.createProject({
      name: 'Admin Dashboard',
      description: 'Backend admin panel testing'
    });

    // Sample screens
    const screen1 = this.createScreen({
      name: 'Login Page',
      domain: 'https://example-store.com',
      urlPath: '/login',
      projectId: project1.id,
      description: 'User authentication screen'
    });

    const screen2 = this.createScreen({
      name: 'Product List',
      domain: 'https://example-store.com',
      urlPath: '/products',
      projectId: project1.id,
      description: 'Product listing and search'
    });

    // Sample tags
    const tag1 = this.createTag({
      name: 'regression',
      projectId: project1.id
    });

    const tag2 = this.createTag({
      name: 'smoke',
      projectId: project1.id
    });

    // Sample test scripts
    this.createTestScript({
      name: 'Login Flow Test',
      projectId: project1.id,
      screenId: screen1.id,
      tagId: tag1.id,
      fileName: 'login-test.js',
      fileContent: `const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://example-store.com/login');
  await page.type('#email', 'test@example.com');
  await page.type('#password', 'password123');
  await page.click('#login-button');
  
  await browser.close();
})();`
    });

    // Sample test results
    this.createTestResult({
      testScriptId: this.getTestScripts()[0].id,
      status: 'success',
      startTime: new Date(Date.now() - 300000).toISOString(),
      endTime: new Date(Date.now() - 290000).toISOString(),
      screenshots: [],
      consoleErrors: [],
      steps: [
        {
          id: this.generateId(),
          stepNumber: 1,
          url: 'https://example-store.com/login',
          consoleErrors: [],
          timestamp: new Date(Date.now() - 295000).toISOString()
        }
      ]
    });
  }
}