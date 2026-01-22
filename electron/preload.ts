import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    ping: () => ipcRenderer.invoke('ping'),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    downloadIconsSvg: (icons: string[], outputDir: string, options?: unknown) => ipcRenderer.invoke('download-icons-svg', { icons, outputDir, options }),
    downloadIconsJson: (icons: string[], outputDir: string, options?: unknown) => ipcRenderer.invoke('download-icons-json', { icons, outputDir, options }),
    generateProvider: (iconDir: string, genDir: string, useTypescript: boolean) => ipcRenderer.invoke('generate-provider', { iconDir, genDir, useTypescript }),
    openPath: (targetPath: string) => ipcRenderer.invoke('open-path', targetPath),
    onDownloadProgress: (listener: (payload: unknown) => void) => {
        const handler = (_: unknown, payload: unknown) => listener(payload);
        ipcRenderer.on('download-progress', handler);
        return () => {
            ipcRenderer.removeListener('download-progress', handler);
        };
    },
});
