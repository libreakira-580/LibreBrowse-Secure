const { contextBridge, ipcRenderer } = require('electron');

// Expose only necessary APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (url) => ipcRenderer.invoke('navigate', url),
  reload: () => ipcRenderer.invoke('reload'),
  goBack: () => ipcRenderer.invoke('go-back'),
  goForward: () => ipcRenderer.invoke('go-forward'),
  setProxy: (config) => ipcRenderer.invoke('set-proxy', config),
  
  onUrlUpdated: (callback) => {
    ipcRenderer.on('url-updated', (event, url) => callback(url));
  },
  
  onSecurityStatus: (callback) => {
    ipcRenderer.on('security-status', (event, isSecure) => callback(isSecure));
  }
});
