import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

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

    if (isDev) {

        mainWindow.loadURL('http://localhost:5173');

        mainWindow.webContents.openDevTools();

    } else {

        mainWindow.loadFile(
            path.join(__dirname, '../dist/index.html')
        );

    }

}

ipcMain.handle('system:test', async () => {

    console.log('Petición recibida desde Vue');

    return '¡Electron responde correctamente!';

});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {

        app.quit();

    }

});