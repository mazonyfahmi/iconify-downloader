"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
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
    if (!electron_1.app.isPackaged) {
        mainWindow.loadURL('http://localhost:4000');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist-react/index.html'));
    }
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// IPC Handlers
const iconService_1 = require("./services/iconService");
const electron_2 = require("electron");
electron_1.ipcMain.handle('ping', () => 'pong');
electron_1.ipcMain.handle('select-directory', async () => {
    const result = await electron_2.dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory']
    });
    return result.filePaths[0];
});
electron_1.ipcMain.handle('download-icons-svg', async (_, { icons, outputDir, options }) => {
    mainWindow?.webContents.send('download-progress', { phase: 'start', format: 'svg', current: 0, total: icons.length });
    const result = await iconService_1.IconService.saveAsSVGs(icons, outputDir, options, (current, total, icon) => {
        mainWindow?.webContents.send('download-progress', { phase: 'progress', format: 'svg', current, total, icon });
    });
    mainWindow?.webContents.send('download-progress', { phase: 'done', format: 'svg', current: icons.length, total: icons.length });
    return result;
});
electron_1.ipcMain.handle('download-icons-json', async (_, { icons, outputDir, options }) => {
    mainWindow?.webContents.send('download-progress', { phase: 'start', format: 'json', current: 0, total: icons.length });
    const result = await iconService_1.IconService.saveAsJSON(icons, outputDir, options, (current, total, icon) => {
        mainWindow?.webContents.send('download-progress', { phase: 'progress', format: 'json', current, total, icon });
    });
    mainWindow?.webContents.send('download-progress', { phase: 'done', format: 'json', current: icons.length, total: icons.length });
    return result;
});
electron_1.ipcMain.handle('generate-provider', async (_, { iconDir, genDir, useTypescript }) => {
    return await iconService_1.IconService.generateIconProvider(iconDir, genDir, useTypescript);
});
electron_1.ipcMain.handle('open-path', async (_, targetPath) => {
    if (!targetPath || typeof targetPath !== 'string')
        return false;
    const result = await electron_1.shell.openPath(targetPath);
    return result.length === 0;
});
