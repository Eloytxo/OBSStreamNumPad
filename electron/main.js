import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './ipc/obs.js';
import './ipc/settings.js';
import { initKeyboardIPC } from './ipc/keyboard.js';
import OBSService from './services/OBSService.js';
import KeyboardService from './services/KeyboardService.js';
import settingsService from './services/SettingsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Inicializar IPC de teclado con la ventana principal
    initKeyboardIPC(mainWindow);

    // Notify renderer and stop keyboard when OBS connection is lost unexpectedly
    OBSService.on('connectionLost', ({ reason }) => {

        console.log('[Main] OBS connection lost unexpectedly:', reason);

        try {
            KeyboardService.stop();
        } catch (error) {
            console.error('[Main] Error stopping keyboard on connection loss:', error);
        }

        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('obs:connectionLost', { reason });
        }

    });

    // Forward scene collection changes to the renderer and persist the active collection
    OBSService.on('sceneCollectionChanged', ({ sceneCollectionName }) => {

        console.log('[Main] OBS active scene collection changed:', sceneCollectionName);

        settingsService.savePartial({ activeCollection: sceneCollectionName });

        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('obs:sceneCollectionChanged', { sceneCollectionName });
        }

    });

    if (isDev) {

        mainWindow.loadURL('http://localhost:5173');

        mainWindow.webContents.openDevTools();

    } else {

        const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

        console.log('[Main] Loading production build from:', indexPath);

        mainWindow.loadFile(indexPath).catch(err => {

            console.error('[Main] Failed to load index.html:', err);

        });

    }

}

app.whenReady().then(createWindow);

ipcMain.handle('window:close', () => mainWindow.close());
ipcMain.handle('window:minimize', () => mainWindow.minimize());
ipcMain.handle('window:maximize', () => {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.handle('window:focus', () => mainWindow.focus());

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {

        app.quit();

    }

});

// Los atajos globales se liberan automáticamente al salir de la aplicación