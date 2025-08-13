
import React, { useState, useEffect, useCallback } from 'react';
import type { Coin, ChartDataPoint } from '../types';
import { getCoinMarketChart } from '../services/coingecko';
import LoadingSpinner from './LoadingSpinner';
import PriceChart from './PriceChart';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';

interface CoinDetailProps {
  coin: Coin;
  onBack: () => void;
  currency: string;
}

const getLocale = (currency: string) => currency.toLowerCase() === 'inr' ? 'en-IN' : 'en-US';

const formatCurrency = (value: number, currency: string, simple = false) => {
    if (simple) {
        const symbol = new Intl.NumberFormat(getLocale(currency), { style: 'currency', currency: currency.toUpperCase() }).formatToParts(1).find(part => part.type === 'currency')?.value;
        return `${symbol}${value.toLocaleString()}`;
    }
    return new Intl.NumberFormat(getLocale(currency), {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: value < 1 ? 8 : 2,
    }).format(value);
};

const formatLargeNumber = (value: number, currency: string) => {
    return new Intl.NumberFormat(getLocale(currency), {
        style: 'currency',
        currency: currency.toUpperCase(),
        notation: 'compact',
        compactDisplay: 'short'
    }).format(value);
}

const CoinDetail: React.FC<CoinDetailProps> = ({ coin, onBack, currency }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<number>(1);

  const fetchChartData = useCallback(async (coinId: string, numDays: number, currentCurrency: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCoinMarketChart(coinId, numDays, currentCurrency);
      setChartData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChartData(coin.id, days, currency);
  }, [coin.id, days, currency, fetchChartData]);

  const TimeRangeButton: React.FC<{value: number, label: string}> = ({ value, label }) => (
    <button
        onClick={() => setDays(value)}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            days === value ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
    >
        {label}
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
        <button onClick={onBack} className="mb-6 flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to list</span>
        </button>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 flex-shrink-0">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-6">
                <div className="flex items-center space-x-4">
                    <img src={coin.image} alt={coin.name} className="h-16 w-16 rounded-full" />
                    <div>
                        <h1 className="text-3xl font-bold text-white">{coin.name}</h1>
                        <p className="text-lg text-gray-400">{coin.symbol.toUpperCase()}</p>
                    </div>
                </div>
                 <div className="flex items-baseline space-x-3">
                    <p className="text-4xl font-bold text-white">{formatCurrency(coin.current_price, currency)}</p>
                    <span className={`flex items-center text-lg font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {coin.price_change_percentage_24h >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                        {coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div className="text-gray-400">Market Cap Rank</div>
                    <div className="text-white font-semibold text-right">#{coin.market_cap_rank}</div>

                    <div className="text-gray-400">Market Cap</div>
                    <div className="text-white font-semibold text-right">{formatLargeNumber(coin.market_cap, currency)}</div>
                    
                    <div className="text-gray-400">24h Volume</div>
                    <div className="text-white font-semibold text-right">{formatLargeNumber(coin.total_volume, currency)}</div>
                    
                    <div className="text-gray-400">24h High</div>
                    <div className="text-green-400 font-semibold text-right">{formatCurrency(coin.high_24h, currency, true)}</div>
                    
                    <div className="text-gray-400">24h Low</div>
                    <div className="text-red-400 font-semibold text-right">{formatCurrency(coin.low_24h, currency, true)}</div>
                </div>
            </div>
        </div>

        <div className="lg:w-2/3">
             <div className="flex justify-end space-x-2 mb-4">
                <TimeRangeButton value={1} label="24H" />
                <TimeRangeButton value={7} label="7D" />
                <TimeRangeButton value={30} label="30D" />
                <TimeRangeButton value={90} label="90D" />
                <TimeRangeButton value={365} label="1Y" />
            </div>
            {loading && <div className="h-[28rem] flex items-center justify-center bg-gray-800 rounded-lg"><LoadingSpinner/></div>}
            {error && <div className="h-[28rem] flex items-center justify-center bg-gray-800 rounded-lg text-red-500">Error: {error}</div>}
            {chartData && !loading && !error && <PriceChart data={chartData} currency={currency} days={days} />}
        </div>
      </div>
    </div>
  );
};

export default CoinDetail;
