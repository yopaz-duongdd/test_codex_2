import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.apiKey = null;
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor to add API key
    this.client.interceptors.request.use(
      (config) => {
        if (this.apiKey) {
          config.headers['X-API-Key'] = this.apiKey;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response;
          
          if (status === 401) {
            // Unauthorized - invalid API key
            throw new Error('API Key không hợp lệ');
          } else if (status === 403) {
            // Forbidden
            throw new Error('Không có quyền truy cập');
          } else if (status === 404) {
            // Not found
            throw new Error('Không tìm thấy tài nguyên');
          } else if (status >= 500) {
            // Server error
            throw new Error('Lỗi server');
          } else {
            // Other client errors
            throw new Error(data.message || 'Có lỗi xảy ra');
          }
        } else if (error.request) {
          // Network error
          throw new Error('Không thể kết nối đến server');
        } else {
          // Other errors
          throw new Error('Có lỗi xảy ra');
        }
      }
    );
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  // Projects API
  async getProjects() {
    try {
      const response = await this.client.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Return mock data if API fails
      return {
        data: [
          {
            id: 1,
            name: 'E-commerce Website',
            description: 'Testing cho website bán hàng trực tuyến',
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            name: 'Admin Dashboard',
            description: 'Testing cho trang quản trị hệ thống',
            createdAt: '2024-01-20T14:15:00Z'
          },
          {
            id: 3,
            name: 'Mobile App',
            description: 'Testing cho ứng dụng mobile responsive',
            createdAt: '2024-02-01T09:00:00Z'
          }
        ]
      };
    }
  }

  async createProject(projectData) {
    const response = await this.client.post('/projects', projectData);
    return response.data;
  }

  async updateProject(id, projectData) {
    const response = await this.client.put(`/projects/${id}`, projectData);
    return response.data;
  }

  async deleteProject(id) {
    const response = await this.client.delete(`/projects/${id}`);
    return response.data;
  }

  // Screens API
  async getScreens() {
    try {
      const response = await this.client.get('/screens');
      return response.data;
    } catch (error) {
      console.error('Error fetching screens:', error);
      // Return mock data if API fails
      return {
        data: [
          {
            id: 1,
            name: 'Trang đăng nhập',
            domain: 'https://example.com',
            urlPath: '/login',
            projectId: 1,
            description: 'Màn hình đăng nhập người dùng',
            createdAt: '2024-01-15T11:00:00Z'
          },
          {
            id: 2,
            name: 'Giỏ hàng',
            domain: 'https://example.com',
            urlPath: '/cart',
            projectId: 1,
            description: 'Màn hình giỏ hàng và thanh toán',
            createdAt: '2024-01-15T11:30:00Z'
          },
          {
            id: 3,
            name: 'Dashboard chính',
            domain: 'https://admin.example.com',
            urlPath: '/dashboard',
            projectId: 2,
            description: 'Màn hình tổng quan quản trị',
            createdAt: '2024-01-20T15:00:00Z'
          },
          {
            id: 4,
            name: 'Quản lý người dùng',
            domain: 'https://admin.example.com',
            urlPath: '/users',
            projectId: 2,
            description: 'Màn hình quản lý danh sách người dùng',
            createdAt: '2024-01-20T15:30:00Z'
          }
        ]
      };
    }
  }

  async createScreen(screenData) {
    const response = await this.client.post('/screens', screenData);
    return response.data;
  }

  async updateScreen(id, screenData) {
    const response = await this.client.put(`/screens/${id}`, screenData);
    return response.data;
  }

  async deleteScreen(id) {
    const response = await this.client.delete(`/screens/${id}`);
    return response.data;
  }

  // Scripts API
  async getScripts() {
    try {
      const response = await this.client.get('/scripts');
      return response.data;
    } catch (error) {
      console.error('Error fetching scripts:', error);
      // Return mock data if API fails
      return {
        data: [
          {
            id: 1,
            name: 'Test đăng nhập thành công',
            projectId: 1,
            screenId: 1,
            tags: ['login', 'authentication', 'smoke-test'],
            version: '1.2',
            filePath: '/scripts/login_success.js',
            description: 'Kiểm tra đăng nhập với thông tin hợp lệ',
            createdAt: '2024-01-15T12:00:00Z'
          },
          {
            id: 2,
            name: 'Test đăng nhập thất bại',
            projectId: 1,
            screenId: 1,
            tags: ['login', 'authentication', 'negative'],
            version: '1.1',
            filePath: '/scripts/login_fail.js',
            description: 'Kiểm tra đăng nhập với thông tin không hợp lệ',
            createdAt: '2024-01-15T12:30:00Z'
          },
          {
            id: 3,
            name: 'Test thêm sản phẩm vào giỏ hàng',
            projectId: 1,
            screenId: 2,
            tags: ['cart', 'e-commerce', 'core-feature'],
            version: '2.0',
            filePath: '/scripts/add_to_cart.js',
            description: 'Kiểm tra chức năng thêm sản phẩm vào giỏ hàng',
            createdAt: '2024-01-16T09:15:00Z'
          },
          {
            id: 4,
            name: 'Test thanh toán',
            projectId: 1,
            screenId: 2,
            tags: ['payment', 'e-commerce', 'critical'],
            version: '1.5',
            filePath: '/scripts/checkout_process.js',
            description: 'Kiểm tra quy trình thanh toán hoàn chỉnh',
            createdAt: '2024-01-16T14:20:00Z'
          },
          {
            id: 5,
            name: 'Test tạo người dùng mới',
            projectId: 2,
            screenId: 4,
            tags: ['user-management', 'admin', 'crud'],
            version: '1.0',
            filePath: '/scripts/create_user.js',
            description: 'Kiểm tra tạo người dùng mới trong admin',
            createdAt: '2024-01-20T16:00:00Z'
          },
          {
            id: 6,
            name: 'Test xem báo cáo',
            projectId: 2,
            screenId: 3,
            tags: ['dashboard', 'reporting', 'view'],
            version: '1.1',
            filePath: '/scripts/view_reports.js',
            description: 'Kiểm tra xem các báo cáo trên dashboard',
            createdAt: '2024-01-21T10:30:00Z'
          }
        ]
      };
    }
  }

  async createScript(scriptData) {
    const response = await this.client.post('/scripts', scriptData);
    return response.data;
  }

  async updateScript(id, scriptData) {
    const response = await this.client.put(`/scripts/${id}`, scriptData);
    return response.data;
  }

  async deleteScript(id) {
    const response = await this.client.delete(`/scripts/${id}`);
    return response.data;
  }

  // Tags API
  async getTags() {
    try {
      const response = await this.client.get('/tags');
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      // Return mock data if API fails
      return {
        data: [
          { id: 1, name: 'login', projectId: 1 },
          { id: 2, name: 'authentication', projectId: 1 },
          { id: 3, name: 'smoke-test', projectId: 1 },
          { id: 4, name: 'negative', projectId: 1 },
          { id: 5, name: 'cart', projectId: 1 },
          { id: 6, name: 'e-commerce', projectId: 1 },
          { id: 7, name: 'core-feature', projectId: 1 },
          { id: 8, name: 'payment', projectId: 1 },
          { id: 9, name: 'critical', projectId: 1 },
          { id: 10, name: 'user-management', projectId: 2 },
          { id: 11, name: 'admin', projectId: 2 },
          { id: 12, name: 'crud', projectId: 2 },
          { id: 13, name: 'dashboard', projectId: 2 },
          { id: 14, name: 'reporting', projectId: 2 },
          { id: 15, name: 'view', projectId: 2 }
        ]
      };
    }
  }

  async createTag(tagData) {
    const response = await this.client.post('/tags', tagData);
    return response.data;
  }

  async updateTag(id, tagData) {
    const response = await this.client.put(`/tags/${id}`, tagData);
    return response.data;
  }

  async deleteTag(id) {
    const response = await this.client.delete(`/tags/${id}`);
    return response.data;
  }

  // Test Results API
  async getTestResults() {
    try {
      const response = await this.client.get('/test-results');
      return response.data;
    } catch (error) {
      console.error('Error fetching test results:', error);
      // Return mock data if API fails
      return {
        data: [
          {
            id: 1,
            scriptId: 1,
            scriptName: 'Test đăng nhập thành công',
            projectName: 'E-commerce Website',
            screenName: 'Trang đăng nhập',
            version: '1.2',
            status: 'passed',
            startTime: '2024-02-15T09:30:00Z',
            endTime: '2024-02-15T09:32:15Z',
            duration: 135000,
            steps: [
              {
                stepNumber: 1,
                type: 'navigate',
                description: 'Navigate to login page',
                status: 'passed',
                startTime: '2024-02-15T09:30:00Z',
                endTime: '2024-02-15T09:30:05Z'
              },
              {
                stepNumber: 2,
                type: 'type',
                description: 'Enter username',
                selector: '#username',
                status: 'passed',
                startTime: '2024-02-15T09:30:05Z',
                endTime: '2024-02-15T09:30:08Z'
              },
              {
                stepNumber: 3,
                type: 'type',
                description: 'Enter password',
                selector: '#password',
                status: 'passed',
                startTime: '2024-02-15T09:30:08Z',
                endTime: '2024-02-15T09:30:10Z'
              },
              {
                stepNumber: 4,
                type: 'click',
                description: 'Click login button',
                selector: '#login-btn',
                status: 'passed',
                startTime: '2024-02-15T09:30:10Z',
                endTime: '2024-02-15T09:32:15Z'
              }
            ],
            screenshots: [
              {
                filename: 'login_success_step_1_1644921000.png',
                timestamp: '2024-02-15T09:30:00Z'
              },
              {
                filename: 'login_success_step_4_1644921135.png',
                timestamp: '2024-02-15T09:32:15Z'
              }
            ],
            consoleErrors: [],
            finalUrl: 'https://example.com/dashboard'
          },
          {
            id: 2,
            scriptId: 2,
            scriptName: 'Test đăng nhập thất bại',
            projectName: 'E-commerce Website',
            screenName: 'Trang đăng nhập',
            version: '1.1',
            status: 'failed',
            startTime: '2024-02-15T10:00:00Z',
            endTime: '2024-02-15T10:01:20Z',
            duration: 80000,
            steps: [
              {
                stepNumber: 1,
                type: 'navigate',
                description: 'Navigate to login page',
                status: 'passed',
                startTime: '2024-02-15T10:00:00Z',
                endTime: '2024-02-15T10:00:03Z'
              },
              {
                stepNumber: 2,
                type: 'type',
                description: 'Enter invalid username',
                selector: '#username',
                status: 'passed',
                startTime: '2024-02-15T10:00:03Z',
                endTime: '2024-02-15T10:00:06Z'
              },
              {
                stepNumber: 3,
                type: 'click',
                description: 'Click login button',
                selector: '#login-btn',
                status: 'failed',
                startTime: '2024-02-15T10:00:06Z',
                endTime: '2024-02-15T10:01:20Z',
                error: 'Expected error message not found'
              }
            ],
            screenshots: [
              {
                filename: 'login_fail_error_1644921680.png',
                timestamp: '2024-02-15T10:01:20Z'
              }
            ],
            consoleErrors: [
              {
                message: 'Failed to load resource: the server responded with a status of 401 (Unauthorized)',
                timestamp: '2024-02-15T10:00:30Z'
              }
            ],
            finalUrl: 'https://example.com/login',
            error: 'Test failed: Expected error message not displayed'
          },