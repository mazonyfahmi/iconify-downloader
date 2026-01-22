import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#00000000',
            symbolColor: '#74b1be',
            height: 30
        }
    });

    if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:4000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist-react/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers
import { IconService } from './services/iconService';
import { dialog } from 'electron';

ipcMain.handle('ping', () => 'pong');

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory']
    });
    return result.filePaths[0];
});

ipcMain.handle('download-icons-svg', async (_, { icons, outputDir, options }) => {
    mainWindow?.webContents.send('download-progress', { phase: 'start', format: 'svg', current: 0, total: icons.length });
    const result = await IconService.saveAsSVGs(icons, outputDir, options, (current, total, icon) => {
        mainWindow?.webContents.send('download-progress', { phase: 'progress', format: 'svg', current, total, icon });
    });
    mainWindow?.webContents.send('download-progress', { phase: 'done', format: 'svg', current: icons.length, total: icons.length });
    return result;
});

ipcMain.handle('download-icons-json', async (_, { icons, outputDir, options }) => {
    mainWindow?.webContents.send('download-progress', { phase: 'start', format: 'json', current: 0, total: icons.length });
    const result = await IconService.saveAsJSON(icons, outputDir, options, (current, total, icon) => {
        mainWindow?.webContents.send('download-progress', { phase: 'progress', format: 'json', current, total, icon });
    });
    mainWindow?.webContents.send('download-progress', { phase: 'done', format: 'json', current: icons.length, total: icons.length });
    return result;
});

ipcMain.handle('generate-provider', async (_, { iconDir, genDir, useTypescript }) => {
    return await IconService.generateIconProvider(iconDir, genDir, useTypescript);
});

ipcMain.handle('open-path', async (_, targetPath: string) => {
    if (!targetPath || typeof targetPath !== 'string') return false;
    const result = await shell.openPath(targetPath);
    return result.length === 0;
});
