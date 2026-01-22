import React, { useEffect, useState } from 'react';

const svgCache = new Map<string, string>();

interface IconProps {
    name: string;
    size?: number;
    className?: string;
    onClick?: () => void;
    selected?: boolean;
}

export const IconPreview: React.FC<IconProps> = ({ name, size = 32, className = '', onClick, selected }) => {
    const [svgContent, setSvgContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        let mounted = true;

        const cacheKey = `${name}@${size}`;
        const cached = svgCache.get(cacheKey);
        if (cached) {
            setSvgContent(cached);
            setIsLoading(false);
            return () => {
                mounted = false;
            };
        }

        setIsLoading(true);

        fetch(`https://api.iconify.design/${name}.svg?height=${size}`)
            .then(res => res.text())
            .then(svg => {
                if (!mounted) return;
                svgCache.set(cacheKey, svg);
                setSvgContent(svg);
            })
            .catch(() => {})
            .finally(() => {
                if (mounted) setIsLoading(false);
            });

        return () => { mounted = false; };
    }, [name, size]);

    return (
        <div
            className={`cursor-pointer border rounded-xl transition-all duration-200 group bg-white shadow-sm hover:shadow-md hover:border-blue-300
        ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} ${className}`}
            onClick={onClick}
        >
            <div className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 flex items-center justify-center">
                    {isLoading && !svgContent ? (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full animate-spin border-t-transparent" />
                    ) : (
                        <div
                            className="text-gray-800 group-hover:text-blue-600 transition-colors"
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                        />
                    )}
                </div>
                <span className="text-[10px] text-gray-500 truncate w-full px-2 mt-2" title={name}>
                    {name}
                </span>
            </div>
        </div>
    );
};
