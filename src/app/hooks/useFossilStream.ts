import {useCallback, useEffect, useState} from 'react';

interface ProcessedTrade {
    currency: string;
    exchangeAmount: number;
    stock: number;
    seller: string;
    indexed: Date;
    whisper: string;
    league: string;
    language: string;
    itemCurrency: string;
    exchangeWhisper: string;
    itemWhisper: string;
    itemAmount: number;
    itemRatio: number;
    fossilName: string;
    fossilType: string;
}

interface TradeStore {
    divineBatches: ProcessedTrade[][];
    chaosBatches: ProcessedTrade[][];
    lastUpdated: Date | null;
}

export default function useFossilStream() {
    console.log("FOSSIL HOOK INITIALIZED");
    const MAX_BATCHES = 42;
    const [tradeStore, setTradeStore] = useState<TradeStore>({
        divineBatches: [],
        chaosBatches: [],
        lastUpdated: null
    });
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("FOSSIL EFFECT TRIGGERED - INITIAL FETCH");
        let isActive = true;

        const fetchInitialCache = async () => {
            try {
                console.log("Fetching initial fossil cache...");
                const response = await fetch('/api/fossil-cache', {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                    },
                });
                console.log("Fossil fetch completed, status:", response.status);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                console.log("Initial fossil cache data received:", data);

                if (isActive) {
                    setTradeStore(prev => ({
                        divineBatches: data.divineBatches?.map((batch: any[]) =>
                            batch?.map(trade => ({
                                ...trade,
                                indexed: new Date(trade.indexed)
                            })) || []
                        ) || prev.divineBatches,
                        chaosBatches: data.chaosBatches?.map((batch: any[]) =>
                            batch?.map(trade => ({
                                ...trade,
                                indexed: new Date(trade.indexed)
                            })) || []
                        ) || prev.chaosBatches,
                        lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : prev.lastUpdated
                    }));
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Failed to fetch initial fossil cache:', err);
                setError('Failed to load initial fossil data');
                setIsLoading(false);
            }
        };

        fetchInitialCache();

        return () => {
            console.log("Fossil component unmounting");
            isActive = false;
        };
    }, []);

    const connectToStream = useCallback(() => {
        setError(null);
        const eventSource = new EventSource('/api/kafka-fossil-stream');

        eventSource.onopen = () => {
            setIsConnected(true);
            setError(null);
            setRetryCount(0);
        };

        eventSource.onmessage = (event) => {
            try {
                if (event.data === ':ping') return;

                const data = JSON.parse(event.data);
                console.log('Fossil stream data received:', data);

                setTradeStore(prev => {
                    const mergeBatches = (prevBatches: ProcessedTrade[][], newBatches: any[]) => {
                        if (!newBatches || !Array.isArray(newBatches) || newBatches.length === 0) {
                            return prevBatches;
                        }

                        const updatedBatches = [...prevBatches];

                        newBatches.forEach(newBatch => {
                            if (!newBatch || !newBatch.length) return;

                            const fossilName = newBatch[0]?.fossilName;
                            if (!fossilName) return;

                            const processedBatch = newBatch.map((trade: any) => ({
                                ...trade,
                                indexed: new Date(trade.indexed)
                            }));

                            const existingIndex = updatedBatches.findIndex(b =>
                                b.length > 0 && b[0].fossilName === fossilName
                            );

                            if (existingIndex >= 0) {
                                updatedBatches[existingIndex] = processedBatch;
                            } else {
                                updatedBatches.push(processedBatch);
                            }
                        });

                        while (updatedBatches.length > MAX_BATCHES) {
                            updatedBatches.shift();
                        }

                        return updatedBatches;
                    };

                    return {
                        divineBatches: mergeBatches(prev.divineBatches, data.divineBatches),
                        chaosBatches: mergeBatches(prev.chaosBatches, data.chaosBatches),
                        lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : prev.lastUpdated
                    };
                });
            } catch (err) {
                console.error('Error parsing fossil message:', err);
                setError('Failed to parse fossil data');
            }
        };

        eventSource.onerror = (err) => {
            console.error('Fossil EventSource error:', err);
            setIsConnected(false);
            setError('Connection to fossil data lost');
            eventSource.close();

            const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
            setTimeout(() => {
                setRetryCount(prev => prev + 1);
                connectToStream();
            }, delay);
        };

        return () => eventSource.close();
    }, [retryCount]);

    useEffect(() => {
        if (isLoading) return;

        console.log("Connecting to fossil SSE stream...");
        const eventSource = connectToStream();

        return () => {
            if (eventSource && typeof eventSource === 'function') {
                console.log("Cleaning up fossil SSE connection");
                eventSource();
            }
        };
    }, [connectToStream, isLoading]);

    // Debug helper
    useEffect(() => {
        console.log('Fossil trade store updated:', {
            divineBatchesCount: tradeStore.divineBatches.length,
            chaosBatchesCount: tradeStore.chaosBatches.length,
            uniqueDivineFossils: new Set(tradeStore.divineBatches.map(b => b[0]?.fossilName).filter(Boolean)).size,
            uniqueChaosFossils: new Set(tradeStore.chaosBatches.map(b => b[0]?.fossilName).filter(Boolean)).size,
        });
    }, [tradeStore]);

    const getAllTrades = (batches: ProcessedTrade[][]) => batches.flat();

    console.log(" FOSSIL HOOK ABOUT TO RETURN ", {
        divineBatchesCount: tradeStore.divineBatches.length,
        isLoading,
        isConnected
    });

    return {
        divineBatches: tradeStore.divineBatches,
        chaosBatches: tradeStore.chaosBatches,
        divineTrades: getAllTrades(tradeStore.divineBatches),
        chaosTrades: getAllTrades(tradeStore.chaosBatches),
        lastUpdated: tradeStore.lastUpdated,
        error,
        isConnected,
        isLoading
    };
}