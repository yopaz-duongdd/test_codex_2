import axios from "axios";

class ApiService {
  constructor() {
    this.baseURL = "http://localhost:3001";
    this.apiKey = "";
    this.client = null;
    this.initializeClient();
  }

  async initializeClient() {
    try {
      const config = await window.electronAPI.api.getConfig();
      this.baseURL = config.apiUrl || "http://localhost:3001";
      this.apiKey = config.apiKey || "";

      this.client = axios.create({
        baseURL: this.baseURL,
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
      });

      // Request interceptor
      this.client.interceptors.request.use(
        (config) => {
          config.headers["X-API-Key"] = this.apiKey;
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response interceptor
      this.client.interceptors.response.use(
        (response) => response,
        (error) => {
          console.error("API Error:", error.response?.data || error.message);
          return Promise.reject(error);
        }
      );
    } catch (error) {
      console.error("Failed to initialize API client:", error);
    }
  }

  async updateConfig(apiUrl, apiKey) {
    this.baseURL = apiUrl;
    this.apiKey = apiKey;

    await window.electronAPI.api.setConfig({ apiUrl, apiKey });
    await this.initializeClient();
  }

  // API Key validation
  async validateApiKey(key) {
    try {
      const response = await axios.post(`${this.baseURL}/api/validate-key`, {
        key,
      });
      return response.data;
    } catch (error) {
      throw new Error("Invalid API key or server connection failed");
    }
  }

  // Projects
  async getProjects() {
    const response = await this.client.get("/api/projects");
    return response.data;
  }

  async createProject(project) {
    const response = await this.client.post("/api/projects", project);
    return response.data;
  }

  async updateProject(id, updates) {
    const response = await this.client.put(`/api/projects/${id}`, updates);
    return response.data;
  }

  async deleteProject(id) {
    await this.client.delete(`/api/projects/${id}`);
    return true;
  }

  // Screens
  async getScreens() {
    const response = await this.client.get("/api/screens");
    return response.data;
  }

  async createScreen(screen) {
    const response = await this.client.post("/api/screens", screen);
    return response.data;
  }

  async updateScreen(id, updates) {
    const response = await this.client.put(`/api/screens/${id}`, updates);
    return response.data;
  }

  async deleteScreen(id) {
    await this.client.delete(`/api/screens/${id}`);
    return true;
  }

  // Tags
  async getTags() {
    const response = await this.client.get("/api/tags");
    return response.data;
  }

  async createTag(tag) {
    const response = await this.client.post("/api/tags", tag);
    return response.data;
  }

  async deleteTag(id) {
    await this.client.delete(`/api/tags/${id}`);
    return true;
  }

  // Test Scripts
  async getTestScripts() {
    const response = await this.client.get("/api/test-scripts");
    return response.data;
  }

  async createTestScript(script) {
    const response = await this.client.post("/api/test-scripts", script);
    return response.data;
  }

  async updateTestScript(id, updates) {
    const response = await this.client.put(`/api/test-scripts/${id}`, updates);
    return response.data;
  }

  async deleteTestScript(id) {
    await this.client.delete(`/api/test-scripts/${id}`);
    return true;
  }

  // Test Results
  async getTestResults() {
    const response = await this.client.get("/api/test-results");
    return response.data;
  }

  async createTestResult(result) {
    const response = await this.client.post("/api/test-results", result);
    return response.data;
  }

  async deleteTestResult(id) {
    await this.client.delete(`/api/test-results/${id}`);
    return true;
  }

  // Search methods
  async searchTestScripts(filters) {
    const params = new URLSearchParams();
    if (filters.project) params.append("project", filters.project);
    if (filters.screen) params.append("screen", filters.screen);
    if (filters.tag) params.append("tag", filters.tag);
    if (filters.search) params.append("search", filters.search);

    const response = await this.client.get(
      `/api/test-scripts/search?${params}`
    );
    return response.data;
  }

  async searchTestResults(filters) {
    const params = new URLSearchParams();
    if (filters.project) params.append("project", filters.project);
    if (filters.screen) params.append("screen", filters.screen);
    if (filters.tag) params.append("tag", filters.tag);
    if (filters.search) params.append("search", filters.search);

    const response = await this.client.get(
      `/api/test-results/search?${params}`
    );
    return response.data;
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
