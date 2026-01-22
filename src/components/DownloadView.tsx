import React, { useState } from 'react';
import { Download, FolderOpen, FileCode, CheckCircle, AlertCircle } from 'lucide-react';

interface DownloadViewProps {
    selectedIcons: Set<string>;
    onClear: () => void;
}

export const DownloadView: React.FC<DownloadViewProps> = ({ selectedIcons, onClear }) => {
    const [outputDir, setOutputDir] = useState<string>('');
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });
    const [isGenerating, setIsGenerating] = useState(false);

    // Type definition for window.electronAPI is handled in src/types/electron.d.ts

    const handleSelectDir = async () => {
        try {
            const path = await window.electronAPI.selectDirectory();
            if (path) setOutputDir(path);
        } catch (err) {
            console.error(err);
        }
    };

    const handleClear = () => {
        onClear();
        setStatus({ type: 'idle', message: '' });
    };

    const handleDownload = async (format: 'svg' | 'json') => {
        if (selectedIcons.size === 0) {
            setStatus({ type: 'error', message: 'No icons selected.' });
            return;
        }
        if (!outputDir) {
            setStatus({ type: 'error', message: 'Please select an output directory.' });
            return;
        }

        setIsGenerating(true);
        setStatus({ type: 'idle', message: '' });

        try {
            const icons = Array.from(selectedIcons);
            if (format === 'svg') {
                await window.electronAPI.downloadIconsSvg(icons, outputDir);
                setStatus({ type: 'success', message: `Successfully saved ${icons.length} SVGs!` });
            } else {
                await window.electronAPI.downloadIconsJson(icons, outputDir);
                setStatus({ type: 'success', message: `Successfully saved JSON collections!` });
            }
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || 'Download failed' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateProvider = async () => {
        if (!outputDir) {
            setStatus({ type: 'error', message: 'Please select a directory (where collections are saved).' });
            return;
        }
        setIsGenerating(true);
        try {
            // Assume icons are already downloaded as JSON in the outputDir for this flow
            // Or we could trigger a download first. For now, let's assume the user wants to generate from existing.
            // But better flow: "Download & Generate"

            // Let's just generate based on the folder content for now as per original logic
            await window.electronAPI.generateProvider(outputDir, outputDir, true);
            setStatus({ type: 'success', message: 'IconProvider.tsx generated successfully!' });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || 'Generation failed' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="card bg-base-200 shadow-xl border border-base-300">
                <div className="card-body">
                    <h2 className="card-title mb-4 flex items-center gap-2">
                        <Download className="text-primary" />
                        Export Options
                    </h2>

                    <div className="space-y-6">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Output Directory</span>
                            </label>
                            <div className="join w-full">
                                <input
                                    type="text"
                                    value={outputDir}
                                    readOnly
                                    placeholder="Select a folder..."
                                    className="input input-bordered join-item w-full"
                                />
                                <button
                                    onClick={handleSelectDir}
                                    className="btn btn-primary join-item"
                                >
                                    <FolderOpen size={16} />
                                    Browse
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleDownload('svg')}
                                disabled={isGenerating || selectedIcons.size === 0}
                                className="btn h-auto py-8 flex-col gap-2 hover:border-primary border-base-300"
                            >
                                <div className="p-3 rounded-full bg-primary/10 text-primary">
                                    <Download size={24} />
                                </div>
                                <div className="text-center">
                                    <div className="font-bold">Download SVGs</div>
                                    <div className="text-xs opacity-70 font-normal mt-1">Individual files</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleDownload('json')}
                                disabled={isGenerating || selectedIcons.size === 0}
                                className="btn h-auto py-8 flex-col gap-2 hover:border-secondary border-base-300"
                            >
                                <div className="p-3 rounded-full bg-secondary/10 text-secondary">
                                    <FileCode size={24} />
                                </div>
                                <div className="text-center">
                                    <div className="font-bold">Download JSON</div>
                                    <div className="text-xs opacity-70 font-normal mt-1">Iconify Collections</div>
                                </div>
                            </button>
                        </div>

                        <div className="divider"></div>

                        <div className="space-y-3">
                            <button
                                onClick={handleGenerateProvider}
                                disabled={isGenerating || !outputDir}
                                className="btn btn-neutral w-full"
                            >
                                <FileCode size={16} />
                                Generate React IconProvider (from JSONs in Output Dir)
                            </button>

                            {selectedIcons.size > 0 && (
                                <button
                                    onClick={handleClear}
                                    className="btn btn-error btn-outline w-full"
                                >
                                    Clear Selection
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {status.message && (
                <div role="alert" className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <div>
                        <h3 className="font-bold">{status.type === 'success' ? 'Success' : 'Error'}</h3>
                        <div className="text-xs">{status.message}</div>
                    </div>
                </div>
            )}
        </div>
    );
};
