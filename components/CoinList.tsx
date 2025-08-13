import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Coin } from '../types';
import { getCoinsMarkets } from '../services/coingecko';
import LoadingSpinner from './LoadingSpinner';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import CoinTicker from './CoinTicker';

interface CoinListProps {
  onSelectCoin: (coin: Coin) => void;
  currency: string;
}

const COINS_PER_PAGE = 10;

const getLocale = (currency: string) => currency.toLowerCase() === 'inr' ? 'en-IN' : 'en-US';

const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat(getLocale(currency), {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
};

const formatMarketData = (value: number, currency: string) => {
    return new Intl.NumberFormat(getLocale(currency), {
        style: 'currency',
        currency: currency.toUpperCase(),
        notation: 'compact',
        compactDisplay: 'short'
    }).format(value);
}

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Prev
      </button>
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 rounded-md transition-colors ${
            currentPage === number
              ? 'bg-cyan-500 text-white font-bold'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
};


const CoinList: React.FC<CoinListProps> = ({ onSelectCoin, currency }) => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCoins = useCallback(async (currentCurrency: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCoinsMarkets(currentCurrency, 1, 100);
      setCoins(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoins(currency);
    setCurrentPage(1);
  }, [currency, fetchCoins]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredCoins = useMemo(() => {
    if (!searchQuery) {
      return coins;
    }
    return coins.filter(coin =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [coins, searchQuery]);

  const paginatedCoins = useMemo(() => {
    const startIndex = (currentPage - 1) * COINS_PER_PAGE;
    return filteredCoins.slice(startIndex, startIndex + COINS_PER_PAGE);
  }, [filteredCoins, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredCoins.length / COINS_PER_PAGE);
  }, [filteredCoins]);


  if (error) {
    return <div className="text-center text-red-500 mt-20 p-4 bg-red-900/20 rounded-lg max-w-md mx-auto"><strong>Error:</strong> {error}</div>;
  }

  return (
    <div className="animate-fade-in">
       <CoinTicker currency={currency} onSelectCoin={onSelectCoin} />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center pt-12 pb-10 mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Largest
            <span className="block mt-1">Crypto Marketplace</span>
          </h1>
          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto">
            Welcome to the world's largest cryptocurrency marketplace. Sign up to explore more about cryptos.
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search for a coin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700/50 border border-transparent focus:border-cyan-500 focus:ring-0 text-white placeholder-gray-400 rounded-lg py-3 pl-10 pr-4 transition-colors"
              aria-label="Search for a cryptocurrency"
            />
          </div>
        </div>
        {loading ? (
            <div className="mt-20"><LoadingSpinner /></div>
        ) : (
        <>
            <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-white">
                    <thead className="bg-gray-700/50">
                        <tr>
                        <th className="p-4 text-left text-sm font-semibold tracking-wider text-gray-300">#</th>
                        <th className="p-4 text-left text-sm font-semibold tracking-wider text-gray-300">Coin</th>
                        <th className="p-4 text-right text-sm font-semibold tracking-wider text-gray-300">Price</th>
                        <th className="p-4 text-right text-sm font-semibold tracking-wider text-gray-300">24h %</th>
                        <th className="p-4 text-right text-sm font-semibold tracking-wider text-gray-300 hidden md:table-cell">Market Cap</th>
                        <th className="p-4 text-right text-sm font-semibold tracking-wider text-gray-300 hidden lg:table-cell">Volume (24h)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {paginatedCoins.length > 0 ? (
                            paginatedCoins.map((coin) => (
                            <tr key={coin.id} className="hover:bg-gray-700/50 cursor-pointer transition-colors duration-200" onClick={() => onSelectCoin(coin)}>
                                <td className="p-4 text-gray-400">{coin.market_cap_rank}</td>
                                <td className="p-4">
                                <div className="flex items-center space-x-3">
                                    <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                                    <div>
                                    <p className="font-bold">{coin.name}</p>
                                    <p className="text-sm text-gray-400">{coin.symbol.toUpperCase()}</p>
                                    </div>
                                </div>
                                </td>
                                <td className="p-4 text-right font-medium">{formatCurrency(coin.current_price, currency)}</td>
                                <td className="p-4 text-right">
                                <span className={`flex items-center justify-end gap-1 ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {coin.price_change_percentage_24h >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                    {coin.price_change_percentage_24h.toFixed(2)}%
                                </span>
                                </td>
                                <td className="p-4 text-right text-gray-300 hidden md:table-cell">{formatMarketData(coin.market_cap, currency)}</td>
                                <td className="p-4 text-right text-gray-300 hidden lg:table-cell">{formatMarketData(coin.total_volume, currency)}</td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-gray-400">
                                    No coins found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
        )}
      </div>
    </div>
  );
};

export default CoinList;