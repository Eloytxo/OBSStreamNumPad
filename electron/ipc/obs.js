import { ipcMain } from 'electron';
import OBSService from '../services/OBSService.js';

ipcMain.handle('obs:connect', async (_event, connectionData) => {

    return await OBSService.connect(
        connectionData.host,
        connectionData.port,
        connectionData.password
    );

});

ipcMain.handle('obs:getScenes', async () => {

    return await OBSService.getSceneList();

});

ipcMain.handle('obs:getInputs', async () => {

    return await OBSService.getInputList();

});

ipcMain.handle('obs:disconnect', async () => {

    try {

        await OBSService.disconnect();

        return { success: true };

    } catch (error) {

        return { success: false, error: error.message };

    }

});

ipcMain.handle('obs:getSceneCollectionList', async () => {

    return await OBSService.getSceneCollectionList();

});

ipcMain.handle('obs:getCurrentSceneCollection', async () => {

    return await OBSService.getCurrentSceneCollection();

});