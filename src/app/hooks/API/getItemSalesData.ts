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
    id?: string;
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
    data: ProcessedTradeData[];
    lastUpdated: string;
    count: number;
}

interface ProcessedTradeData {
    League: string;
    Note: string;
    StackSize: number;
    AccountName: string;
    LastUpdated: string;
    BaseType: string;
    TypeLine: string;
    id?: string;
}

// Type guard to check if data matches ProcessedTradeData structure
const isProcessedTradeData = (data: unknown): data is ProcessedTradeData => {
    if (typeof data !== 'object' || data === null) {
        return false;
    }

    const obj = data as Record<string, unknown>;
    return (
        typeof obj.League === 'string' &&
        typeof obj.Note === 'string' &&
        typeof obj.StackSize === 'number' &&
        typeof obj.AccountName === 'string' &&
        typeof obj.LastUpdated === 'string' &&
        typeof obj.BaseType === 'string' &&
        typeof obj.TypeLine === 'string' &&
        (obj.id === undefined || typeof obj.id === 'string')
    );
};

// Type guard to check if data is an array of ProcessedTradeData
const isProcessedTradeDataArray = (data: unknown): data is ProcessedTradeData[] => {
    return Array.isArray(data) && data.every(isProcessedTradeData);
};

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
            // UPDATED: Using App Router API endpoint
            const response = await fetch(
                `/api/items?item=${encodeURIComponent(itemName)}&currency=${encodeURIComponent(currency)}&league=${encodeURIComponent(leagueName)}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: unknown = await response.json();

            // Validate the response structure
            if (typeof data === 'object' && data !== null) {
                const responseData = data as Record<string, unknown>;
                if (
                    typeof responseData.item === 'string' &&
                    typeof responseData.currency === 'string' &&
                    typeof responseData.lastUpdated === 'string' &&
                    typeof responseData.count === 'number' &&
                    isProcessedTradeDataArray(responseData.data)
                ) {
                    return data as ApiResponse;
                }
            }

            throw new Error('Invalid API response structure');
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
            if (isProcessedTradeDataArray(tradesData)) {
                const trades: ProcessedTrade[] = tradesData.map((trade: ProcessedTradeData) => ({
                    league: trade.League,
                    note: trade.Note,
                    stackSize: trade.StackSize,
                    accountName: trade.AccountName,
                    lastUpdated: new Date(trade.LastUpdated),
                    baseType: trade.BaseType,
                    typeLine: trade.TypeLine,
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