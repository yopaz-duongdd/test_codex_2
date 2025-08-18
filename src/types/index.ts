export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Screen {
  id: string;
  name: string;
  domain: string;
  urlPath: string;
  projectId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
}

export interface TestScript {
  id: string;
  name: string;
  projectId: string;
  screenId: string;
  tagId: string;
  version: number;
  fileName: string;
  fileContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  id: string;
  testScriptId: string;
  status: 'success' | 'failed' | 'running';
  startTime: string;
  endTime?: string;
  errorMessage?: string;
  screenshots: string[];
  consoleErrors: string[];
  steps: TestStep[];
  createdAt: string;
}

export interface TestStep {
  id: string;
  stepNumber: number;
  url: string;
  screenshot?: string;
  consoleErrors: string[];
  timestamp: string;
}

export interface ApiKeyData {
  key: string;
  isValid: boolean;
}