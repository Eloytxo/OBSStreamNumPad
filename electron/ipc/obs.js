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