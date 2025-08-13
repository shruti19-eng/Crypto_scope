import React, { useState, useEffect, useCallback } from 'react';
import type { Coin } from '../types';
import { getCoinsMarkets } from '../services/coingecko';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';

interface CoinTickerProps {
    currency: string;
    onSelectCoin: (coin: Coin) => void;
}

const getLocale = (currency: string) => currency.toLowerCase() === 'inr' ? 'en-IN' : 'en-US';

const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat(getLocale(currency), {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
};

const TickerItemSkeleton = () => (
    <div className="flex-shrink-0 flex items-center gap-4 px-6 animate-pulse">
        <div className="h-8 w-8 rounded-full bg-gray-700"></div>
        <div className="flex flex-col gap-2">
            <div className="h-4 w-20 bg-gray-700 rounded"></div>
            <div className="h-3 w-16 bg-gray-700 rounded"></div>
        </div>
    </div>
);

const TickerItem: React.FC<{coin: Coin, currency: string, onSelectCoin: (coin: Coin) => void}> = ({ coin, currency, onSelectCoin }) => (
    <div 
        onClick={() => onSelectCoin(coin)} 
        className="flex-shrink-0 flex items-center gap-4 px-6 cursor-pointer"
    >
        <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
        <div>
            <div className="flex items-center gap-2">
                <span className="font-bold text-white">{coin.symbol.toUpperCase()}</span>
                <span className={`flex items-center text-xs font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.price_change_percentage_24h >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
            </div>
            <p className="text-sm text-gray-300">{formatCurrency(coin.current_price, currency)}</p>
        </div>
    </div>
);


const CoinTicker: React.FC<CoinTickerProps> = ({ currency, onSelectCoin }) => {
    const [topCoins, setTopCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTopCoins = useCallback(async (currentCurrency: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCoinsMarkets(currentCurrency, 1, 15);
            setTopCoins(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTopCoins(currency);
    }, [currency, fetchTopCoins]);

    return (
        <div className="bg-gray-800/50 border-b border-t border-gray-700/50 py-3 overflow-hidden group">
             <div className="flex animate-scroll-left group-hover:[animation-play-state:paused]">
                {loading ? (
                    Array.from({ length: 15 }).map((_, index) => <TickerItemSkeleton key={index} />)
                ) : error ? (
                    <div className="text-red-400 text-sm w-full text-center">Could not load ticker data.</div>
                ) : (
                    [...topCoins, ...topCoins].map((coin, index) => (
                        <TickerItem key={`${coin.id}-${index}`} coin={coin} currency={currency} onSelectCoin={onSelectCoin} />
                    ))
                )}
            </div>
        </div>
    );
};

export default CoinTicker;
