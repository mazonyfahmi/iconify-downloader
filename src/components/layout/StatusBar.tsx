import type { FC } from 'react';
import { SvgIcon } from '../ui/SvgIcon';
import checkSvg from '../../assets/ui-icons/check.svg?raw';
import clockSvg from '../../assets/ui-icons/clock.svg?raw';
import alertSvg from '../../assets/ui-icons/alert.svg?raw';
import checkCircleSvg from '../../assets/ui-icons/check-circle.svg?raw';
import pauseSvg from '../../assets/ui-icons/pause.svg?raw';
import downloadSvg from '../../assets/ui-icons/download.svg?raw';

interface StatusBarProps {
    total: number;
}

export const StatusBar: FC<StatusBarProps> = ({ total }) => {
    const filters = [
        { label: 'All', svg: checkSvg, count: total, active: true },
        { label: 'Downloading', svg: downloadSvg, count: 0 },
        { label: 'Paused', svg: pauseSvg, count: 0 },
        { label: 'Complete', svg: checkCircleSvg, count: 0 },
        { label: 'Waiting', svg: clockSvg, count: 0 },
        { label: 'Error', svg: alertSvg, count: 0 },
    ];

    return (
        <div className="bg-white/80 backdrop-blur border-t border-slate-200 px-3 py-2 flex items-center gap-3 text-xs select-none overflow-x-auto">
            <button className="h-9 w-9 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors grid place-items-center">
                <div className="w-4 h-4 border border-slate-400 rounded-sm bg-white"></div>
            </button>
            
            {filters.map((filter) => (
                <button
                    key={filter.label}
                    type="button"
                    className={`h-9 px-3 rounded-xl border shadow-sm flex items-center gap-2 transition-colors ${
                        filter.active
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                    }`}
                >
                    <SvgIcon svg={filter.svg} size={14} className={filter.active ? 'text-white' : 'text-slate-700'} />
                    <span className="font-semibold">{filter.label}</span>
                    <span className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] ${
                        filter.active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                        {filter.count}
                    </span>
                </button>
            ))}
        </div>
    );
};
