const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload cargado');

contextBridge.exposeInMainWorld('api', {
    obs: {
        connect: (connectionData) => ipcRenderer.invoke('obs:connect', connectionData),
        getScenes: () => ipcRenderer.invoke('obs:getScenes'),
        getInputs: () => ipcRenderer.invoke('obs:getInputs'),
        getSceneCollectionList: () => ipcRenderer.invoke('obs:getSceneCollectionList'),
        getCurrentSceneCollection: () => ipcRenderer.invoke('obs:getCurrentSceneCollection'),
        disconnect: () => ipcRenderer.invoke('obs:disconnect'),
        onConnectionLost: (callback) => {
            const channel = 'obs:connectionLost';
            const wrapper = (_event, data) => callback(data);
            ipcRenderer.on(channel, wrapper);
            return () => ipcRenderer.removeListener(channel, wrapper);
        },
        onSceneCollectionChanged: (callback) => {
            const channel = 'obs:sceneCollectionChanged';
            const wrapper = (_event, data) => callback(data);
            ipcRenderer.on(channel, wrapper);
            return () => ipcRenderer.removeListener(channel, wrapper);
        }
    },
    settings: {
        load: () => ipcRenderer.invoke('settings:load'),
        save: (data) => ipcRenderer.invoke('settings:save', data),
        migrateLegacyMappings: (activeCollectionName) => ipcRenderer.invoke('settings:migrateLegacyMappings', activeCollectionName)
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
        focus: () => ipcRenderer.invoke('window:focus'),
    }
});