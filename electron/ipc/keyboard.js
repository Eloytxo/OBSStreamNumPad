import { ipcMain } from 'electron';
import KeyboardService from '../services/KeyboardService.js';
import ActionDispatcher from '../services/ActionDispatcher.js';
import OBSService from '../services/OBSService.js';
import SettingsService from '../services/SettingsService.js';
import { normalize } from '../../core/keyboard.js';

let dispatcher = null;

/**
 * Inicializa el ActionDispatcher con la ventana principal.
 * Debe llamarse después de que mainWindow esté creada.
 *
 * @param {import('electron').BrowserWindow} mainWindow
 */
export function initKeyboardIPC(mainWindow) {

    dispatcher = new ActionDispatcher(OBSService, SettingsService, mainWindow);

}

ipcMain.handle('keyboard:start', async () => {

    if (!dispatcher) {

        return {
            success: false,
            message: 'Keyboard IPC not initialized'
        };

    }

    const result = KeyboardService.start(({ key, state }) => {

        // Solo procesar teclas del numpad
        const normalizedKey = normalize(key);

        if (!normalizedKey) {

            return;

        }

        if (state === 'DOWN') {

            dispatcher.dispatch(normalizedKey);

        }

    });

    return result;

});

ipcMain.handle('keyboard:stop', async () => {

    KeyboardService.stop();

    return {
        success: true
    };

});
