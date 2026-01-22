import type { FC } from 'react';

type Props = {
    active: boolean;
    current: number;
    total: number;
    format: 'svg' | 'json';
    icon?: string;
};

export const DownloadProgressBar: FC<Props> = ({ active, current, total, format, icon }) => {
    const percent = total > 0 ? Math.min(100, Math.max(0, Math.round((current / total) * 100))) : 0;
    const label = format === 'svg' ? 'Downloading SVG' : 'Building JSON';
    const sub = icon ? icon : `${current}/${total}`;

    return (
        <div className={`px-4 ${active ? 'pb-3' : 'pb-0'}`}>
            <div
                className={`overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm transition-all duration-300 ${
                    active ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-slate-800">{label}</div>
                    <div className="text-[11px] text-slate-500 truncate">{sub}</div>
                    <div className="text-xs font-semibold tabular-nums text-slate-700">{percent}%</div>
                </div>

                <div className="px-4 pb-4">
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full rounded-full progress-shimmer"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

