import type { FC } from 'react';
import { SvgIcon } from './SvgIcon';
import checkCircleSvg from '../../assets/ui-icons/check-circle.svg?raw';
import alertSvg from '../../assets/ui-icons/alert.svg?raw';
import xSvg from '../../assets/ui-icons/x.svg?raw';

export type ToastPayload = { type: 'success' | 'error'; message: string };

type Props = {
    toast: ToastPayload;
    onClose: () => void;
};

export const ToastMessage: FC<Props> = ({ toast, onClose }) => {
    return (
        <div className="rounded-xl border px-4 py-3 shadow-lg backdrop-blur bg-white/90 flex items-center gap-3">
            <div className={toast.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}>
                <SvgIcon svg={toast.type === 'success' ? checkCircleSvg : alertSvg} size={18} />
            </div>
            <span className={`text-sm font-medium ${toast.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {toast.message}
            </span>
            <button
                onClick={onClose}
                className="ml-2 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
            >
                <SvgIcon svg={xSvg} size={16} />
            </button>
        </div>
    );
};

