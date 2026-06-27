import { ipcMain } from 'electron';
import OBSService from '../services/OBSService.js';

ipcMain.handle('obs:connect', async (_event, connectionData) => {

    return await OBSService.connect(
        connectionData.host,
        connectionData.port,
        connectionData.password
    );

});