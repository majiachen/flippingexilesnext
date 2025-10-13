// RedisDataFetcher.ts - COMPLETE VERSION
import {RedisConnection} from '@/app/hooks/API/redis_connection';

interface ItemData {
    [key: string]: string;
}

interface LeagueObject {
    id: string;

    [key: string]: unknown;
}

export default class RedisDataFetcher {
    private redisConnection: RedisConnection;

    constructor(redisConnection: RedisConnection) {
        this.redisConnection = redisConnection;
    }

    /**
     * Fetch all values from the Redis set called 'item:types'
     * @returns {Promise<Array>} Array of all values in the set
     */
    async getAllItemTypes(): Promise<string[]> {
        await this.ensureConnection();
        try {
            const client = this.redisConnection.getClient();
            return await client.sMembers('item:types');
        } catch (error) {
            console.error('Error fetching item:types set:', error);
            throw error;
        }
    }

    /**
     * Fetch all values from the Redis set called 'item:types' with additional metadata
     * @returns {Promise<Object>} Object containing values and metadata
     */
    async getItemTypesWithMetadata(): Promise<{ values: string[] }> {
        await this.ensureConnection();
        try {
            const client = this.redisConnection.getClient();
            const values = await client.sMembers('item:types');
            return {
                values
            };
        } catch (error) {
            console.error('Error fetching item:types set with metadata:', error);
            throw error;
        }
    }

    /**
     * Fetch metadata for specific item type from Redis hashtable
     * @param {string} itemType - Item type to filter results
     * @param currencyType
     * @returns {Promise<Array>} Array of objects containing item type and its metadata
     */
    async getItemTypesWithMetadataFromHash(itemType: string, currencyType: string): Promise<{
        itemName: string;
        itemData: ItemData
    }[]> {
        await this.ensureConnection();
        try {
            // Get all item types with metadata
            let {values} = await this.getItemTypesWithMetadata();

            values = values.filter(value => value.includes('type:' + itemType));

            // Create an array to store all the results
            const results: { itemName: string; itemData: ItemData }[] = [];

            // For each item type, fetch its metadata from Redis hash
            for (const itemName of values) {
                const client = this.redisConnection.getClient();
                // Fetch all fields and values from the hash for this item type
                const itemData = await client.hGetAll(`${itemName}:${currencyType}`);
                results.push({
                    itemName,
                    itemData
                });
            }

            return results;
        } catch (error) {
            console.error('Error fetching item types with metadata from hash:', error);
            throw error;
        }
    }

    /**
     * Fetch all leagues from Redis FlippingExilesPublicStashAPI.LeagueNames storage
     * @returns {Promise<Array>} Array of league objects
     */
    async getLeaguesFromHash(): Promise<LeagueObject[]> {
        await this.ensureConnection();
        try {
            const client = this.redisConnection.getClient();
            const leaguesString = await client.get('FlippingExilesPublicStashAPI.LeagueNames');

            if (!leaguesString) {
                return [];
            }

            // Parse the JSON string to get an array of league objects
            const leagues: unknown = JSON.parse(leaguesString);

            // Validate that it's an array of league objects
            if (Array.isArray(leagues) && leagues.every(league =>
                typeof league === 'object' && league !== null && 'Id' in league
            )) {
                return leagues as LeagueObject[];
            }

            throw new Error('Invalid league data structure');
        } catch (error) {
            console.error('Error fetching leagues from Redis:', error);
            throw error;
        }
    }

    /**
     * Enhanced version of getAllItemTypes with retry logic
     */
    async getAllItemTypesWithRetry(): Promise<string[]> {
        return this.executeWithRetry(async () => {
            const client = this.redisConnection.getClient();
            return await client.sMembers('item:types');
        });
    }

    /**
     * Enhanced version of getItemTypesWithMetadata with retry logic
     */
    async getItemTypesWithMetadataWithRetry(): Promise<{ values: string[] }> {
        return this.executeWithRetry(async () => {
            const client = this.redisConnection.getClient();
            const values = await client.sMembers('item:types');
            return {values};
        });
    }

    /**
     * Ensure connection is established before operations
     */
    private async ensureConnection(): Promise<void> {
        await this.redisConnection.ensureConnected();
    }

    /**
     * Enhanced method with retry logic for connection issues
     */
    private async executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
        let lastError: Error;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                await this.ensureConnection();
                return await operation();
            } catch (error) {
                lastError = error as Error;
                console.error(`Operation attempt ${attempt + 1} failed:`, error);

                if (attempt < maxRetries && this.isConnectionError(error)) {
                    console.log('Attempting to reconnect...');
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000));

                }
            }
        }

        throw lastError!;
    }

    /**
     * Check if error is connection-related
     */
    private isConnectionError(error: unknown): boolean {
        if (!(error instanceof Error)) {
            return false;
        }

        const errorMessage = error.message.toLowerCase();
        return errorMessage.includes('closed') ||
            errorMessage.includes('not connected') ||
            errorMessage.includes('connection') ||
            errorMessage.includes('socket');
    }
}