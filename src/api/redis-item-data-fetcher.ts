// redis-item-data-fetcher.ts - Refactored Version with Stock Filtering
import {NextApiRequest, NextApiResponse} from 'next';
import {redisConnection} from '@/app/hooks/API/redis_connection';
import RedisDataFetcher from '@/app/hooks/API/RedisDataFetcher';

// Define TypeScript interfaces
interface PriceItem {
    Note: string;
    StackSize: number;
    AccountName: string;
    League: string;
    LastUpdated: string;
    BaseType: string;
    TypeLine: string;
}

interface ProcessedItem extends PriceItem {
    id: string;
}

interface RedisKeyValueObject {
    [key: string]: string; // Keys are strings, values are JSON strings of PriceItem
}

interface ItemWithDataProperty {
    itemData: RedisKeyValueObject;
}

interface RedisArrayItem extends Array<unknown> {
    0: string; // id
    1: string | RedisKeyValueObject; // data can be JSON string or key-value object
}

type RawRedisData = (ItemWithDataProperty | RedisArrayItem | RedisKeyValueObject | null)[];

// Helper functions for type guards and parsing
const isItemWithDataProperty = (item: unknown): item is ItemWithDataProperty => {
    return typeof item === 'object' && item !== null && 'itemData' in item;
};

const isRedisArrayItem = (item: unknown): item is RedisArrayItem => {
    return Array.isArray(item) && item.length >= 2 && typeof item[0] === 'string';
};

const isRedisKeyValueObject = (item: unknown): item is RedisKeyValueObject => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        return false;
    }

    // Check if all values are strings
    const obj = item as Record<string, unknown>;
    return Object.values(obj).every(value => typeof value === 'string');
};

const isString = (value: unknown): value is string => {
    return typeof value === 'string';
};

const parsePriceItem = (data: string): PriceItem => {
    return JSON.parse(data);
};

// Extract ratio from Note field and calculate required stack size
const extractRatioAndRequiredStack = (note: string): { ratio: number | null, requiredStack: number | null } => {
    try {
        // Match patterns like "~price 1/26 divine", "1/26 divine", "~b/o 1/10 chaos", etc.
        const ratioMatch = note.match(/(\d+)\/(\d+)/);
        if (ratioMatch) {
            const numerator = parseInt(ratioMatch[1]);
            const denominator = parseInt(ratioMatch[2]);
            const ratio = numerator / denominator;

            // The required stack size is the denominator (the amount being sold)
            return {ratio, requiredStack: denominator};
        }
        return {ratio: null, requiredStack: null};
    } catch (error) {
        console.error('Error extracting ratio from note:', note, error);
        return {ratio: null, requiredStack: null};
    }
};

// Check if item has sufficient stock
const hasSufficientStock = (note: string, stackSize: number): boolean => {
    const {requiredStack} = extractRatioAndRequiredStack(note);

    // If we can't parse the ratio, assume the item is valid
    if (requiredStack === null) {
        return true;
    }

    // Check if available stack size meets or exceeds the required amount
    return stackSize >= requiredStack;
};

// Process a single key-value pair from the RedisKeyValueObject
const processKeyValuePair = (key: string, value: string, index: number): ProcessedItem | null => {
    try {
        const itemData = parsePriceItem(value);
        return {
            id: key,
            ...itemData
        };
    } catch (error) {
        console.error(`Failed to process key-value pair with key "${key}" at index ${index}:`, error);
        return null;
    }
};

// Process RedisKeyValueObject (the main case for item.itemData)
const processKeyValueObject = (obj: RedisKeyValueObject, index: number): ProcessedItem[] => {
    return Object.entries(obj)
        .map(([key, value], subIndex) =>
            processKeyValuePair(key, value, index * 1000 + subIndex) // Create unique index for logging
        )
        .filter((item): item is ProcessedItem => item !== null);
};

// Refactored processItemData method
const processItemData = (rawData: RawRedisData): ProcessedItem[] => {
    if (!Array.isArray(rawData)) {
        console.error('Expected array but got:', typeof rawData);
        return [];
    }

    const results: ProcessedItem[] = [];

    rawData.forEach((item, index) => {
        try {
            if (!item) return;

            if (isItemWithDataProperty(item)) {
                // item.itemData is a RedisKeyValueObject - process all key-value pairs
                const processedItems = processKeyValueObject(item.itemData, index);
                results.push(...processedItems);
            } else if (isRedisArrayItem(item)) {
                // Handle array structure [id, data]
                const [rawId, rawData] = item;

                if (isString(rawData)) {
                    // If data is a JSON string, parse it as a single item
                    const processedItem = processKeyValuePair(rawId, rawData, index);
                    if (processedItem) results.push(processedItem);
                } else if (isRedisKeyValueObject(rawData)) {
                    // If data is a key-value object, process all pairs
                    const processedItems = processKeyValueObject(rawData, index);
                    results.push(...processedItems);
                }
            } else if (isRedisKeyValueObject(item)) {
                // Handle direct key-value object
                const processedItems = processKeyValueObject(item, index);
                results.push(...processedItems);
            } else {
                console.warn(`Unexpected item structure at index ${index}:`, item);
            }

        } catch (error) {
            console.error(`Failed to process item at index ${index}:`, error);
        }
    });

    return results;
};

// API Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({message: 'Method not allowed'});
    }

    const {item, currency, league} = req.query;

    if (!item || typeof item !== 'string' || !currency || typeof currency !== 'string' || !league || typeof league !== 'string') {
        return res.status(400).json({
            message: 'Bad Request',
            error: 'The "item", "currency", and "league" parameters are required and must be strings'
        });
    }

    try {
        const fetcher = new RedisDataFetcher(redisConnection);
        const itemTypesWithMetadata = await fetcher.getItemTypesWithMetadataFromHash(item, currency);

        // Process the array data with proper typing
        const processedData = processItemData(itemTypesWithMetadata as RawRedisData);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        // Filter by league AND sufficient stock
        const filteredData = processedData.filter((item: ProcessedItem) => {
            const isRecent = new Date(item.LastUpdated) >= oneDayAgo;
            const hasStock = hasSufficientStock(item.Note, item.StackSize);
            const isCorrectLeague = item.League === league;

            return isRecent && hasStock && isCorrectLeague;
        });

        res.status(200).json({
            item: item,
            currency: currency,
            data: filteredData,
            lastUpdated: new Date().toISOString(),
            count: filteredData.length
        });
    } catch (error) {
        console.error('Error fetching data from Redis:', error);
        res.status(500).json({
            message: 'Failed to fetch data from Redis',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}