import type { FC } from 'react';
import type { DownloadCustomizationOptions } from '../../types/electron';
import { SvgIcon } from '../ui/SvgIcon';
import xSvg from '../../assets/ui-icons/x.svg?raw';
import paletteSvg from '../../assets/ui-icons/palette.svg?raw';
import folderSvg from '../../assets/ui-icons/folder.svg?raw';

export type DownloadHistoryEntry = {
    id: string;
    ts: number;
    kind: 'selection' | 'collection';
    label: string;
    count: number;
    format: 'svg' | 'json';
    canRerun: boolean;
    canOpenFolder: boolean;
};

type Props = {
    open: boolean;
    onClose: () => void;
    downloadFormat: 'svg' | 'json';
    onDownloadFormatChange: (format: 'svg' | 'json') => void;
    downloadOptions: DownloadCustomizationOptions;
    onDownloadOptionsChange: (next: DownloadCustomizationOptions) => void;
    history: DownloadHistoryEntry[];
    onRerunHistory: (id: string) => void;
    onOpenHistoryFolder: (id: string) => void;
    onClearHistory: () => void;
};

export const SettingsModal: FC<Props> = ({
    open,
    onClose,
    downloadFormat,
    onDownloadFormatChange,
    downloadOptions,
    onDownloadOptionsChange,
    history,
    onRerunHistory,
    onOpenHistoryFolder,
    onClearHistory,
}) => {
    if (!open) return null;

    const opt = downloadOptions;
    const applyPreset = (preset: 'default' | 'brand-blue' | 'brand-purple' | 'original' | 'folders') => {
        if (preset === 'default') {
            onDownloadOptionsChange({
                ...opt,
                applyColor: false,
                color: '#111827',
                forceMonochrome: true,
                organizeByPrefix: false,
                zipEnabled: false,
            });
            return;
        }
        if (preset === 'brand-blue') {
            onDownloadFormatChange('svg');
            onDownloadOptionsChange({
                ...opt,
                applyColor: true,
                color: '#2563eb',
                forceMonochrome: true,
            });
            return;
        }
        if (preset === 'brand-purple') {
            onDownloadFormatChange('svg');
            onDownloadOptionsChange({
                ...opt,
                applyColor: true,
                color: '#7c3aed',
                forceMonochrome: true,
            });
            return;
        }
        if (preset === 'original') {
            onDownloadOptionsChange({
                ...opt,
                applyColor: false,
            });
            return;
        }
        if (preset === 'folders') {
            onDownloadFormatChange('svg');
            onDownloadOptionsChange({
                ...opt,
                organizeByPrefix: true,
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[60]">
            <button
                type="button"
                className="absolute inset-0 bg-slate-950/30"
                onClick={onClose}
                aria-label="Close settings"
            />

            <div className="absolute left-1/2 top-1/2 w-[560px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2">
                <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-[0_18px_60px_rgba(15,23,42,0.18)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold text-slate-900">Settings</div>
                            <div className="text-[11px] text-slate-500">Default download behavior</div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 shadow-sm grid place-items-center text-slate-600"
                            aria-label="Close"
                        >
                            <SvgIcon svg={xSvg} size={16} />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
                            <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">Presets</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => applyPreset('default')}
                                    className="h-9 px-3 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                                >
                                    Default
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyPreset('brand-blue')}
                                    className="h-9 px-3 rounded-xl text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200"
                                >
                                    Brand Blue
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyPreset('brand-purple')}
                                    className="h-9 px-3 rounded-xl text-xs font-semibold border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 active:bg-purple-200"
                                >
                                    Brand Purple
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyPreset('original')}
                                    className="h-9 px-3 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                                >
                                    Original SVG
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyPreset('folders')}
                                    className="h-9 px-3 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                                >
                                    Folders by Prefix
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
                            <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">Default Format</div>
                            <div className="mt-3 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => onDownloadFormatChange('svg')}
                                    className={`h-9 px-4 rounded-xl text-xs font-semibold border transition-colors ${
                                        downloadFormat === 'svg'
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:bg-slate-100'
                                    }`}
                                >
                                    SVG
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDownloadFormatChange('json')}
                                    className={`h-9 px-4 rounded-xl text-xs font-semibold border transition-colors ${
                                        downloadFormat === 'json'
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:bg-slate-100'
                                    }`}
                                >
                                    JSON
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
                                <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
                                    <SvgIcon svg={folderSvg} size={14} />
                                    Output
                                </div>

                                <div className="mt-3">
                                    <div className="text-xs font-medium text-slate-700">Subfolder</div>
                                    <input
                                        value={opt.subfolder ?? ''}
                                        onChange={(e) => onDownloadOptionsChange({ ...opt, subfolder: e.target.value })}
                                        placeholder="brand-icons"
                                        className="mt-2 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
                                    />
                                </div>

                                <label className={`mt-4 flex items-center justify-between gap-3 ${downloadFormat === 'json' ? 'opacity-60' : ''}`}>
                                    <div>
                                        <div className="text-xs font-medium text-slate-700">Organize by prefix</div>
                                        <div className="text-[11px] text-slate-500">Folders per prefix</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(opt.organizeByPrefix)}
                                        onChange={(e) => onDownloadOptionsChange({ ...opt, organizeByPrefix: e.target.checked })}
                                        className="toggle toggle-sm"
                                        disabled={downloadFormat === 'json'}
                                    />
                                </label>

                                <div className="mt-4 h-px bg-slate-200/70" />

                                <label className="mt-4 flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-xs font-medium text-slate-700">Export as ZIP</div>
                                        <div className="text-[11px] text-slate-500">Single file for sharing</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(opt.zipEnabled)}
                                        onChange={(e) => onDownloadOptionsChange({ ...opt, zipEnabled: e.target.checked })}
                                        className="toggle toggle-sm"
                                    />
                                </label>

                                <div className={`mt-2 flex items-center justify-between gap-3 ${opt.zipEnabled ? '' : 'opacity-50'}`}>
                                    <div className="text-xs font-medium text-slate-700">Zip name</div>
                                    <input
                                        value={opt.zipName ?? ''}
                                        onChange={(e) => onDownloadOptionsChange({ ...opt, zipName: e.target.value })}
                                        placeholder={downloadFormat === 'svg' ? 'icons' : 'collections'}
                                        className="w-40 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
                                        disabled={!opt.zipEnabled}
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
                                <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
                                    <SvgIcon svg={paletteSvg} size={14} />
                                    Color (SVG)
                                </div>

                                <label className={`mt-3 flex items-center justify-between gap-3 ${downloadFormat === 'json' ? 'opacity-60' : ''}`}>
                                    <div>
                                        <div className="text-xs font-medium text-slate-700">Apply color</div>
                                        <div className="text-[11px] text-slate-500">Use a consistent theme</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(opt.applyColor)}
                                        onChange={(e) => onDownloadOptionsChange({ ...opt, applyColor: e.target.checked })}
                                        className="toggle toggle-sm"
                                        disabled={downloadFormat === 'json'}
                                    />
                                </label>

                                <div className={`mt-3 flex items-center justify-between gap-3 ${opt.applyColor && downloadFormat !== 'json' ? '' : 'opacity-50'}`}>
                                    <div className="inline-flex items-center gap-2">
                                        <div
                                            className="h-8 w-8 rounded-xl border border-slate-200 shadow-sm"
                                            style={{ backgroundColor: opt.color ?? '#111827' }}
                                        />
                                        <input
                                            type="color"
                                            value={opt.color ?? '#111827'}
                                            onChange={(e) => onDownloadOptionsChange({ ...opt, color: e.target.value })}
                                            className="h-8 w-10 rounded-xl border border-slate-200 bg-white"
                                            disabled={!opt.applyColor || downloadFormat === 'json'}
                                        />
                                        <input
                                            value={opt.color ?? '#111827'}
                                            onChange={(e) => onDownloadOptionsChange({ ...opt, color: e.target.value })}
                                            className="w-24 px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm font-mono"
                                            disabled={!opt.applyColor || downloadFormat === 'json'}
                                        />
                                    </div>

                                    <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(opt.forceMonochrome)}
                                            onChange={(e) => onDownloadOptionsChange({ ...opt, forceMonochrome: e.target.checked })}
                                            className="checkbox checkbox-xs"
                                            disabled={!opt.applyColor || downloadFormat === 'json'}
                                        />
                                        Mono
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">History</div>
                                    <div className="mt-1 text-[11px] text-slate-500">Re-run recent exports</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClearHistory}
                                    className="h-9 px-3 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                                    disabled={history.length === 0}
                                >
                                    Clear
                                </button>
                            </div>

                            <div className="mt-3 max-h-52 overflow-auto rounded-xl border border-slate-200 bg-white">
                                {history.length === 0 ? (
                                    <div className="px-3 py-3 text-xs text-slate-500">No history yet.</div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {history.map((h) => (
                                            <div key={h.id} className="px-3 py-2.5 flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-xs font-semibold text-slate-800 truncate">{h.label}</div>
                                                    <div className="mt-0.5 text-[11px] text-slate-500">
                                                        {new Date(h.ts).toLocaleString()} • {h.format.toUpperCase()} • {h.count} icons
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => onOpenHistoryFolder(h.id)}
                                                        className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                                                            h.canOpenFolder
                                                                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                                                                : 'border-slate-200 bg-white/60 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                        disabled={!h.canOpenFolder}
                                                    >
                                                        Open
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onRerunHistory(h.id)}
                                                        className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                                                            h.canRerun
                                                                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                                                                : 'border-slate-200 bg-white/60 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                        disabled={!h.canRerun}
                                                    >
                                                        Re-run
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
