
import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
    currency: string;
    setCurrency: (currency: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currency, setCurrency }) => {
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleCurrencyChange = (newCurrency: string) => {
        setCurrency(newCurrency);
        setIsCurrencyOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCurrencyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 py-4 shadow-lg shadow-cyan-500/10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h1 className="text-3xl font-bold text-white">
                Cryptoscope
            </h1>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsCurrencyOpen(!isCurrencyOpen)} className="flex items-center gap-2 text-white bg-gray-700/50 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                    <span>{currency.toUpperCase()}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isCurrencyOpen && (
                     <div className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
                        <button onClick={() => handleCurrencyChange('usd')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">USD</button>
                        <button onClick={() => handleCurrencyChange('inr')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">INR</button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
