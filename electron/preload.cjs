const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload cargado');

contextBridge.exposeInMainWorld('api', {
    system: {
        test: () => ipcRenderer.invoke('system:test')
    },
    obs: {
        connect: (connectionData) => ipcRenderer.invoke('obs:connect', connectionData),
        getScenes: () => ipcRenderer.invoke('obs:getScenes'),
        getInputs: () => ipcRenderer.invoke('obs:getInputs')
    },
    settings: {
        load: () => ipcRenderer.invoke('settings:load'),
        save: (data) => ipcRenderer.invoke('settings:save', data)
    }
});