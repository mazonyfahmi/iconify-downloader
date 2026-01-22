export interface ElectronAPI {
    ping: () => Promise<string>;
    selectDirectory: () => Promise<string | undefined>;
    downloadIconsSvg: (icons: string[], outputDir: string, options?: DownloadCustomizationOptions) => Promise<string[]>;
    downloadIconsJson: (icons: string[], outputDir: string, options?: DownloadCustomizationOptions) => Promise<string[]>;
    generateProvider: (iconDir: string, genDir: string, useTypescript: boolean) => Promise<string>;
    openPath: (targetPath: string) => Promise<boolean>;
    onDownloadProgress: (listener: (payload: DownloadProgressPayload) => void) => () => void;
}

export type DownloadCustomizationOptions = {
    subfolder?: string;
    organizeByPrefix?: boolean;
    applyColor?: boolean;
    color?: string;
    forceMonochrome?: boolean;
    zipEnabled?: boolean;
    zipName?: string;
};

export type DownloadProgressPayload = {
    phase: 'start' | 'progress' | 'done';
    format: 'svg' | 'json';
    current: number;
    total: number;
    icon?: string;
};

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
