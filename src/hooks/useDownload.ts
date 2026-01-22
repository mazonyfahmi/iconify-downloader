import { useEffect, useState } from 'react';
import type { DownloadCustomizationOptions } from '../types/electron';

export const useDownload = () => {
    const [outputDir, setOutputDir] = useState<string>('');
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState<{
        active: boolean;
        format: 'svg' | 'json';
        current: number;
        total: number;
        icon?: string;
    } | null>(null);

    useEffect(() => {
        const api = window.electronAPI;
        if (!api?.onDownloadProgress) return;

        const unsubscribe = api.onDownloadProgress((payload) => {
            if (!payload || typeof payload !== 'object') return;
            const p = payload as any;
            if (p.phase === 'start') {
                setProgress({
                    active: true,
                    format: p.format,
                    current: p.current ?? 0,
                    total: p.total ?? 0,
                    icon: p.icon,
                });
                return;
            }
            if (p.phase === 'progress') {
                setProgress((prev) => ({
                    active: true,
                    format: p.format ?? prev?.format ?? 'svg',
                    current: p.current ?? prev?.current ?? 0,
                    total: p.total ?? prev?.total ?? 0,
                    icon: p.icon ?? prev?.icon,
                }));
                return;
            }
            if (p.phase === 'done') {
                setProgress((prev) => (prev ? { ...prev, active: false, current: p.current ?? prev.current } : null));
            }
        });

        return unsubscribe;
    }, []);

    const selectDir = async () => {
        try {
            const path = await window.electronAPI.selectDirectory();
            if (path) setOutputDir(path);
            return path;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const downloadIcons = async (
        selectedIcons: Set<string>,
        format: 'svg' | 'json' = 'svg',
        options?: DownloadCustomizationOptions
    ) => {
        if (selectedIcons.size === 0) {
            setStatus({ type: 'error', message: 'No icons selected.' });
            return { ok: false as const };
        }
        
        let targetDir = outputDir;
        if (!targetDir) {
            targetDir = await selectDir() || '';
            if (!targetDir) {
                setStatus({ type: 'error', message: 'Please select an output directory.' });
                return { ok: false as const };
            }
        }

        setIsGenerating(true);
        setStatus({ type: 'idle', message: '' });
        setProgress({ active: true, format, current: 0, total: selectedIcons.size });

        try {
            const icons = Array.from(selectedIcons);
            if (format === 'svg') {
                await window.electronAPI.downloadIconsSvg(icons, targetDir, options);
                setStatus({ type: 'success', message: `Successfully saved ${icons.length} SVGs!` });
            } else {
                await window.electronAPI.downloadIconsJson(icons, targetDir, options);
                setStatus({ type: 'success', message: `Successfully saved JSON collections!` });
            }
            return { ok: true as const, targetDir };
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || 'Download failed' });
            return { ok: false as const, targetDir };
        } finally {
            setIsGenerating(false);
            setProgress((p) => (p ? { ...p, active: false } : p));
        }
    };

    const clearStatus = () => {
        setStatus({ type: 'idle', message: '' });
        setProgress(null);
    };

    return {
        outputDir,
        selectDir,
        downloadIcons,
        status,
        isGenerating,
        progress,
        clearStatus
    };
};
