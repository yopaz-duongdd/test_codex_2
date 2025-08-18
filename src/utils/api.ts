import { Project, Screen, Tag, TestScript, TestResult, ApiKeyData } from '../types';

const API_URL = 'http://localhost:3001/api';

// Helper for synchronous HTTP requests
function request<T>(method: string, path: string, body?: unknown): T {
  const xhr = new XMLHttpRequest();
  xhr.open(method, `${API_URL}${path}`, false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(body ? JSON.stringify(body) : null);
  if (xhr.status >= 200 && xhr.status < 300) {
    return xhr.responseText ? JSON.parse(xhr.responseText) : (undefined as unknown as T);
  }
  throw new Error(xhr.statusText);
}

export class TestAutomationAPI {
  static validateApiKey(key: string): ApiKeyData {
    const API_KEY = 'test-automation-key-2025';
    return { key: API_KEY, isValid: key === API_KEY };
  }

  static getApiKey(): string {
    return 'test-automation-key-2025';
  }

  // Projects
  static getProjects(): Project[] {
    return request<Project[]>('GET', '/projects');
  }

  static createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    return request<Project>('POST', '/projects', project);
  }

  static updateProject(id: string, updates: Partial<Project>): Project {
    return request<Project>('PUT', `/projects/${id}`, updates);
  }

  static deleteProject(id: string): boolean {
    request('DELETE', `/projects/${id}`);
    return true;
  }

  // Screens
  static getScreens(): Screen[] {
    return request<Screen[]>('GET', '/screens');
  }

  static createScreen(screen: Omit<Screen, 'id' | 'createdAt' | 'updatedAt'>): Screen {
    return request<Screen>('POST', '/screens', screen);
  }

  static updateScreen(id: string, updates: Partial<Screen>): Screen {
    return request<Screen>('PUT', `/screens/${id}`, updates);
  }

  static deleteScreen(id: string): boolean {
    request('DELETE', `/screens/${id}`);
    return true;
  }

  // Tags
  static getTags(): Tag[] {
    return request<Tag[]>('GET', '/tags');
  }

  static createTag(tag: Omit<Tag, 'id' | 'createdAt'>): Tag {
    return request<Tag>('POST', '/tags', tag);
  }

  static deleteTag(id: string): boolean {
    request('DELETE', `/tags/${id}`);
    return true;
  }

  // Test Scripts
  static getTestScripts(): TestScript[] {
    return request<TestScript[]>('GET', '/test-scripts');
  }

  static createTestScript(script: Omit<TestScript, 'id' | 'version' | 'createdAt' | 'updatedAt'>): TestScript {
    return request<TestScript>('POST', '/test-scripts', script);
  }

  static updateTestScript(id: string, updates: Partial<TestScript>): TestScript {
    return request<TestScript>('PUT', `/test-scripts/${id}`, updates);
  }

  static deleteTestScript(id: string): boolean {
    request('DELETE', `/test-scripts/${id}`);
    return true;
  }

  // Test Results
  static getTestResults(): TestResult[] {
    return request<TestResult[]>('GET', '/test-results');
  }

  static createTestResult(result: Omit<TestResult, 'id' | 'createdAt'>): TestResult {
    return request<TestResult>('POST', '/test-results', result);
  }

  static deleteTestResult(id: string): boolean {
    request('DELETE', `/test-results/${id}`);
    return true;
  }

  // Sample data initialization
  static initializeSampleData(): void {
    request('POST', '/init');
  }
}

