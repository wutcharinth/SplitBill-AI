'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ALLOWED_CURRENCIES } from '../constants';
import { ArrowRightLeft, LogIn, LogOut, Star } from 'lucide-react';
import { usePinnedCurrencies } from '../hooks/usePinnedCurrencies';
import ManagePinnedCurrenciesModal from './ManagePinnedCurrenciesModal';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

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
        className="font-semibold bg-white pl-2 pr-7 py-1 rounded-md text-gray-800 border border-gray-300 focus:ring-agoda-blue focus:border-agoda-blue text-xs w-20"
        aria-label="Select currency"
    >
        {sortedCurrencies.pinned.length > 0 && (
            <optgroup label="Pinned Currencies">
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
    const { user, loading, signInWithGoogle, signOut } = useAuth();


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
            return `${baseClasses} bg-agoda-blue text-white shadow`;
        }
        return `${baseClasses} text-gray-500 hover:bg-gray-300/50`;
    };
    
    const UserMenu = () => {
        if (loading) {
            return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />;
        }

        if (user) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="h-8 w-8 cursor-pointer">
                            <AvatarImage src={user.photoURL!} alt={user.displayName || 'User'} />
                            <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        return (
            <Button size="sm" onClick={signInWithGoogle}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
            </Button>
        );
    };

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-40 bg-slate-100/95 backdrop-blur-sm transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
               <div className="w-full max-w-xl mx-auto px-4 py-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src="https://i.postimg.cc/FmGScVWG/image.png" alt="SplitBill Logo" className="h-10" />
                            <div>
                                <h1 className="text-base font-bold text-gray-800">SplitBill AI</h1>
                                <p className="text-xs text-gray-600">Snap. Split. Done.</p>
                            </div>
                        </div>
                        <UserMenu />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-lg">
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
                            <ArrowRightLeft size={14} className="text-gray-400 flex-shrink-0"/>
                            <CurrencySelector
                                id="display-currency-select"
                                value={displayCurrency}
                                onChange={(e) => dispatch({ type: 'SET_DISPLAY_CURRENCY', payload: e.target.value })}
                                sortedCurrencies={sortedCurrencies}
                            />
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                                aria-label="Manage pinned currencies"
                                title="Manage pinned currencies"
                            >
                                <Star size={14} />
                            </button>
                        </div>
                    </div>

                    {isFxVisible && (
                        <div className="w-full mt-2 pt-2 border-t border-gray-200/80">
                             <div className="flex items-center justify-end gap-2 text-xs">
                                 <label htmlFor="fx-rate" className="font-medium text-gray-600 whitespace-nowrap">
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
                                            className="w-24 text-right bg-white border border-gray-300 rounded-md p-1 pr-6 font-mono text-xs text-gray-900 disabled:bg-gray-100"
                                            disabled={isFxLoading}
                                        />
                                        {isFxLoading && <div className="absolute right-1 top-1/2 -translate-y-1/2 animate-spin text-agoda-blue pointer-events-none" >
                                            <div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-4 w-4"></div>
                                        </div>}
                                    </div>
                                     <span className="ml-2 font-semibold text-gray-800">{displayCurrency}</span>
                                </div>
                            </div>
                            {fxRateDate && !isFxLoading && (
                                <p className="text-right text-[10px] text-gray-500 mt-1">
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
