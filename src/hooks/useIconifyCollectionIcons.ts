import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

type IconifyCollectionResponse = {
    prefix: string;
    total: number;
    uncategorized?: string[];
    categories?: Record<string, string[]>;
    hidden?: string[];
    aliases?: Record<string, string>;
};

type State = {
    loading: boolean;
    error: string | null;
    allIcons: string[];
    visibleCount: number;
    total: number;
};

export function useIconifyCollectionIcons(prefix: string | null, pageSize = 200) {
    const [state, setState] = useState<State>({
        loading: false,
        error: null,
        allIcons: [],
        visibleCount: 0,
        total: 0,
    });

    const activePrefixRef = useRef<string | null>(null);

    const load = useCallback(async () => {
        if (!prefix) {
            setState({ loading: false, error: null, allIcons: [], visibleCount: 0, total: 0 });
            return;
        }

        activePrefixRef.current = prefix;
        setState((s) => ({ ...s, loading: true, error: null, allIcons: [], visibleCount: 0, total: 0 }));

        try {
            const apiUrl = `https://api.iconify.design/collection?prefix=${encodeURIComponent(prefix)}`;
            const res = await axios.get<IconifyCollectionResponse>(apiUrl);

            if (activePrefixRef.current !== prefix) return;

            const iconNames = new Set<string>();
            if (res.data.uncategorized) {
                res.data.uncategorized.forEach((name) => iconNames.add(`${prefix}:${name}`));
            }
            if (res.data.categories) {
                Object.values(res.data.categories).forEach((names) => {
                    names.forEach((name) => iconNames.add(`${prefix}:${name}`));
                });
            }

            const allIcons = Array.from(iconNames);
            setState({
                loading: false,
                error: null,
                allIcons,
                visibleCount: Math.min(pageSize, allIcons.length),
                total: res.data.total ?? allIcons.length,
            });
        } catch (e: any) {
            if (activePrefixRef.current !== prefix) return;
            setState((s) => ({
                ...s,
                loading: false,
                error: e?.message ?? 'Failed to load collection icons',
                allIcons: [],
                visibleCount: 0,
                total: 0,
            }));
        }
    }, [pageSize, prefix]);

    useEffect(() => {
        load();
    }, [load]);

    const loadMore = useCallback(() => {
        setState((s) => ({
            ...s,
            visibleCount: Math.min(s.visibleCount + pageSize, s.allIcons.length),
        }));
    }, [pageSize]);

    const visibleIcons = useMemo(() => {
        return state.allIcons.slice(0, state.visibleCount);
    }, [state.allIcons, state.visibleCount]);

    const hasMore = state.visibleCount < state.allIcons.length;

    return {
        ...state,
        visibleIcons,
        hasMore,
        loadMore,
        reload: load,
    };
}

