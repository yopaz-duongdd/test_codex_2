const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Store methods
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key)
  },
  
  // Dialog methods
  dialog: {
    showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
    showErrorBox: (title, content) => ipcRenderer.invoke('show-error-box', title, content)
  },
  
  // App methods
  app: {
    getVersion: () => ipcRenderer.invoke('app-version')
  },
  
  // Test execution methods
  testExecution: {
    startTest: (testData) => ipcRenderer.invoke('start-test-execution', testData),
    stopTest: () => ipcRenderer.invoke('stop-test-execution'),
    onTestProgress: (callback) => {
      ipcRenderer.on('test-progress', callback);
      return () => ipcRenderer.removeListener('test-progress', callback);
    },
    onTestComplete: (callback) => {
      ipcRenderer.on('test-complete', callback);
      return () => ipcRenderer.removeListener('test-complete', callback);
    },
    onTestError: (callback) => {
      ipcRenderer.on('test-error', callback);
      return () => ipcRenderer.removeListener('test-error', callback);
    }
  },

  // API configuration methods
  api: {
    getConfig: () => ipcRenderer.invoke('get-api-config'),
    setConfig: (config) => ipcRenderer.invoke('set-api-config', config)
  }
});