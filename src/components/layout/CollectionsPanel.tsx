import React, { useMemo, useState } from 'react';
import type { IconifyCollectionInfo } from '../../hooks/useIconifyCollections';
import { GROUP_ORDER, getMappedGroup, type CollectionGroupId } from '../../data/collectionGroups';
import { SvgIcon } from '../ui/SvgIcon';
import downloadSvg from '../../assets/ui-icons/download.svg?raw';
import type { DownloadCustomizationOptions } from '../../types/electron';
import chevronDownSvg from '../../assets/ui-icons/chevron-down.svg?raw';
import folderSvg from '../../assets/ui-icons/folder.svg?raw';
import paletteSvg from '../../assets/ui-icons/palette.svg?raw';
import copySvg from '../../assets/ui-icons/copy.svg?raw';

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

const categorizeCollection = (c: IconifyCollectionInfo): CollectionGroupId => {
    const name = normalize(c.name);
    const prefix = normalize(c.prefix);
    const combo = `${name} ${prefix}`;

    if (combo.includes('unmaintained') || combo.includes('deprecated') || combo.includes('archived') || combo.includes('archive')) {
        return 'Archive / Unmaintained';
    }

    if (
        prefix === 'mdi' ||
        prefix.startsWith('material-') ||
        prefix === 'ic' ||
        name.includes('material') ||
        name.includes('material design')
    ) {
        return 'Material';
    }

    if (
        prefix.startsWith('twemoji') ||
        prefix.startsWith('noto-emoji') ||
        prefix.startsWith('openmoji') ||
        prefix.startsWith('emojione') ||
        prefix.startsWith('fxemoji') ||
        prefix.startsWith('fluent-emoji') ||
        name.includes('emoji')
    ) {
        return 'Emoji';
    }

    if (
        combo.includes('flag') ||
        combo.includes('country') ||
        combo.includes('maps') ||
        combo.includes('map ') ||
        prefix.startsWith('flag') ||
        prefix === 'gis' ||
        prefix === 'map' ||
        name.includes('flags')
    ) {
        return 'Flags / Maps';
    }

    if (
        prefix.startsWith('logos') ||
        prefix === 'simple-icons' ||
        prefix === 'cib' ||
        prefix === 'bxl' ||
        name.includes('logo') ||
        name.includes('brand')
    ) {
        return 'Logos';
    }

    if (
        prefix === 'devicon' ||
        prefix === 'vscode-icons' ||
        prefix === 'file-icons' ||
        name.includes('programming') ||
        name.includes('developer') ||
        name.includes('devicons') ||
        name.includes('code') ||
        name.includes('file icons')
    ) {
        return 'Programming';
    }

    if (combo.includes('color') || combo.includes('colour') || combo.includes('multicolor') || combo.includes('multi color')) {
        return 'UI Multicolor';
    }

    const has24 = /\b24(px)?\b/.test(combo);
    const has16or32 = /\b(16|32)(px)?\b/.test(combo);
    if (has24) return 'UI 24px';
    if (has16or32) return 'UI 16px / 32px';

    if (
        combo.includes('ui') ||
        combo.includes('interface') ||
        combo.includes('system') ||
        combo.includes('icons')
    ) {
        return 'UI Other / Mixed Grid';
    }

    return 'Thematic';
};

type Props = {
    collections: IconifyCollectionInfo[];
    loading?: boolean;
    error?: string | null;
    selectedPrefix: string | null;
    onSelectPrefix: (prefix: string | null) => void;
    onCopyPrefix?: (prefix: string) => void;
    onDownloadSelected?: () => void;
    downloadDisabled?: boolean;
    collectionStatsText?: string;
    downloadFormat?: 'svg' | 'json';
    downloadOptions?: DownloadCustomizationOptions;
    onDownloadOptionsChange?: (next: DownloadCustomizationOptions) => void;
};

export const CollectionsPanel: React.FC<Props> = ({
    collections,
    loading,
    error,
    selectedPrefix,
    onSelectPrefix,
    onCopyPrefix,
    onDownloadSelected,
    downloadDisabled,
    collectionStatsText,
    downloadFormat = 'svg',
    downloadOptions,
    onDownloadOptionsChange,
}) => {
    const [filter, setFilter] = useState('');
    const [customizeOpen, setCustomizeOpen] = useState(true);
    const [collectionSort, setCollectionSort] = useState<'name' | 'count'>('name');
    const opt = downloadOptions ?? {};
    const setOpt = onDownloadOptionsChange;

    const filtered = useMemo(() => {
        const q = filter.trim().toLowerCase();
        const base = !q
            ? collections
            : collections.filter((c) => {
            return (
                c.prefix.toLowerCase().includes(q) ||
                c.name.toLowerCase().includes(q) ||
                (c.authorName ? c.authorName.toLowerCase().includes(q) : false)
            );
        });

        const list = [...base];
        if (collectionSort === 'count') {
            list.sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
        } else {
            list.sort((a, b) => a.name.localeCompare(b.name));
        }
        return list;
    }, [collectionSort, collections, filter]);

    const grouped = useMemo(() => {
        const map = new Map<CollectionGroupId, IconifyCollectionInfo[]>();
        for (const c of filtered) {
            const group = getMappedGroup(c.prefix) ?? categorizeCollection(c);
            const list = map.get(group);
            if (list) list.push(c);
            else map.set(group, [c]);
        }
        return GROUP_ORDER.map((id) => ({ id, items: map.get(id) ?? [] })).filter((g) => g.items.length > 0);
    }, [filtered]);

    return (
        <aside className="w-[280px] shrink-0 border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white flex flex-col overflow-hidden">
            <div className="px-4 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900">Collections</div>
                    {onDownloadSelected && (
                        <button
                            type="button"
                            onClick={onDownloadSelected}
                            disabled={downloadDisabled}
                            className={`px-2 py-1 text-xs border rounded-md transition-colors ${
                                downloadDisabled
                                    ? 'border-slate-200 text-slate-400 bg-white/60 cursor-not-allowed'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 shadow-sm'
                            }`}
                            title={
                                selectedPrefix
                                    ? downloadFormat === 'svg'
                                        ? `Download ${selectedPrefix} as SVGs`
                                        : `Download ${selectedPrefix} as JSON`
                                    : 'Select a collection first'
                            }
                        >
                            <span className="inline-flex items-center gap-1.5">
                                <SvgIcon svg={downloadSvg} size={14} className={downloadDisabled ? 'text-slate-300' : 'text-slate-700'} />
                                {downloadFormat === 'svg' ? 'SVG' : 'JSON'}
                            </span>
                        </button>
                    )}
                </div>
                <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filter..."
                    className="mt-3 w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
                />

                <div className="mt-3 h-9 rounded-xl border border-slate-200 bg-white shadow-sm p-1 flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setCollectionSort('name')}
                        className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-colors ${
                            collectionSort === 'name' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                        }`}
                    >
                        A-Z
                    </button>
                    <button
                        type="button"
                        onClick={() => setCollectionSort('count')}
                        className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-colors ${
                            collectionSort === 'count' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                        }`}
                        title="Sort by icon count"
                    >
                        #
                    </button>
                </div>
                {collectionStatsText && (
                    <div className="mt-2 text-[11px] text-slate-500">{collectionStatsText}</div>
                )}

                {setOpt && (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm">
                        <button
                            type="button"
                            onClick={() => setCustomizeOpen((v) => !v)}
                            className="w-full px-3 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl border border-slate-200 bg-white shadow-sm grid place-items-center text-slate-700">
                                    <SvgIcon svg={downloadSvg} size={16} />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-semibold text-slate-900">Customization</div>
                                    <div className="text-[11px] text-slate-500">Make exports project-ready</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {downloadFormat === 'svg' ? (
                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        SVG
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                                        JSON
                                    </span>
                                )}
                                <div className={`transition-transform ${customizeOpen ? 'rotate-180' : ''} text-slate-500`}>
                                    <SvgIcon svg={chevronDownSvg} size={16} />
                                </div>
                            </div>
                        </button>

                        <div className={`transition-all duration-300 ${customizeOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                            <div className="px-3 pb-3">
                                <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
                                    <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
                                        <SvgIcon svg={folderSvg} size={14} />
                                        Output
                                    </div>

                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <div className="text-xs font-medium text-slate-700">Subfolder</div>
                                        <input
                                            value={opt.subfolder ?? ''}
                                            onChange={(e) => setOpt({ ...opt, subfolder: e.target.value })}
                                            placeholder="brand-icons"
                                            className="w-36 px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
                                        />
                                    </div>
                                    <div className="mt-2 text-[11px] text-slate-500">
                                        Saves into a dedicated folder inside your selected output directory.
                                    </div>

                                    <div className="mt-3 h-px bg-slate-200/70" />

                                    <label className={`mt-3 flex items-center justify-between gap-3 ${downloadFormat === 'json' ? 'opacity-60' : ''}`}>
                                        <div>
                                            <div className="text-xs font-medium text-slate-700">Organize by prefix</div>
                                            <div className="text-[11px] text-slate-500">Create folders per collection prefix</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(opt.organizeByPrefix)}
                                            onChange={(e) => setOpt({ ...opt, organizeByPrefix: e.target.checked })}
                                            className="toggle toggle-sm"
                                            disabled={downloadFormat === 'json'}
                                        />
                                    </label>

                                    <div className="mt-3 h-px bg-slate-200/70" />

                                    <label className="mt-3 flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-xs font-medium text-slate-700">Export as ZIP</div>
                                            <div className="text-[11px] text-slate-500">Create a single zip file</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(opt.zipEnabled)}
                                            onChange={(e) => setOpt({ ...opt, zipEnabled: e.target.checked })}
                                            className="toggle toggle-sm"
                                        />
                                    </label>

                                    <div className={`mt-2 flex items-center justify-between gap-3 ${opt.zipEnabled ? '' : 'opacity-50'}`}>
                                        <div className="text-xs font-medium text-slate-700">Zip name</div>
                                        <input
                                            value={opt.zipName ?? ''}
                                            onChange={(e) => setOpt({ ...opt, zipName: e.target.value })}
                                            placeholder={downloadFormat === 'svg' ? 'icons' : 'collections'}
                                            className="w-36 px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
                                            disabled={!opt.zipEnabled}
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
                                    <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
                                        <SvgIcon svg={paletteSvg} size={14} />
                                        Color (SVG only)
                                    </div>

                                    <label className={`mt-2 flex items-center justify-between gap-3 ${downloadFormat === 'json' ? 'opacity-60' : ''}`}>
                                        <div>
                                            <div className="text-xs font-medium text-slate-700">Apply color</div>
                                            <div className="text-[11px] text-slate-500">Force a consistent theme color</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(opt.applyColor)}
                                            onChange={(e) => setOpt({ ...opt, applyColor: e.target.checked })}
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
                                                onChange={(e) => setOpt({ ...opt, color: e.target.value })}
                                                className="h-8 w-10 rounded-xl border border-slate-200 bg-white"
                                                disabled={!opt.applyColor || downloadFormat === 'json'}
                                            />
                                            <input
                                                value={opt.color ?? '#111827'}
                                                onChange={(e) => setOpt({ ...opt, color: e.target.value })}
                                                className="w-24 px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm font-mono"
                                                disabled={!opt.applyColor || downloadFormat === 'json'}
                                            />
                                        </div>

                                        <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(opt.forceMonochrome)}
                                                onChange={(e) => setOpt({ ...opt, forceMonochrome: e.target.checked })}
                                                className="checkbox checkbox-xs"
                                                disabled={!opt.applyColor || downloadFormat === 'json'}
                                            />
                                            Monochrome
                                        </label>
                                    </div>

                                    {downloadFormat === 'json' && (
                                        <div className="mt-2 text-[11px] text-slate-500">
                                            Color customization is available for SVG exports only.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-auto">
                <button
                    type="button"
                    onClick={() => onSelectPrefix(null)}
                    className={`w-full text-left px-4 py-2 text-xs border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        selectedPrefix === null ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                    }`}
                >
                    All collections
                </button>

                {loading && (
                    <div className="px-2 py-2 text-xs text-gray-500">Loading…</div>
                )}

                {error && !loading && (
                    <div className="px-2 py-2 text-xs text-red-600">{error}</div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="px-2 py-2 text-xs text-gray-500">No matches</div>
                )}

                {grouped.map((g) => (
                    <div key={g.id} className="border-b border-slate-200/60">
                        <div className="px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-slate-500 bg-white/70 backdrop-blur sticky top-0">
                            {g.id} <span className="ml-1 text-[10px] font-semibold text-slate-400">({g.items.length})</span>
                        </div>
                        {g.items.map((c) => (
                            <div
                                key={c.prefix}
                                onClick={() => onSelectPrefix(c.prefix)}
                                className={`w-full text-left px-4 py-2 text-xs border-t border-slate-100 hover:bg-slate-50 transition-colors ${
                                    selectedPrefix === c.prefix ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                                }`}
                                title={`${c.name} (${c.prefix})${c.total ? ` • ${c.total} icons` : ''}`}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onSelectPrefix(c.prefix);
                                    }
                                }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="truncate">{c.name}</span>
                                            <span className="text-[10px] text-slate-500 shrink-0">({c.prefix})</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600 tabular-nums">
                                            {typeof c.total === 'number' ? c.total : '—'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onCopyPrefix?.(c.prefix);
                                            }}
                                            className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 shadow-sm grid place-items-center text-slate-600"
                                            title="Copy prefix"
                                            aria-label="Copy prefix"
                                        >
                                            <SvgIcon svg={copySvg} size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </aside>
    );
};
