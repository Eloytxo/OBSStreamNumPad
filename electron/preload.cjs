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
    },
    keyboard: {
        start: () => ipcRenderer.invoke('keyboard:start'),
        stop: () => ipcRenderer.invoke('keyboard:stop'),
        onActionExecuted: (cb) => ipcRenderer.on('action:executed', (_event, data) => cb(data))
    },
    window: {
        close: () => ipcRenderer.invoke('window:close'),
        minimize: () => ipcRenderer.invoke('window:minimize'),
        maximize: () => ipcRenderer.invoke('window:maximize'),
    }
});