"use client";
import {useEffect, useMemo, useState} from 'react';
import ChaosDivineToggleButtonWithImage from "../ChaosDivineToggleButton";
import useItemSalesData from '../../hooks/API/getItemSalesData';
import {EssenceImage} from "@/app/components/essence/EssenceImage";
// Import the actual League type from the hook
import type {League} from '../../hooks/API/getLeagueData';
import useLeagueData from '../../hooks/API/getLeagueData';
import {getEssenceOrder} from "@/app/components/essence/essenceImages";

const EssenceCalculator = ({onNavigate}: { onNavigate: (page: string) => void }) => {
    console.log('⚠️ COMPONENT FUNCTION EXECUTING ⚠️');
    const [currency, setCurrency] = useState<'Divine' | 'Chaos'>('Divine');
    const [expandedEssences, setExpandedEssences] = useState<Record<string, boolean>>({});
    const [selectedEssenceType, setSelectedEssenceType] = useState<string>('');
    const [debugMode, setDebugMode] = useState(false);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [selectedLeague, setSelectedLeague] = useState('Mercenaries');

    // Get league data
    const {leagues: leagueData, isLoading: isLeagueLoading} = useLeagueData();

    useEffect(() => {
        if (leagueData.length > 0) {
            setLeagues(leagueData);
            // Set default to first league if no selection yet
            if (!selectedLeague || !leagueData.some(league => league.Name === selectedLeague)) {
                setSelectedLeague(leagueData[0].Name);
            }
        }
    }, [leagueData, selectedLeague]);

    const {
        divineBatches,
        chaosBatches,
        divineTrades,
        chaosTrades,
        lastUpdated,
        isConnected,
        isLoading,
        error
    } = useItemSalesData('essence', currency, selectedLeague);

    // Debug function to toggle debug info
    const toggleDebug = () => {
        setDebugMode(prev => !prev);
    };

    const toggleEssenceExpansion = (essenceName: string) => {
        setExpandedEssences(prev => ({
            ...prev,
            [essenceName]: !prev[essenceName]
        }));
    };

    const formatTimeAgo = (date: Date | string | null): string => {
        if (!date) return 'Just now';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'Just now';

        const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        return `${Math.floor(seconds / 3600)} hours ago`;
    };

    const handleCurrencyChange = (newCurrency: 'Divine' | 'Chaos') => {
        setCurrency(newCurrency);
    };

    const handleEssenceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEssenceType(e.target.value);
    };

    const handleLeagueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLeague(e.target.value);
    };

    const getUniqueEssenceNames = useMemo(() => {
        const trades = currency === 'Divine' ? divineTrades : chaosTrades;
        console.log('trades data:', trades);

        // Get all unique essence names from trades with proper filtering
        const essenceNames = [...new Set(
            trades.map(trade => trade.typeLine).filter((name): name is string =>
                Boolean(name && name.trim() !== '')
            )
        )];

        console.info('Unique essence names before filtering:', essenceNames);

        // Apply filters if selected
        let filteredNames = essenceNames;

        if (selectedEssenceType === 'SHRIEKING') {
            filteredNames = essenceNames.filter(name => name.toUpperCase().includes('SHRIEKING'));
        } else if (selectedEssenceType === 'DEAFENING') {
            filteredNames = essenceNames.filter(name => name.toUpperCase().includes('DEAFENING'));
        } else if (selectedEssenceType === 'ELEVATED') {
            filteredNames = essenceNames.filter(name =>
                !name.toUpperCase().includes('SHRIEKING') &&
                !name.toUpperCase().includes('DEAFENING')
            );
        }

        // Sort strictly by custom essence order
        const sortedNames = [...filteredNames].sort((a, b) => {
            const orderA = getEssenceOrder(a);
            const orderB = getEssenceOrder(b);
            return orderA - orderB;
        });

        console.info('Final essence names in custom order:', sortedNames);

        return sortedNames;
    }, [currency, divineTrades, chaosTrades, selectedEssenceType]);

    const getTradesForEssence = (essenceName: string) => {
        const trades = currency === 'Divine' ? divineTrades : chaosTrades;

        // Filter trades by essence name with null check
        const essenceTrades = trades.filter(trade => {
            const matches = trade.typeLine === essenceName;
            if (matches && (!trade.typeLine || trade.typeLine.trim() === '')) {
                console.warn('Found trade with empty typeLine that matches essenceName:', essenceName, trade);
            }
            return matches;
        });

        console.log(`Found ${essenceTrades.length} trades for essence: ${essenceName}`);

        // Return a sorted copy of the array
        return [...essenceTrades].sort((a, b) => {
            // Your existing sorting logic here
            const extractPricePerUnit = (note: string): number => {
                if (!note) return Infinity;

                // Handle ~price 49/10 divine format (case insensitive)
                const priceFractionMatch = note.match(/~price\s+(\d+)\/(\d+)\s+(divine|chaos)/i);
                if (priceFractionMatch) {
                    const numerator = parseInt(priceFractionMatch[1]);
                    const denominator = parseInt(priceFractionMatch[2]);
                    return numerator / denominator;
                }

                // Handle ~b/o 1/21 divine format (case insensitive) - NEW PATTERN
                const boFractionMatch = note.match(/~b\/o\s+(\d+)\/(\d+)\s+(divine|chaos)/i);
                if (boFractionMatch) {
                    const numerator = parseInt(boFractionMatch[1]);
                    const denominator = parseInt(boFractionMatch[2]);
                    return numerator / denominator;
                }

                // Handle ~price 8 divine format (case insensitive)
                const priceSingleMatch = note.match(/~price\s+(\d+)\s+(divine|chaos)/i);
                if (priceSingleMatch) {
                    return parseInt(priceSingleMatch[1]);
                }

                // Handle ~b/o 20 divine format (case insensitive)
                const boSingleMatch = note.match(/~b\/o\s+(\d+)\s+(divine|chaos)/i);
                if (boSingleMatch) {
                    return parseInt(boSingleMatch[1]);
                }

                return Infinity;
            };

            const priceA = extractPricePerUnit(a.note || '');
            const priceB = extractPricePerUnit(b.note || '');

            return priceA - priceB;
        });
    };

    const getLatestBatchTime = (): number | null => {
        const trades = currency === 'Divine' ? divineTrades : chaosTrades;
        if (trades.length === 0) return null;

        const allTimes = trades.map(trade => new Date(trade.lastUpdated).getTime());
        return allTimes.length > 0 ? Math.max(...allTimes) : null;
    };

    // Extract price ratio from note for display
    const extractPriceRatio = (note: string): string => {
        if (!note) return 'N/A';

        // Handle ~price 49/10 divine format (case insensitive)
        const priceFractionMatch = note.match(/~price\s+(\d+)\/(\d+)\s+(divine|chaos)/i);
        if (priceFractionMatch) {
            const numerator = parseInt(priceFractionMatch[1]);
            const denominator = parseInt(priceFractionMatch[2]);
            return `${numerator}/${denominator}`;
        }

        // Handle ~b/o 1/21 divine format (case insensitive) - NEW PATTERN
        const boFractionMatch = note.match(/~b\/o\s+(\d+)\/(\d+)\s+(divine|chaos)/i);
        if (boFractionMatch) {
            const numerator = parseInt(boFractionMatch[1]);
            const denominator = parseInt(boFractionMatch[2]);
            return `${numerator}/${denominator}`;
        }

        // Handle ~price 8 divine format (case insensitive)
        const priceSingleMatch = note.match(/~price\s+(\d+)\s+(divine|chaos)/i);
        if (priceSingleMatch) {
            return `${priceSingleMatch[1]}/1`;
        }

        // Handle ~b/o 20 divine format (case insensitive)
        const boSingleMatch = note.match(/~b\/o\s+(\d+)\s+(divine|chaos)/i);
        if (boSingleMatch) {
            return `${boSingleMatch[1]}/1`;
        }

        return 'N/A';
    };

    if (isLoading || isLeagueLoading) {
        return <div className="bg-gray-900 text-gray-200 min-h-screen p-4 flex items-center justify-center">
            Loading trade data...
        </div>;
    }

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen p-4 h-full w-full text-base">
            <header className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                <h1 className="text-2xl text-yellow-500 font-bold">GAINS OF EXILE</h1>
                <div className="flex space-x-4">
                    <button className="px-2 py-1 bg-gray-500 rounded">ESSENCES</button>
                    <button
                        className="px-2 py-1 bg-gray-800 rounded"
                        onClick={() => onNavigate('fossils')}
                    >
                        FOSSILS
                    </button>
                    <button className="px-2 py-1 bg-gray-800 rounded">CATALYSTS</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">OILS</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">DELIRIUM ORBS</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">BREACHSTONES</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">EMBLEMS</button>
                </div>
                <div className="flex space-x-2">
                    <select
                        className="px-2 py-1 bg-gray-800"
                        name="essenceType"
                        id="essenceType"
                        value={selectedEssenceType}
                        onChange={handleEssenceTypeChange}
                    >
                        <option value="">All Essences</option>
                        <option value="ELEVATED">Elevated</option>
                        <option value="DEAFENING">Deafening</option>
                        <option value="SHRIEKING">Shrieking</option>
                    </select>
                    <ChaosDivineToggleButtonWithImage
                        currency={currency}
                        onToggle={handleCurrencyChange}
                    />
                    <button className="px-2 py-1 bg-gray-800 rounded">FAQ</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">FEEDBACK</button>
                    <select
                        className="px-2 py-1 bg-gray-800"
                        name="league"
                        id="league"
                        value={selectedLeague}
                        onChange={handleLeagueChange}
                    >
                        {leagues.map(league => (
                            <option key={league.Name} value={league.Name}>
                                LEAGUE: {league.Name}
                            </option>
                        ))}
                    </select>
                    <button
                        className="px-2 py-1 bg-gray-700 rounded text-xs"
                        onClick={toggleDebug}
                    >
                        {debugMode ? 'HIDE DEBUG' : 'DEBUG'}
                    </button>
                </div>
            </header>

            {error && (
                <div className="mb-4 p-4 bg-red-900 text-red-200 rounded">
                    <h3 className="text-lg font-semibold mb-2">Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {debugMode && (
                <div className="mb-4 p-4 bg-gray-800 rounded">
                    <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold">Divine Batches: {divineBatches.length}</h4>
                            <h4 className="font-semibold">Divine Trades: {divineTrades.length}</h4>
                            <ul className="text-xs">
                                {divineBatches.map((batch, i) => (
                                    <li key={`divine-${i}`}>
                                        {batch.length > 0 ? `${batch[0]?.typeLine}: ${batch.length} trades` : 'Empty batch'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold">Chaos Batches: {chaosBatches.length}</h4>
                            <h4 className="font-semibold">Chaos Trades: {chaosTrades.length}</h4>
                            <ul className="text-xs">
                                {chaosBatches.map((batch, i) => (
                                    <li key={`chaos-${i}`}>
                                        {batch.length > 0 ? `${batch[0]?.typeLine}: ${batch.length} trades` : 'Empty batch'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-semibold">Connection Status:</h4>
                        <p>isConnected: {isConnected ? 'true' : 'false'}</p>
                        <p>isLoading: {isLoading ? 'true' : 'false'}</p>
                        <p>Last Updated: {lastUpdated ? lastUpdated.toISOString() : 'null'}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-2">
                            {currency === 'Divine' ? 'Divine Orb Trades' : 'Chaos Orb Trades'}
                            <span className="ml-2 text-sm text-gray-400">
                                {lastUpdated ? `Last updated: ${formatTimeAgo(lastUpdated)}` : 'No updates yet'}
                                {getLatestBatchTime() && (
                                    <span> (Latest trade: {formatTimeAgo(new Date(getLatestBatchTime()!))})</span>
                                )}
                            </span>
                        </h2>

                        {getUniqueEssenceNames.length === 0 ? (
                            <div className="text-gray-400 py-4">
                                No {currency} trades available for selected essence types.
                                {!isConnected &&
                                    <div className="text-red-400">(Connection lost - attempting to reconnect...)</div>}
                            </div>
                        ) : (
                            getUniqueEssenceNames.map(essenceName => {
                                const trades = getTradesForEssence(essenceName);
                                return (
                                    <div key={essenceName} className="mb-4">
                                        <h3
                                            className="text-md font-semibold mb-2 cursor-pointer flex items-center"
                                            onClick={() => toggleEssenceExpansion(essenceName)}
                                        >
                                            <EssenceImage essenceName={essenceName}/>
                                            <span className="ml-2">{essenceName}</span>
                                            <span className="ml-2 text-sm text-gray-400">
                                                ({trades.length} trades)
                                            </span>
                                            <span className="ml-auto">
                                                {expandedEssences[essenceName] ? '▼' : '▶'}
                                            </span>
                                        </h3>
                                        {expandedEssences[essenceName] && trades.length > 0 && (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm border-separate border-spacing-0">
                                                    <thead className="text-gray-400 bg-gray-800 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left w-[120px]">Price Note</th>
                                                        <th className="px-4 py-2 text-left w-[100px] cursor-pointer">
                                                            Ratio {currency === 'Divine' ? '▼' : '▲'}
                                                        </th>
                                                        <th className="px-4 py-2 text-left w-[80px]">Stock</th>
                                                        <th className="px-4 py-2 text-left min-w-[200px]">Seller</th>
                                                        <th className="px-4 py-2 text-left w-[180px]">Updated</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {trades.map((trade, index) => (
                                                        <tr key={`${essenceName}-${index}`}
                                                            className="hover:bg-gray-800 even:bg-gray-850">
                                                            <td className="px-4 py-2 border-t border-gray-700">{trade.note}</td>
                                                            <td className="px-4 py-2 border-t border-gray-700">
                                                                {extractPriceRatio(trade.note)}
                                                            </td>
                                                            <td className="px-4 py-2 border-t border-gray-700">{trade.stackSize}</td>
                                                            <td className="px-4 py-2 border-t border-gray-700 truncate">
                                                                {trade.accountName}
                                                            </td>
                                                            <td className="px-4 py-2 border-t border-gray-700">
                                                                {formatTimeAgo(trade.lastUpdated)} ({trade.league})
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-between text-sm text-gray-400">
                <div>
                    <span>Connection: {isConnected ? '✅ Connected' : '❌ Disconnected'}</span>
                    {error && <span className="ml-4 text-red-400">Error: {error}</span>}
                </div>
            </div>
        </div>
    );
};

export default EssenceCalculator;