// redis_connection.ts - UPDATED
import {createClient, RedisClientType} from 'redis';

export class RedisConnection {
    private client: RedisClientType;
    private isConnected: boolean = false;
    private connectionPromise: Promise<void> | null = null;
    private connectionUrl: string;

    constructor(url: string) {
        this.connectionUrl = url;
        this.client = createClient({url}) as RedisClientType;

        this.setupEventListeners();
    }

    async ensureConnected(): Promise<void> {
        if (this.isConnected) {
            return;
        }

        // If connection is in progress, wait for it
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = (async () => {
            try {
                console.log('Establishing Redis connection...');
                await this.client.connect();
                this.isConnected = true;
                console.log('Connected to Redis successfully');
            } catch (error) {
                console.error('Failed to connect to Redis:', error);
                this.isConnected = false;
                this.connectionPromise = null;
                throw error;
            }
        })();

        return this.connectionPromise;
    }

    async connect(): Promise<void> {
        return this.ensureConnected();
    }

    async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await this.client.disconnect();
            this.isConnected = false;
            this.connectionPromise = null;
            console.log('Disconnected from Redis successfully');
        } catch (error) {
            console.error('Failed to disconnect from Redis:', error);
            throw error;
        }
    }

    getClient(): RedisClientType {
        if (!this.isConnected) {
            throw new Error('Redis client is not connected. Call ensureConnected() first.');
        }
        return this.client;
    }

    isOpen(): boolean {
        return this.isConnected;
    }

    // Enhanced methods that automatically ensure connection
    async hGetAll(key: string): Promise<Record<string, string>> {
        await this.ensureConnected();
        try {
            return await this.client.hGetAll(key);
        } catch (error) {
            console.error(`Error getting hash ${key}:`, error);
            throw error;
        }
    }

    async hGet(key: string, field: string): Promise<string | null> {
        await this.ensureConnected();
        try {
            return await this.client.hGet(key, field);
        } catch (error) {
            console.error(`Error getting field ${field} from hash ${key}:`, error);
            throw error;
        }
    }

    async keys(pattern: string): Promise<string[]> {
        await this.ensureConnected();
        try {
            return await this.client.keys(pattern);
        } catch (error) {
            console.error(`Error getting keys with pattern ${pattern}:`, error);
            throw error;
        }
    }

    async get(key: string): Promise<string | null> {
        await this.ensureConnected();
        try {
            return await this.client.get(key);
        } catch (error) {
            console.error(`Error getting key ${key}:`, error);
            throw error;
        }
    }

    async sMembers(key: string): Promise<string[]> {
        await this.ensureConnected();
        try {
            return await this.client.sMembers(key);
        } catch (error) {
            console.error(`Error getting set members for ${key}:`, error);
            throw error;
        }
    }

    private setupEventListeners(): void {
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.isConnected = false;
            this.connectionPromise = null;
        });

        this.client.on('connect', () => {
            console.log('Redis client connecting...');
        });

        this.client.on('ready', () => {
            console.log('Redis client ready and connected');
            this.isConnected = true;
        });

        this.client.on('end', () => {
            console.log('Redis client disconnected');
            this.isConnected = false;
            this.connectionPromise = null;
        });
    }
}

const redisPassword = process.env.REDIS_PASSWORD;
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

const fullUrl = `redis://:${redisPassword}@${redisHost}:${redisPort}`;
console.log('Redis Client Connected:', fullUrl);
export const redisConnection = new RedisConnection(fullUrl);