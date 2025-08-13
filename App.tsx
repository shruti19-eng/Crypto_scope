
import React, { useState, useCallback } from 'react';
import type { Coin } from './types';
import Header from './components/Header';
import CoinList from './components/CoinList';
import CoinDetail from './components/CoinDetail';

const App: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [currency, setCurrency] = useState('usd');

  const handleSelectCoin = useCallback((coin: Coin) => {
    setSelectedCoin(coin);
    window.scrollTo(0, 0);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedCoin(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
        <Header currency={currency} setCurrency={setCurrency} />
        <main>
            {selectedCoin ? (
                <CoinDetail coin={selectedCoin} onBack={handleBack} currency={currency} />
            ) : (
                <CoinList onSelectCoin={handleSelectCoin} currency={currency} />
            )}
        </main>
    </div>
  );
};

export default App;
