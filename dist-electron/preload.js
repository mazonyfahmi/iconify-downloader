"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    ping: () => electron_1.ipcRenderer.invoke('ping'),
    selectDirectory: () => electron_1.ipcRenderer.invoke('select-directory'),
    downloadIconsSvg: (icons, outputDir, options) => electron_1.ipcRenderer.invoke('download-icons-svg', { icons, outputDir, options }),
    downloadIconsJson: (icons, outputDir, options) => electron_1.ipcRenderer.invoke('download-icons-json', { icons, outputDir, options }),
    generateProvider: (iconDir, genDir, useTypescript) => electron_1.ipcRenderer.invoke('generate-provider', { iconDir, genDir, useTypescript }),
    openPath: (targetPath) => electron_1.ipcRenderer.invoke('open-path', targetPath),
    onDownloadProgress: (listener) => {
        const handler = (_, payload) => listener(payload);
        electron_1.ipcRenderer.on('download-progress', handler);
        return () => {
            electron_1.ipcRenderer.removeListener('download-progress', handler);
        };
    },
});
