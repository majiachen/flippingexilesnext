// redis-league-data-fetcher.ts - Updated
import {NextApiRequest, NextApiResponse} from 'next';
import {redisConnection} from '@/app/hooks/API/redis_connection.ts';
import RedisDataFetcher from '@/app/hooks/API/RedisDataFetcher.ts';
import type {League} from '@/app/hooks/API/getLeagueData.ts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({message: 'Method not allowed'});
    }

    try {
        const fetcher = new RedisDataFetcher(redisConnection);
        const leagues = await fetcher.getLeaguesFromHash();

        const filteredLeagues = leagues.filter((league: League) => {
            return !league.Rules?.some((rule: { Id: string; }) => rule.Id === 'NoParties');
        });

        res.status(200).json({
            item: 'leagues',
            currency: 'all',
            data: filteredLeagues,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching league data from Redis:', error);
        res.status(500).json({
            message: 'Failed to fetch league data from Redis',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}