import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './ipc/system.js';
import './ipc/obs.js';
import './ipc/settings.js';
import { initKeyboardIPC } from './ipc/keyboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({

        width: 1200,
        height: 800,

        webPreferences: {

            preload: path.join(__dirname, 'preload.cjs'),

            contextIsolation: true,

            nodeIntegration: false

        }

    });

    // Inicializar IPC de teclado con la ventana principal
    initKeyboardIPC(mainWindow);

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

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {

        app.quit();

    }

});

// Los atajos globales se liberan automáticamente al salir de la aplicación