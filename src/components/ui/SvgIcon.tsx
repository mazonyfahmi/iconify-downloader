import type { CSSProperties, FC } from 'react';

type Props = {
    svg: string;
    size?: number;
    className?: string;
    title?: string;
};

export const SvgIcon: FC<Props> = ({ svg, size = 16, className, title }) => {
    const style: CSSProperties = { width: size, height: size };
    return (
        <span
            className={`svg-icon inline-flex items-center justify-center ${className ?? ''}`}
            style={style}
            title={title}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};

