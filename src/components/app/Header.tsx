'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ALLOWED_CURRENCIES } from '../constants';
import { ArrowRightLeft, Star } from 'lucide-react';
import { usePinnedCurrencies } from '../hooks/usePinnedCurrencies';
import ManagePinnedCurrenciesModal from './ManagePinnedCurrenciesModal';

interface HeaderProps {
    activePage: 'setup' | 'summary';
    setActivePage: (page: 'setup' | 'summary') => void;
    state: {
        baseCurrency: string;
        displayCurrency: string;
        fxRate: number;
        fxRateDate: string | null;
        isFxLoading: boolean;
    };
    dispatch: React.Dispatch<any>;
}

const CurrencySelector: React.FC<{
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    sortedCurrencies: { pinned: [string, string][]; others: [string, string][] };
}> = ({ id, value, onChange, sortedCurrencies }) => (
    <select
        id={id}
        value={value}
        onChange={onChange}
        className="font-semibold bg-card pl-3 pr-8 py-1 rounded-md text-card-foreground border border-border focus:ring-ring focus:border-ring text-sm w-28 appearance-none"
        aria-label="Select currency"
    >
        {sortedCurrencies.pinned.length > 0 && (
            <optgroup label="Pinned">
                {sortedCurrencies.pinned.map(([code, name]) => (
                    <option key={code as string} value={code as string}>{`${code}`}</option>
                ))}
            </optgroup>
        )}
        <optgroup label="All Currencies">
            {sortedCurrencies.others.map(([code, name]) => (
                <option key={code} value={code}>{`${code}`}</option>
            ))}
        </optgroup>
    </select>
);


const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, state, dispatch }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { pinnedCurrencies, togglePin } = usePinnedCurrencies();

    const { baseCurrency, displayCurrency, fxRate, fxRateDate, isFxLoading } = state;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sortedCurrencies = useMemo(() => {
        const pinned = pinnedCurrencies
            .map(code => ([code, ALLOWED_CURRENCIES[code]]))
            .filter(entry => entry[1]); // Ensure the currency exists in our list

        const others = Object.entries(ALLOWED_CURRENCIES)
            .filter(([code]) => !pinnedCurrencies.includes(code))
            // Sort by currency code (e.g., AUD, BRL, CAD) instead of name.
            .sort(([codeA], [codeB]) => codeA.localeCompare(codeB));

        return { pinned, others };
    }, [pinnedCurrencies]);
    
    const isFxVisible = baseCurrency !== displayCurrency;

    const getTabClassName = (page: 'setup' | 'summary') => {
        const baseClasses = 'py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-200 min-w-[100px] text-center';
        if (activePage === page) {
            return `${baseClasses} bg-primary text-primary-foreground shadow`;
        }
        return `${baseClasses} text-muted-foreground hover:bg-muted/50`;
    };

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
               <div className="w-full max-w-xl mx-auto px-4 py-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src="https://i.postimg.cc/x1mkMHxS/image.png" alt="SplitBill AI Logo" className="h-10" />
                            <div>
                                <h1 className="text-base font-bold text-foreground font-headline">SplitBill AI</h1>
                                <p className="text-xs text-muted-foreground">Snap. Split. Done.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
                            <button
                                onClick={() => setActivePage('setup')}
                                className={getTabClassName('setup')}
                            >
                                Split
                            </button>
                            <button
                                onClick={() => setActivePage('summary')}
                                className={getTabClassName('summary')}
                            >
                                Summary
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                            <CurrencySelector
                                id="base-currency-select"
                                value={baseCurrency}
                                onChange={(e) => dispatch({ type: 'SET_BASE_CURRENCY', payload: e.target.value })}
                                sortedCurrencies={sortedCurrencies}
                            />
                            <ArrowRightLeft size={14} className="text-muted-foreground flex-shrink-0"/>
                            <CurrencySelector
                                id="display-currency-select"
                                value={displayCurrency}
                                onChange={(e) => dispatch({ type: 'SET_DISPLAY_CURRENCY', payload: e.target.value })}
                                sortedCurrencies={sortedCurrencies}
                            />
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
                                aria-label="Manage pinned currencies"
                                title="Manage pinned currencies"
                            >
                                <Star size={14} />
                            </button>
                        </div>
                    </div>

                    {isFxVisible && (
                        <div className="w-full mt-2 pt-2 border-t border-border/80">
                             <div className="flex items-center justify-end gap-2 text-xs">
                                 <label htmlFor="fx-rate" className="font-medium text-muted-foreground whitespace-nowrap">
                                    1 {baseCurrency} =
                                 </label>
                                <div className="flex items-center">
                                    <div className="relative">
                                         <input
                                            id="fx-rate"
                                            type="number"
                                            step="0.0001"
                                            value={fxRate}
                                            onChange={(e) => dispatch({ type: 'SET_FX_RATE', payload: { rate: Number(e.target.value) || 1, date: null, isLoading: false } })}
                                            className="w-24 text-right bg-card border border-border rounded-md p-1 pr-6 font-mono text-xs text-foreground disabled:bg-muted"
                                            disabled={isFxLoading}
                                        />
                                        {isFxLoading && <div className="absolute right-1 top-1/2 -translate-y-1/2 animate-spin text-primary pointer-events-none" >
                                            <div className="loader ease-linear rounded-full border-2 border-t-2 border-border h-4 w-4"></div>
                                        </div>}
                                    </div>
                                     <span className="ml-2 font-semibold text-foreground">{displayCurrency}</span>
                                </div>
                            </div>
                            {fxRateDate && !isFxLoading && (
                                <p className="text-right text-[10px] text-muted-foreground mt-1">
                                    (Source: Currency API, as of {fxRateDate})
                                </p>
                            )}
                        </div>
                    )}
               </div>
            </header>
            <ManagePinnedCurrenciesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pinnedCurrencies={pinnedCurrencies}
                togglePin={togglePin}
            />
        </>
    );
};

export default Header;
