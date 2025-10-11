"use client";
import {useMemo, useState} from 'react';
import ChaosDivineToggleButtonWithImage from "../ChaosDivineToggleButton.tsx";
import useFossilStream from '../../hooks/useFossilStream';
import FossilImage from "./FossilImage.tsx";

const FossilCalculator = ({onNavigate}: { onNavigate: (page: string) => void }) => {
    console.log('⚠️ FOSSIL COMPONENT FUNCTION EXECUTING ⚠️');
    const [currency, setCurrency] = useState<'divine' | 'chaos'>('divine');
    const [expandedFossils, setExpandedFossils] = useState<Record<string, boolean>>({});
    const [selectedFossilType, setSelectedFossilType] = useState<string>('');
    const [debugMode, setDebugMode] = useState(false);

    const {
        divineBatches,
        chaosBatches,
        lastUpdated,
        error,
        isConnected,
        isLoading
    } = useFossilStream();

    // Debug function to toggle debug info
    const toggleDebug = () => {
        setDebugMode(prev => !prev);
    };

    const toggleFossilExpansion = (fossilName: string) => {
        setExpandedFossils(prev => ({
            ...prev,
            [fossilName]: !prev[fossilName]
        }));
    };

    const formatTimeAgo = (date: Date | string | null) => {
        if (!date) return 'Just now';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'Just now';

        const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        return `${Math.floor(seconds / 3600)} hours ago`;
    };

    const handleCurrencyChange = (newCurrency: 'divine' | 'chaos') => {
        setCurrency(newCurrency);
    };

    const handleFossilTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFossilType(e.target.value);
    };

    const getUniqueFossilNames = useMemo(() => {
        const batches = currency === 'divine' ? divineBatches : chaosBatches;
        console.log('batches', batches);

        // Get all unique fossil names from batches
        const fossilNames = [...new Set(
            batches.flatMap(batch =>
                batch.length > 0 ? [batch[0].fossilName] : []
            )
        )].filter(Boolean);

        // Apply filters if selected
        if (selectedFossilType === 'PRIMITIVE') {
            return fossilNames.filter(name => name.toUpperCase().includes('PRIMITIVE')).sort();
        } else if (selectedFossilType === 'DEFT') {
            return fossilNames.filter(name => name.toUpperCase().includes('DEFT')).sort();
        }

        return fossilNames.sort((a, b) => a.localeCompare(b));
    }, [currency, divineBatches, chaosBatches, selectedFossilType]);

    const getTradesForFossil = (fossilName: string) => {
        const batches = currency === 'divine' ? divineBatches : chaosBatches;
        return batches.find(batch =>
            batch.length > 0 && batch[0].fossilName === fossilName
        ) || [];
    };

    const getLatestBatchTime = () => {
        const batches = currency === 'divine' ? divineBatches : chaosBatches;
        if (batches.length === 0) return null;

        const allTimes = batches.flatMap(batch =>
            batch.map(t => new Date(t.indexed).getTime())
        );

        return allTimes.length > 0 ? Math.max(...allTimes) : null;
    };

    if (error) {
        return (
            <div className="bg-gray-900 text-gray-200 min-h-screen p-4 flex flex-col items-center justify-center">
                <h2 className="text-red-500 text-xl mb-4">Error: {error}</h2>
                <button
                    className="px-4 py-2 bg-yellow-600 rounded"
                    onClick={() => window.location.reload()}
                >
                    Reload Page
                </button>
            </div>
        );
    }

    if (isLoading) {
        return <div className="bg-gray-900 text-gray-200 min-h-screen p-4 flex items-center justify-center">
            Loading trade data...
        </div>;
    }

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen p-4 h-full w-full text-base">
            <header className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                <h1 className="text-2xl text-yellow-500 font-bold">GAINS OF EXILE</h1>
                <div className="flex space-x-4">
                    <button
                        className="px-2 py-1 bg-gray-800 rounded"
                        onClick={() => onNavigate('essences')}
                    >
                        ESSENCES
                    </button>
                    <button className="px-2 py-1 bg-gray-500 rounded">FOSSILS</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">CATALYSTS</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">SCARABS</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">OILS</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">DELIRIUM ORBS</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">BREACHSTONES</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">EMBLEMS</button>
                </div>
                <div className="flex space-x-2">
                    <select
                        className="px-2 py-1 bg-gray-800"
                        name="fossilType"
                        id="fossilType"
                        value={selectedFossilType}
                        onChange={handleFossilTypeChange}
                    >
                        <option value="">All Fossils</option>
                        <option value="PRIMITIVE">Primitive</option>
                        <option value="DEFT">Deft</option>
                    </select>
                    <ChaosDivineToggleButtonWithImage onToggle={handleCurrencyChange}/>
                    <button className="px-2 py-1 bg-gray-800 rounded">FAQ</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">FEEDBACK</button>
                    <button className="px-2 py-1 bg-gray-800 rounded">LEAGUE: SETTLERS</button>
                    <button
                        className="px-2 py-1 bg-gray-700 rounded text-xs"
                        onClick={toggleDebug}
                    >
                        {debugMode ? 'HIDE DEBUG' : 'DEBUG'}
                    </button>
                </div>
            </header>

            {debugMode && (
                <div className="mb-4 p-4 bg-gray-800 rounded">
                    <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold">Divine Batches: {divineBatches.length}</h4>
                            <ul className="text-xs">
                                {divineBatches.map((batch, i) => (
                                    <li key={`divine-${i}`}>
                                        {batch.length > 0 ? `${batch[0].fossilName}: ${batch.length} trades` : 'Empty batch'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold">Chaos Batches: {chaosBatches.length}</h4>
                            <ul className="text-xs">
                                {chaosBatches.map((batch, i) => (
                                    <li key={`chaos-${i}`}>
                                        {batch.length > 0 ? `${batch[0].fossilName}: ${batch.length} trades` : 'Empty batch'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-2">
                            {currency === 'divine' ? 'Divine Orb Trades' : 'Chaos Orb Trades'}
                            <span className="ml-2 text-sm text-gray-400">
                                {lastUpdated ? `Last updated: ${formatTimeAgo(lastUpdated)}` : 'No updates yet'}
                                {getLatestBatchTime() && (
                                    <span> (Latest trade: {formatTimeAgo(new Date(getLatestBatchTime()!))})</span>
                                )}
                            </span>
                        </h2>

                        {getUniqueFossilNames.length === 0 ? (
                            <div className="text-gray-400 py-4">
                                No {currency} trades available for selected fossil types.
                                {!isConnected &&
                                    <div className="text-red-400">(Connection lost - attempting to reconnect...)</div>}
                            </div>
                        ) : (
                            getUniqueFossilNames.map(fossilName => {
                                const trades = getTradesForFossil(fossilName)
                                    .filter(trade => trade.fossilName === fossilName)
                                    .sort((a, b) => a.exchangeAmount - b.exchangeAmount);
                                return (
                                    <div key={fossilName} className="mb-4">
                                        <h3
                                            className="text-md font-semibold mb-2 cursor-pointer flex items-center"
                                            onClick={() => toggleFossilExpansion(fossilName)}
                                        >
                                            <FossilImage fossilName={fossilName}/>
                                            <span className="ml-2">{fossilName}</span>
                                            <span className="ml-2 text-sm text-gray-400">
                                                ({trades.length} trades)
                                            </span>
                                            <span className="ml-auto">
                                                {expandedFossils[fossilName] ? '▼' : '▶'}
                                            </span>
                                        </h3>
                                        {expandedFossils[fossilName] && trades.length > 0 && (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm border-separate border-spacing-0">
                                                    <thead className="text-gray-400 bg-gray-800 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left w-[120px]">Price
                                                            ({currency})
                                                        </th>
                                                        <th className="px-4 py-2 text-left w-[80px]">Amount</th>
                                                        <th className="px-4 py-2 text-left w-[100px] cursor-pointer">
                                                            Ratio {currency === 'divine' ? '▼' : '▲'}
                                                        </th>
                                                        <th className="px-4 py-2 text-left w-[80px]">Stock</th>
                                                        <th className="px-4 py-2 text-left min-w-[200px]">Seller</th>
                                                        <th className="px-4 py-2 text-left w-[180px]">Updated</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {trades.map((trade, index) => (
                                                        <tr key={`${fossilName}-${index}`}
                                                            className="hover:bg-gray-800 even:bg-gray-850">
                                                            <td className="px-4 py-2 border-t border-gray-700">{trade.exchangeAmount}</td>
                                                            <td className="px-4 py-2 border-t border-gray-700">{trade.itemAmount}</td>
                                                            <td className="px-4 py-2 border-t border-gray-700">{trade.itemRatio.toFixed(2)}</td>
                                                            <td className="px-4 py-2 border-t border-gray-700">{trade.stock}</td>
                                                            <td className="px-4 py-2 border-t border-gray-700 truncate">
                                                                {trade.seller} ({trade.language})
                                                            </td>
                                                            <td className="px-4 py-2 border-t border-gray-700">
                                                                {formatTimeAgo(trade.indexed)} ({trade.league})
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
                </div>
                <div>
                    {error && <span className="text-red-500">{error}</span>}
                </div>
            </div>
        </div>
    );
};

export default FossilCalculator;