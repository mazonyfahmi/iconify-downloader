import { useEffect, useState } from 'react';
import axios from 'axios';
import { useIconSearch } from './hooks/useIconSearch';
import { useDownload } from './hooks/useDownload';
import { Toolbar } from './components/layout/Toolbar';
import { InfoBar } from './components/layout/InfoBar';
import { StatusBar } from './components/layout/StatusBar';
import { MainList } from './components/views/MainList';
import { CollectionsPanel } from './components/layout/CollectionsPanel';
import { useIconifyCollections } from './hooks/useIconifyCollections';
import { useIconifyCollectionIcons } from './hooks/useIconifyCollectionIcons';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { SvgIcon } from './components/ui/SvgIcon';
import xSvg from './assets/ui-icons/x.svg?raw';
import { DownloadProgressBar } from './components/layout/DownloadProgressBar';
import type { DownloadCustomizationOptions } from './types/electron';
import { SettingsModal, type DownloadHistoryEntry as SettingsHistoryEntry } from './components/layout/SettingsModal';
import { ToastMessage, type ToastPayload } from './components/ui/ToastMessage';

type IconifyCollectionResponse = {
    prefix: string;
    total: number;
    uncategorized?: string[];
    categories?: Record<string, string[]>;
};

type HistoryItem = {
    id: string;
    ts: number;
    kind: 'selection' | 'collection';
    label: string;
    count: number;
    format: 'svg' | 'json';
    options: DownloadCustomizationOptions;
    targetDir?: string;
    prefix?: string;
    icons?: string[];
};

function App() {
    const { query: lastQuery, loading, results, searchIcons } = useIconSearch();
    const { collections, loading: collectionsLoading, error: collectionsError } = useIconifyCollections();

    const [query, setQuery] = useState<string>(lastQuery);
    const [selectedPrefix, setSelectedPrefix] = useState<string | null>(null);
    const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());
    const [downloadFormat, setDownloadFormat] = useState<'svg' | 'json'>('svg');
    const [downloadOptions, setDownloadOptions] = useState<DownloadCustomizationOptions>({
        subfolder: '',
        organizeByPrefix: false,
        applyColor: false,
        color: '#111827',
        forceMonochrome: true,
        zipEnabled: false,
        zipName: '',
    });
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [appToast, setAppToast] = useState<ToastPayload | null>(null);
    const [downloadHistory, setDownloadHistory] = useState<HistoryItem[]>([]);
    const [lastDownloadDir, setLastDownloadDir] = useState<string | null>(null);
    const [favoriteIcons, setFavoriteIcons] = useState<Set<string>>(new Set());
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [iconSortMode, setIconSortMode] = useState<'api' | 'az' | 'favorites'>('api');
    
    const { downloadIcons, status: downloadStatus, isGenerating, progress, clearStatus } = useDownload();
    const collectionIcons = useIconifyCollectionIcons(selectedPrefix, 240);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('appSettings');
            if (!raw) return;
            const parsed = JSON.parse(raw) as { downloadFormat?: 'svg' | 'json'; downloadOptions?: DownloadCustomizationOptions };
            if (parsed.downloadFormat === 'svg' || parsed.downloadFormat === 'json') {
                setDownloadFormat(parsed.downloadFormat);
            }
            if (parsed.downloadOptions && typeof parsed.downloadOptions === 'object') {
                setDownloadOptions((prev) => ({ ...prev, ...parsed.downloadOptions }));
            }
        } catch {
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('appSettings', JSON.stringify({ downloadFormat, downloadOptions }));
        } catch {
        }
    }, [downloadFormat, downloadOptions]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('downloadHistory');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setDownloadHistory(parsed);
            }
        } catch {
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory.slice(0, 25)));
        } catch {
        }
    }, [downloadHistory]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('favoriteIcons');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setFavoriteIcons(new Set(parsed.filter((v) => typeof v === 'string')));
            }
        } catch {
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('favoriteIcons', JSON.stringify(Array.from(favoriteIcons)));
        } catch {
        }
    }, [favoriteIcons]);

    useEffect(() => {
        if (!appToast) return;
        const t = window.setTimeout(() => setAppToast(null), 2200);
        return () => window.clearTimeout(t);
    }, [appToast]);

    const handleSearch = (q: string) => {
        searchIcons(q, { prefix: selectedPrefix });
    };

    const handleSelectPrefix = (prefix: string | null) => {
        setSelectedPrefix(prefix);
        searchIcons(query, { prefix });
    };

    const handleDownloadSelectedCollection = async () => {
        if (!selectedPrefix) return;
        if (collectionIcons.allIcons.length === 0) {
            await collectionIcons.reload();
        }
        if (collectionIcons.allIcons.length === 0) return;

        const confirmed = window.confirm(
            `Download all icons in "${selectedPrefix}"? (${collectionIcons.allIcons.length} icons)`
        );
        if (!confirmed) return;
        const res = await downloadIcons(new Set(collectionIcons.allIcons), downloadFormat, downloadOptions);
        if (res.ok) {
            setLastDownloadDir(res.targetDir);
            pushHistory({
                ts: Date.now(),
                kind: 'collection',
                label: `Collection ${selectedPrefix}`,
                count: collectionIcons.allIcons.length,
                format: downloadFormat,
                options: downloadOptions,
                targetDir: res.targetDir,
                prefix: selectedPrefix,
            });
        }
    };

    const toggleIconSelection = (iconName: string) => {
        const newSet = new Set(selectedIcons);
        if (newSet.has(iconName)) {
            newSet.delete(iconName);
        } else {
            newSet.add(iconName);
        }
        setSelectedIcons(newSet);
    };

    const handleClear = () => {
        setSelectedIcons(new Set());
        clearStatus();
    };

    const handleCopy = async (text: string) => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const el = document.createElement('textarea');
                el.value = text;
                el.style.position = 'fixed';
                el.style.left = '-9999px';
                document.body.appendChild(el);
                el.focus();
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
            }
            setAppToast({ type: 'success', message: 'Copied' });
        } catch {
            setAppToast({ type: 'error', message: 'Copy failed' });
        }
    };

    const toggleFavorite = (icon: string) => {
        setFavoriteIcons((prev) => {
            const next = new Set(prev);
            if (next.has(icon)) next.delete(icon);
            else next.add(icon);
            return next;
        });
    };

    const fetchAllCollectionIcons = async (prefix: string) => {
        const apiUrl = `https://api.iconify.design/collection?prefix=${encodeURIComponent(prefix)}`;
        const res = await axios.get<IconifyCollectionResponse>(apiUrl);
        const iconNames = new Set<string>();
        if (res.data.uncategorized) {
            res.data.uncategorized.forEach((name) => iconNames.add(`${prefix}:${name}`));
        }
        if (res.data.categories) {
            Object.values(res.data.categories).forEach((names) => {
                names.forEach((name) => iconNames.add(`${prefix}:${name}`));
            });
        }
        return Array.from(iconNames);
    };

    const makeId = () => {
        try {
            return crypto.randomUUID();
        } catch {
            return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        }
    };

    const pushHistory = (item: Omit<HistoryItem, 'id'>) => {
        const full: HistoryItem = { id: makeId(), ...item };
        setDownloadHistory((prev) => [full, ...prev].slice(0, 25));
    };

    const handleStartDownload = async () => {
        const icons = Array.from(selectedIcons);
        const res = await downloadIcons(new Set(icons), downloadFormat, downloadOptions);
        if (res.ok) {
            setLastDownloadDir(res.targetDir);
            pushHistory({
                ts: Date.now(),
                kind: 'selection',
                label: selectedPrefix ? `Selection in ${selectedPrefix}` : 'Selection',
                count: icons.length,
                format: downloadFormat,
                options: downloadOptions,
                targetDir: res.targetDir,
                prefix: selectedPrefix ?? undefined,
                icons,
            });
        }
    };

    const handleRerunHistory = async (id: string) => {
        const entry = downloadHistory.find((h) => h.id === id);
        if (!entry) return;
        try {
            if (entry.kind === 'selection' && entry.icons?.length) {
                const res = await downloadIcons(new Set(entry.icons), entry.format, entry.options);
                if (res.ok) setAppToast({ type: 'success', message: 'Re-run started' });
                return;
            }
            if (entry.kind === 'collection' && entry.prefix) {
                const icons = await fetchAllCollectionIcons(entry.prefix);
                const res = await downloadIcons(new Set(icons), entry.format, entry.options);
                if (res.ok) setAppToast({ type: 'success', message: 'Re-run started' });
            }
        } catch {
            setAppToast({ type: 'error', message: 'Re-run failed' });
        }
    };

    const handleClearHistory = () => {
        setDownloadHistory([]);
        setAppToast({ type: 'success', message: 'History cleared' });
    };

    const handleOpenHistoryFolder = async (id: string) => {
        const entry = downloadHistory.find((h) => h.id === id);
        const dir = entry?.targetDir;
        if (!dir) return;
        try {
            await window.electronAPI.openPath(dir);
        } catch {
            setAppToast({ type: 'error', message: 'Open folder failed' });
        }
    };

    useEffect(() => {
        const isEditableTarget = (target: EventTarget | null) => {
            if (!(target instanceof HTMLElement)) return false;
            const tag = target.tagName.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
            return Boolean(target.isContentEditable);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (isEditableTarget(e.target)) return;

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                const el = document.getElementById('global-search') as HTMLInputElement | null;
                el?.focus();
                el?.select();
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                setSettingsOpen(true);
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                if (selectedIcons.size > 0 && !isGenerating) {
                    void handleStartDownload();
                }
            }

            if (e.key === 'Escape' && settingsOpen) {
                setSettingsOpen(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleStartDownload, isGenerating, selectedIcons.size, settingsOpen]);

    const showingCollection = selectedPrefix !== null && query.trim().length === 0;

    const baseIcons = showingCollection ? collectionIcons.visibleIcons : results;
    const filteredIcons = showFavoritesOnly ? baseIcons.filter((i) => favoriteIcons.has(i)) : baseIcons;
    const iconsToShow = (() => {
        if (iconSortMode === 'az') return [...filteredIcons].sort((a, b) => a.localeCompare(b));
        if (iconSortMode === 'favorites') {
            return [...filteredIcons].sort((a, b) => {
                const af = favoriteIcons.has(a) ? 1 : 0;
                const bf = favoriteIcons.has(b) ? 1 : 0;
                if (af !== bf) return bf - af;
                return a.localeCompare(b);
            });
        }
        return filteredIcons;
    })();
    const listTitle = showingCollection
        ? `Collection: ${selectedPrefix} • Showing ${collectionIcons.visibleIcons.length} / ${collectionIcons.allIcons.length}`
        : selectedPrefix
            ? `Search in ${selectedPrefix}`
            : 'Search results';

    return (
        <div className="h-screen w-screen p-4">
            <div className="h-full w-full rounded-2xl border border-slate-200 bg-white/70 backdrop-blur overflow-hidden shadow-[0_10px_35px_rgba(15,23,42,0.12)] flex flex-col">
                <Toolbar 
                    onSearch={handleSearch}
                    query={query}
                    onQueryChange={setQuery}
                    activeCollectionPrefix={selectedPrefix}
                    downloadFormat={downloadFormat}
                    onDownloadFormatChange={setDownloadFormat}
                    onStart={handleStartDownload}
                    onClear={handleClear}
                    onOpenSettings={() => setSettingsOpen(true)}
                    canStart={selectedIcons.size > 0 && !isGenerating}
                    canClear={selectedIcons.size > 0}
                    loading={loading}
                />
                
                <InfoBar selectedCount={selectedIcons.size} />
                <DownloadProgressBar
                    active={Boolean(progress?.active && isGenerating)}
                    current={progress?.current ?? 0}
                    total={progress?.total ?? 0}
                    format={progress?.format ?? downloadFormat}
                    icon={progress?.icon}
                />
                
                <div className="flex-1 overflow-hidden relative p-4">
                    <div className="h-full rounded-2xl border border-slate-200 bg-white flex overflow-hidden shadow-sm">
                        <CollectionsPanel
                            collections={collections}
                            loading={collectionsLoading}
                            error={collectionsError}
                            selectedPrefix={selectedPrefix}
                            onSelectPrefix={handleSelectPrefix}
                            onCopyPrefix={handleCopy}
                            onDownloadSelected={handleDownloadSelectedCollection}
                            downloadDisabled={!selectedPrefix || collectionIcons.loading || isGenerating}
                            downloadFormat={downloadFormat}
                            downloadOptions={downloadOptions}
                            onDownloadOptionsChange={setDownloadOptions}
                            collectionStatsText={
                                selectedPrefix
                                    ? collectionIcons.loading
                                        ? 'Loading collection icons...'
                                        : collectionIcons.error
                                            ? collectionIcons.error
                                            : `${collectionIcons.allIcons.length} icons loaded`
                                    : undefined
                            }
                        />

                        <div className="flex-1 flex flex-col overflow-hidden">
                            <MainList 
                                icons={iconsToShow}
                                selectedIcons={selectedIcons}
                                onToggleSelect={toggleIconSelection}
                                favoriteIcons={favoriteIcons}
                                onToggleFavorite={toggleFavorite}
                                showFavoritesOnly={showFavoritesOnly}
                                onToggleShowFavoritesOnly={() => setShowFavoritesOnly((v) => !v)}
                                sortMode={iconSortMode}
                                onSortModeChange={setIconSortMode}
                                loading={loading || collectionIcons.loading}
                                title={listTitle}
                                hasMore={showingCollection && collectionIcons.hasMore}
                                onLoadMore={showingCollection ? collectionIcons.loadMore : undefined}
                            />
                        </div>
                    </div>

                    {downloadStatus.message && (
                        <div className="absolute bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
                            <div className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur bg-white/90 flex items-center gap-3 ${
                                downloadStatus.type === 'success'
                                    ? 'border-emerald-200 text-emerald-700'
                                    : 'border-rose-200 text-rose-700'
                            }`}>
                                {downloadStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span className="text-sm font-medium">{downloadStatus.message}</span>
                                {downloadStatus.type === 'success' && lastDownloadDir && (
                                    <button
                                        onClick={() => window.electronAPI.openPath(lastDownloadDir)}
                                        className="ml-2 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors"
                                    >
                                        Open
                                    </button>
                                )}
                                <button
                                    onClick={clearStatus}
                                    className="ml-2 text-gray-400 hover:text-gray-700 transition-colors"
                                    aria-label="Close"
                                >
                                    <SvgIcon svg={xSvg} size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {appToast && (
                        <div className="absolute bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
                            <ToastMessage toast={appToast} onClose={() => setAppToast(null)} />
                        </div>
                    )}
                </div>

                <StatusBar total={selectedIcons.size} />
            </div>

            <SettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                downloadFormat={downloadFormat}
                onDownloadFormatChange={setDownloadFormat}
                downloadOptions={downloadOptions}
                onDownloadOptionsChange={setDownloadOptions}
                history={downloadHistory.map<SettingsHistoryEntry>((h) => ({
                    id: h.id,
                    ts: h.ts,
                    kind: h.kind,
                    label: h.label,
                    count: h.count,
                    format: h.format,
                    canRerun: (h.kind === 'selection' && Boolean(h.icons?.length)) || (h.kind === 'collection' && Boolean(h.prefix)),
                    canOpenFolder: Boolean(h.targetDir),
                }))}
                onRerunHistory={handleRerunHistory}
                onOpenHistoryFolder={handleOpenHistoryFolder}
                onClearHistory={handleClearHistory}
            />
        </div>
    );
}

export default App;
