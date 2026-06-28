import { ipcMain } from 'electron';
import settingsService from '../services/settingsService.js';

ipcMain.handle('settings:load', async () => {
    return settingsService.getAll();
});

ipcMain.handle('settings:save', async (_event, data) => {
    settingsService.savePartial(data);
    return { success: true };
});
