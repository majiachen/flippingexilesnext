import {useCallback, useEffect, useState} from 'react';

export interface ProcessedTrade {
    league: string;
    note: string;
    stackSize: number;
    accountName: string;
    lastUpdated: Date;
    baseType: string;
    typeLine: string;
    indexed?: Date;
}

export interface redisStashTradeResult {
    stashProcessedTrade: ProcessedTrade;
}

export interface redisTradeResult {
    itemName: string;
    redisStashTradeResults: redisStashTradeResult[];
}

interface TradeStore {
    divineBatches: ProcessedTrade[][];
    chaosBatches: ProcessedTrade[][];
    lastUpdated: Date | null;
}

interface ApiResponse {
    item: string;
    currency: string;
    data: any[]; // This contains your actual trade data
    lastUpdated: string;
    count: number;
}

// Renamed to match the file name and purpose
export default function useItemSalesData(itemType: string, itemCurrency: string, leagueName: string) {
    const [tradeStore, setTradeStore] = useState<TradeStore>({
        divineBatches: [],
        chaosBatches: [],
        lastUpdated: null,
    });
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const getAllTrades = useCallback((batches: ProcessedTrade[][]) => batches.flat(), []);

    const fetchItemData = useCallback(async (itemName: string, currency: string): Promise<ApiResponse> => {
        try {
            const response = await fetch(
                `/api/redis-item-data-fetcher?item=${encodeURIComponent(itemName)}&currency=${encodeURIComponent(currency)}&league=${encodeURIComponent(leagueName)}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching item data:', error);
            throw error;
        }
    }, [leagueName]); // Added leagueName as dependency

    const fetchInitialCache = useCallback(async () => {
        try {
            console.log('[ItemSalesData] Fetching initial cache...');
            setIsLoading(true);
            setError(null);

            const responseData = await fetchItemData(itemType, itemCurrency);
            console.log('[ItemSalesData] Initial cache data:', responseData);

            // Categorize trades based on note content
            const divineBatches: ProcessedTrade[][] = [];
            const chaosBatches: ProcessedTrade[][] = [];

            // Access the data from the API response
            const tradesData = responseData.data;

            // If data is an array of trades, categorize them
            if (Array.isArray(tradesData)) {
                const trades: ProcessedTrade[] = tradesData.map((trade: any) => ({
                    league: trade.League,
                    note: trade.Note,
                    stackSize: trade.StackSize,
                    accountName: trade.AccountName,
                    lastUpdated: new Date(trade.LastUpdated),
                    baseType: trade.BaseType,
                    typeLine: trade.TypeLine,
                    // Add id if needed
                    id: trade.id,
                }));

                // Categorize trades based on note content
                const divineTrades: ProcessedTrade[] = [];
                const chaosTrades: ProcessedTrade[] = [];

                trades.forEach((trade) => {
                    if (trade.note && trade.note.toLowerCase().includes('divine')) {
                        divineTrades.push(trade);
                    } else if (trade.note && trade.note.toLowerCase().includes('chaos')) {
                        chaosTrades.push(trade);
                    }
                });

                divineBatches.push(divineTrades);
                chaosBatches.push(chaosTrades);
            }

            setTradeStore({
                divineBatches,
                chaosBatches,
                lastUpdated: new Date(responseData.lastUpdated),
            });
            setIsConnected(true);
        } catch (err) {
            console.error('[ItemSalesData] Failed to fetch initial cache:', err);
            setError(err instanceof Error ? err.message : 'Failed to load initial trade data');
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    }, [itemType, itemCurrency, fetchItemData]);

    useEffect(() => {
        fetchInitialCache();
    }, [fetchInitialCache]);

    // Debug effect to log state changes
    useEffect(() => {
        console.log('[ItemSalesData] State updated:', {
            divineBatches: tradeStore.divineBatches.length,
            chaosBatches: tradeStore.chaosBatches.length,
            lastUpdated: tradeStore.lastUpdated?.toISOString(),
            isConnected,
            isLoading,
            error,
        });
    }, [tradeStore, isConnected, isLoading, error]);

    return {
        divineBatches: tradeStore.divineBatches,
        chaosBatches: tradeStore.chaosBatches,
        divineTrades: getAllTrades(tradeStore.divineBatches),
        chaosTrades: getAllTrades(tradeStore.chaosBatches),
        lastUpdated: tradeStore.lastUpdated,
        isConnected,
        isLoading,
        error,
    };
}