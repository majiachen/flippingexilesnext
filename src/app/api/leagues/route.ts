// route.ts - Updated
import {redisConnection} from '@/app/hooks/API/redis_connection';
import RedisDataFetcher from '../../hooks/API/RedisDataFetcher';

// Use the same interface that RedisDataFetcher uses
interface LeagueObject {
    id: string;
    Name?: string;
    Rules?: Array<{ Id: string; [key: string]: unknown }>;

    [key: string]: unknown;
}

export async function GET() {
    try {
        const fetcher = new RedisDataFetcher(redisConnection);
        const leagues = await fetcher.getLeaguesFromHash();

        const filteredLeagues = leagues.filter((league: LeagueObject) => {
            return !league.Rules?.some((rule: { Id: string; [key: string]: unknown }) => rule.Id === 'NoParties');
        });

        return new Response(
            JSON.stringify({
                item: 'leagues',
                currency: 'all',
                data: filteredLeagues,
                lastUpdated: new Date().toISOString(),
            }),
            {status: 200, headers: {'Content-Type': 'application/json'}}
        );
    } catch (error) {
        console.error('Error fetching league data from Redis:', error);
        return new Response(
            JSON.stringify({
                message: 'Failed to fetch league data from Redis',
                error: error instanceof Error ? error.message : 'Unknown error'
            }),
            {status: 500, headers: {'Content-Type': 'application/json'}}
        );
    }
}