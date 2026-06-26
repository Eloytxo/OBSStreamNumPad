import { ipcMain } from 'electron';

ipcMain.handle('system:test', async () => {
    console.log('Petición recibida');
    return '¡Electron responde correctamente!';
});