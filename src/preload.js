
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('libre', {
  navigate: (url) => ipcRenderer.invoke('navigate', url),
  prefs: { get: (k) => ipcRenderer.invoke('prefs:get', k), set: (k,v) => ipcRenderer.invoke('prefs:set', k, v) },
  pw: {
    init: () => ipcRenderer.invoke('pw:init'),
    setMaster: (pwd) => ipcRenderer.invoke('pw:setMaster', pwd),
    unlock: (pwd) => ipcRenderer.invoke('pw:unlock', pwd),
    lock: () => ipcRenderer.invoke('pw:lock'),
    isLocked: () => ipcRenderer.invoke('pw:isLocked'),
    list: (pwd) => ipcRenderer.invoke('pw:list', pwd),
    get: (id, pwd) => ipcRenderer.invoke('pw:get', id, pwd),
    save: (cred, pwd) => ipcRenderer.invoke('pw:save', cred, pwd),
    delete: (id, pwd) => ipcRenderer.invoke('pw:delete', id, pwd)
  }
});
