import type { FC } from 'react';
import { RefreshCw, Play } from 'lucide-react';

interface InfoBarProps {
    selectedCount: number;
}

export const InfoBar: FC<InfoBarProps> = ({ selectedCount }) => {
    return (
        <div className="bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-2 flex items-center justify-between text-xs font-medium text-gray-600 select-none">
            <div className="flex items-center gap-1">
                <RefreshCw size={14} className="text-purple-500" />
                <span>0</span>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 text-green-600">
                    <span className="font-bold">↓</span>
                    <span>0 bytes</span>
                </div>
                <div className="flex items-center gap-1 text-red-500">
                    <span className="font-bold">↑</span>
                    <span>0 bytes</span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Play size={14} className="text-green-600 fill-current" />
                <span>{selectedCount}</span>
            </div>
        </div>
    );
};
