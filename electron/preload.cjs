const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload cargado');

contextBridge.exposeInMainWorld('api', {
    system: {
        test: () => ipcRenderer.invoke('system:test')
    }
});