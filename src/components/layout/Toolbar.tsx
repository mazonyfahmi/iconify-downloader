import type { CSSProperties, FC, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { SvgIcon } from '../ui/SvgIcon';
import searchSvg from '../../assets/ui-icons/search.svg?raw';
import downloadSvg from '../../assets/ui-icons/download.svg?raw';
import pauseSvg from '../../assets/ui-icons/pause.svg?raw';
import trashSvg from '../../assets/ui-icons/trash.svg?raw';
import settingsSvg from '../../assets/ui-icons/settings.svg?raw';

interface ToolbarProps {
    onSearch: (query: string) => void;
    query: string;
    onQueryChange: (query: string) => void;
    activeCollectionPrefix?: string | null;
    downloadFormat: 'svg' | 'json';
    onDownloadFormatChange: (format: 'svg' | 'json') => void;
    onStart: () => void;
    onClear: () => void;
    onOpenSettings: () => void;
    canStart: boolean;
    canClear: boolean;
    loading?: boolean;
}

export const Toolbar: FC<ToolbarProps> = ({ onSearch, query, onQueryChange, activeCollectionPrefix, downloadFormat, onDownloadFormatChange, onStart, onClear, onOpenSettings, canStart, canClear, loading }) => {
    const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <div className="bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between select-none relative h-16">
            <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ WebkitAppRegion: 'drag' } as CSSProperties} />

            <div className="flex items-center gap-4 pl-2 z-10 shrink-0" style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}>
                <div className="flex items-center gap-2 mr-4">
                     <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-72">
                        <div className="relative flex-1">
                            <input 
                                name="query"
                                type="text" 
                                placeholder={activeCollectionPrefix ? `Search in ${activeCollectionPrefix}...` : 'Search icons...'} 
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                                id="global-search"
                                className="w-full pl-9 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 shadow-sm"
                            />
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <SvgIcon svg={searchSvg} size={14} />}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                            title="Search"
                        >
                            <SvgIcon svg={searchSvg} size={16} className="text-slate-700" />
                        </button>
                    </form>
                </div>

                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                <div className="h-10 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-sm p-1 flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onDownloadFormatChange('svg')}
                        className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors ${
                            downloadFormat === 'svg'
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-700 hover:bg-white active:bg-slate-100'
                        }`}
                        title="Download as SVG files"
                    >
                        SVG
                    </button>
                    <button
                        type="button"
                        onClick={() => onDownloadFormatChange('json')}
                        className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors ${
                            downloadFormat === 'json'
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-700 hover:bg-white active:bg-slate-100'
                        }`}
                        title="Download as JSON collection"
                    >
                        JSON
                    </button>
                </div>

                <button 
                    onClick={onStart}
                    disabled={!canStart}
                    className={`h-10 w-10 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center transition-colors ${
                        !canStart ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 active:bg-slate-100'
                    }`}
                    title={downloadFormat === 'svg' ? 'Download selected as SVG files' : 'Download selected as JSON collection'}
                >
                    <SvgIcon svg={downloadSvg} size={18} className="text-amber-600" />
                </button>

                <button 
                    className="h-10 w-10 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center opacity-40 cursor-not-allowed"
                    title="Pause (Not implemented)"
                >
                    <SvgIcon svg={pauseSvg} size={18} className="text-emerald-600" />
                </button>

                <button 
                    onClick={onClear}
                    disabled={!canClear}
                    className={`h-10 w-10 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center transition-colors ${
                        !canClear ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 active:bg-slate-100'
                    }`}
                    title="Clear All"
                >
                    <SvgIcon svg={trashSvg} size={18} className="text-amber-600" />
                </button>
            </div>

            <div className="z-10 pr-2" style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}>
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="h-10 w-10 rounded-xl border border-slate-200 bg-white shadow-sm grid place-items-center text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    title="Settings"
                    aria-label="Settings"
                >
                    <SvgIcon svg={settingsSvg} size={18} />
                </button>
            </div>
        </div>
    );
};
