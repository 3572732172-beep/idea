const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ideaAPI', {
  getAutostart: () => ipcRenderer.invoke('autostart:get'),
  setAutostart: (enabled) => ipcRenderer.invoke('autostart:set', enabled),
  openExternal: (url) => ipcRenderer.invoke('external:open', url)
});
