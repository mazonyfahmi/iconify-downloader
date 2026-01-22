import { useEffect, useMemo, useState } from 'react';

export interface IconifyCollectionInfo {
    prefix: string;
    name: string;
    total?: number;
    authorName?: string;
}

type IconifyCollectionsResponse = Record<
    string,
    {
        name?: string;
        total?: number;
        author?: { name?: string };
    }
>;

export function useIconifyCollections() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [collectionsMap, setCollectionsMap] = useState<IconifyCollectionsResponse>({});

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('https://api.iconify.design/collections');
                if (!res.ok) throw new Error(`Failed to load collections (${res.status})`);
                const data = (await res.json()) as IconifyCollectionsResponse;
                if (!cancelled) setCollectionsMap(data);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? 'Failed to load collections');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const collections = useMemo<IconifyCollectionInfo[]>(() => {
        return Object.entries(collectionsMap)
            .map(([prefix, info]) => ({
                prefix,
                name: info?.name || prefix,
                total: info?.total,
                authorName: info?.author?.name,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [collectionsMap]);

    return { collections, loading, error };
}

