import {useCallback, useEffect, useState} from 'react';

export interface League {
    Id: string;
    Name: string;
    Realm: string;
    Url: string;
    StartAt: string | null;
    EndAt: string | null;
    Description: string;
    Category: {
        Id: string;
        Current: boolean | null;
    };
    RegisterAt: string | null;
    DelveEvent: boolean;
    Rules: {
        Id: string;
        Name: string;
        Description: string;
    }[];
    Goal: string | null;
    TimedEvent: boolean;
}

interface LeagueStore {
    leagues: League[];
    lastUpdated: Date | null;
}

export default function useLeagueData() {
    const [leagueStore, setLeagueStore] = useState<LeagueStore>({
        leagues: [],
        lastUpdated: null,
    });
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLeagueData = useCallback(async (): Promise<League[]> => {
        try {
            // UPDATED: Using App Router API endpoint
            const response = await fetch('/api/leagues');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching league data:', error);
            throw error;
        }
    }, []);

    const fetchInitialCache = useCallback(async () => {
        try {
            console.log('[LeagueData] Fetching initial cache...');
            setIsLoading(true);
            setError(null);

            const leagues = await fetchLeagueData();

            setLeagueStore({
                leagues,
                lastUpdated: new Date(),
            });
            setIsConnected(true);
        } catch (err) {
            console.error('[LeagueData] Failed to fetch initial cache:', err);
            setError(err instanceof Error ? err.message : 'Failed to load league data');
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    }, [fetchLeagueData]);

    useEffect(() => {
        fetchInitialCache();
    }, [fetchInitialCache]);

    // Debug effect to log state changes
    useEffect(() => {
        console.log('[LeagueData] State updated:', {
            leagues: leagueStore.leagues.length,
            lastUpdated: leagueStore.lastUpdated?.toISOString(),
            isConnected,
            isLoading,
            error,
        });
    }, [leagueStore, isConnected, isLoading, error]);

    return {
        leagues: leagueStore.leagues,
        lastUpdated: leagueStore.lastUpdated,
        isConnected,
        isLoading,
        error,
    };
}