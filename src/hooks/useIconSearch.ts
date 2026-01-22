import { useState, useCallback } from 'react';
import axios from 'axios';

interface IconifySearchResult {
    icons: string[];
    total: number;
    limit: number;
    start: number;
    collections: Record<string, { name: string; author?: { name: string } }>;
}

type SearchOptions = {
    prefix?: string | null;
    limit?: number;
};

export function useIconSearch() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const [activePrefix, setActivePrefix] = useState<string | null>(null);

    const searchIcons = useCallback(async (searchQuery: string, options?: SearchOptions) => {
        const trimmed = searchQuery.trim();
        const prefix = options?.prefix ?? null;
        const limit = options?.limit ?? 64;

        setLoading(true);
        
        setActivePrefix(prefix);
        setQuery(trimmed);

        try {
            if (!trimmed) {
                setResults([]);
                return;
            }

            const apiUrl = `https://api.iconify.design/search?query=${encodeURIComponent(trimmed)}&limit=${limit}${
                prefix ? `&prefix=${encodeURIComponent(prefix)}` : ''
            }`;
            const response = await axios.get<IconifySearchResult>(apiUrl);

            if (response.data?.icons) {
                setResults(response.data.icons);
            } else {
                setResults([]);
            }
        } catch (error) {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { query, loading, results, activePrefix, searchIcons };
}
