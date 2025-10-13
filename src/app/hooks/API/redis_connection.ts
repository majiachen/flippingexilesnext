// redis_connection.ts - UPDATED FOR GITHUB ACTIONS
import {createClient, RedisClientType} from 'redis';

// Mock client for build time
class MockRedisClient {
    async connect(): Promise<void> {
        console.log('Mock Redis: connect called');
    }

    async disconnect(): Promise<void> {
        console.log('Mock Redis: disconnect called');
    }

    async hGetAll(key: string): Promise<Record<string, string>> {
        console.log('Mock Redis: hGetAll called for key:', key);
        return {};
    }

    async hGet(key: string, field: string): Promise<string | null> {
        console.log('Mock Redis: hGet called for key:', key, 'field:', field);
        return null;
    }

    async keys(pattern: string): Promise<string[]> {
        console.log('Mock Redis: keys called with pattern:', pattern);
        return [];
    }

    async get(key: string): Promise<string | null> {
        console.log('Mock Redis: get called for key:', key);
        return null;
    }

    async sMembers(key: string): Promise<string[]> {
        console.log('Mock Redis: sMembers called for key:', key);
        return [];
    }

    on(event: string, listener: (...args: unknown[]) => void): MockRedisClient {
        console.log('Mock Redis: event listener attached for', event);
        return this;
    }
}

type RedisClient = RedisClientType | MockRedisClient;

export class RedisConnection {
    private client: RedisClient;
    private isConnected: boolean = false;
    private connectionPromise: Promise<void> | null = null;
    private connectionUrl: string;
    private isMock: boolean = false;

    constructor(url?: string) {
        this.connectionUrl = url || this.constructRedisUrl();

        // Use mock client during build or if URL is invalid
        if (this.shouldUseMock() || !this.isValidRedisUrl(this.connectionUrl)) {
            this.client = new MockRedisClient();
            this.isMock = true;
            console.log('Using mock Redis client for build');
        } else {
            this.client = createClient({url: this.connectionUrl}) as RedisClientType;
            this.setupEventListeners();
        }
    }

    async ensureConnected(): Promise<void> {
        if (this.isMock) {
            return; // Mock client is always "connected"
        }

        if (this.isConnected) {
            return;
        }

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = (async () => {
            try {
                console.log('Establishing Redis connection...');
                await (this.client as RedisClientType).connect();
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
        if (this.isMock || !this.isConnected) {
            return;
        }

        try {
            await (this.client as RedisClientType).disconnect();
            this.isConnected = false;
            this.connectionPromise = null;
            console.log('Disconnected from Redis successfully');
        } catch (error) {
            console.error('Failed to disconnect from Redis:', error);
            throw error;
        }
    }

    getClient(): RedisClientType {
        if (this.isMock) {
            throw new Error('Cannot get real Redis client when using mock');
        }
        if (!this.isConnected) {
            throw new Error('Redis client is not connected. Call ensureConnected() first.');
        }
        return this.client as RedisClientType;
    }

    isOpen(): boolean {
        return this.isMock || this.isConnected;
    }

    isMockClient(): boolean {
        return this.isMock;
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

    private constructRedisUrl(): string {
        const redisPassword = process.env.REDIS_PASSWORD;
        const redisHost = process.env.REDIS_HOST;
        const redisPort = process.env.REDIS_PORT;

        if (!redisPassword || !redisHost || !redisPort) {
            return 'redis://:undefined@undefined:undefined';
        }

        return `redis://:${redisPassword}@${redisHost}:${redisPort}`;
    }

    private isValidRedisUrl(url: string): boolean {
        try {
            new URL(url);
            return !url.includes('undefined');
        } catch {
            return false;
        }
    }

    private shouldUseMock(): boolean {
        // Use mock during build or if explicitly disabled
        return process.env.NODE_ENV === 'production' &&
            !process.env.REDIS_HOST ||
            process.env.USE_MOCK_REDIS === 'true';
    }

    private setupEventListeners(): void {
        if (this.isMock) return;

        const realClient = this.client as RedisClientType;

        realClient.on('error', (err: Error) => {
            console.error('Redis Client Error:', err);
            this.isConnected = false;
            this.connectionPromise = null;
        });

        realClient.on('connect', () => {
            console.log('Redis client connecting...');
        });

        realClient.on('ready', () => {
            console.log('Redis client ready and connected');
            this.isConnected = true;
        });

        realClient.on('end', () => {
            console.log('Redis client disconnected');
            this.isConnected = false;
            this.connectionPromise = null;
        });
    }
}

// Create connection - will use mock during build
function createRedisConnection(): RedisConnection {
    const redisPassword = process.env.REDIS_PASSWORD;
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;

    if (redisPassword && redisHost && redisPort) {
        const fullUrl = `redis://:${redisPassword}@${redisHost}:${redisPort}`;
        return new RedisConnection(fullUrl);
    } else {
        console.warn('Redis environment variables missing, using mock Redis client');
        return new RedisConnection();
    }
}

export const redisConnection = createRedisConnection();