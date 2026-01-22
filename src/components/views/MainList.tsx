import React from 'react';
import { RefreshCw, Check, Star } from 'lucide-react';
import { IconPreview } from '../IconPreview';
import { SvgIcon } from '../ui/SvgIcon';
import chevronDownSvg from '../../assets/ui-icons/chevron-down.svg?raw';

interface MainListProps {
    icons: string[];
    selectedIcons: Set<string>;
    onToggleSelect: (icon: string) => void;
    favoriteIcons?: Set<string>;
    onToggleFavorite?: (icon: string) => void;
    showFavoritesOnly?: boolean;
    onToggleShowFavoritesOnly?: () => void;
    sortMode?: 'api' | 'az' | 'favorites';
    onSortModeChange?: (mode: 'api' | 'az' | 'favorites') => void;
    loading: boolean;
    title?: string;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

export const MainList: React.FC<MainListProps> = ({ icons, selectedIcons, onToggleSelect, favoriteIcons, onToggleFavorite, showFavoritesOnly, onToggleShowFavoritesOnly, sortMode, onSortModeChange, loading, title, hasMore, onLoadMore }) => {
    const isEmpty = icons.length === 0;

    if (loading) {
        return (
             <div className="flex-1 flex items-center justify-center bg-white p-10 select-none">
                 <div className="w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
             </div>
        );
    }

    if (isEmpty) {
        return (
            <div 
                className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50 p-10 select-none"
            >
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <div className="relative">
                        <RefreshCw size={72} className="text-indigo-600 drop-shadow-xl" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-700 mt-4">
                        Start Searching...
                    </h2>
                    <p className="text-gray-500 font-medium">
                        Type in the toolbar to find icons.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-white overflow-y-auto">
            {title && (
                <div className="sticky top-0 z-10 px-5 py-4 border-b border-slate-200 text-sm font-semibold text-slate-800 bg-white/90 backdrop-blur flex items-center justify-between gap-3">
                    <span className="truncate">{title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                        {onSortModeChange && (
                            <div className="h-9 rounded-xl border border-slate-200 bg-white shadow-sm p-1 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => onSortModeChange('api')}
                                    className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-colors ${
                                        sortMode === 'api' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                                    }`}
                                >
                                    API
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSortModeChange('az')}
                                    className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-colors ${
                                        sortMode === 'az' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                                    }`}
                                >
                                    A-Z
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSortModeChange('favorites')}
                                    className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-colors ${
                                        sortMode === 'favorites' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                                    }`}
                                    title="Favorites first"
                                >
                                    <Star size={13} className={sortMode === 'favorites' ? 'text-amber-200' : 'text-amber-500'} />
                                </button>
                            </div>
                        )}

                        {onToggleShowFavoritesOnly && (
                            <button
                                type="button"
                                onClick={onToggleShowFavoritesOnly}
                                className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                                    showFavoritesOnly
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:bg-slate-100'
                                }`}
                                title="Toggle favorites"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Star size={14} className={showFavoritesOnly ? 'text-amber-600' : 'text-slate-500'} />
                                    Favorites
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            )}
            <div className="p-5">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-4">
                {icons.map((icon) => (
                    <div key={icon} className="relative group">
                        {onToggleFavorite && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onToggleFavorite(icon);
                                }}
                                className="absolute top-2 left-2 z-10 h-7 w-7 rounded-lg border border-slate-200 bg-white/90 hover:bg-white active:bg-slate-100 shadow-sm grid place-items-center"
                                title="Favorite"
                                aria-label="Favorite"
                            >
                                <Star
                                    size={14}
                                    className={favoriteIcons?.has(icon) ? 'text-amber-500' : 'text-slate-400'}
                                    fill={favoriteIcons?.has(icon) ? 'currentColor' : 'none'}
                                />
                            </button>
                        )}
                        <IconPreview
                            name={icon}
                            onClick={() => onToggleSelect(icon)}
                            selected={selectedIcons.has(icon)}
                        />
                        {selectedIcons.has(icon) && (
                            <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md animate-in zoom-in ring-2 ring-white">
                                <Check size={12} strokeWidth={3} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {hasMore && onLoadMore && (
                <div className="flex justify-center pt-6">
                    <button
                        type="button"
                        onClick={onLoadMore}
                        className="px-5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm"
                    >
                        <span className="inline-flex items-center gap-2">
                            Load more
                            <SvgIcon svg={chevronDownSvg} size={16} className="text-slate-600" />
                        </span>
                    </button>
                </div>
            )}
            </div>
        </div>
    );
};
