
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ALLOWED_CURRENCIES } from '../constants';
import { ArrowRightLeft, Star, ArrowDown, LogOut, Settings } from 'lucide-react';
import { usePinnedCurrencies } from '../hooks/usePinnedCurrencies';
import ManagePinnedCurrenciesModal from './ManagePinnedCurrenciesModal';
import Link from 'next/link';
import { User } from 'firebase/auth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { useAuth } from '@/hooks/useAuth';


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
    onReset: () => void;
}

const CurrencySelector: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    sortedCurrencies: { pinned: [string, string][]; others: [string, string][] };
}> = ({ id, label, value, onChange, sortedCurrencies }) => (
    <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-[11px] font-medium text-muted-foreground w-10">{label}</label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="font-semibold bg-card pl-2 pr-6 py-1 rounded-md text-card-foreground border border-border focus:ring-ring focus:border-ring text-xs w-24 appearance-none"
            aria-label={`Select ${label} currency`}
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
    </div>
);


const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, state, dispatch, onReset }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { pinnedCurrencies, togglePin } = usePinnedCurrencies();
    const { user, logout } = useAuth();

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

    const UserMenu: React.FC<{user: User}> = ({ user }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                        <AvatarFallback>{user.displayName?.[0] || user.email?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuLabel>
                    <p className="text-sm font-medium truncate">{user.displayName || 'Welcome!'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm transition-shadow duration-300 ${isScrolled ? '' : ''}`}>
               <div className="w-full max-w-xl mx-auto px-4 py-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
                            <img src="https://i.postimg.cc/TYXtwbKN/Chat-GPT-Image-Aug-8-2025-04-14-15-PM.png" alt="SplitBill AI Logo" className="h-10" />
                            <div>
                                <h1 className="text-base font-bold text-foreground font-headline">SplitBill AI</h1>
                                <p className="text-xs text-muted-foreground">Snap. Split. Done.</p>
                            </div>
                        </div>
                         {user && <UserMenu user={user} />}
                    </div>

                    <div className="flex items-center justify-between mt-2 space-x-2">
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
                        
                        <div className="flex items-center">
                            <div className="flex flex-col gap-1.5 relative items-center">
                                <CurrencySelector
                                    id="base-currency-select"
                                    label="Bill"
                                    value={baseCurrency}
                                    onChange={(e) => dispatch({ type: 'SET_BASE_CURRENCY', payload: e.target.value })}
                                    sortedCurrencies={sortedCurrencies}
                                />
                                <CurrencySelector
                                    id="display-currency-select"
                                    label="Display"
                                    value={displayCurrency}
                                    onChange={(e) => dispatch({ type: 'SET_DISPLAY_CURRENCY', payload: e.target.value })}
                                    sortedCurrencies={sortedCurrencies}
                                />
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="p-1.5 self-stretch rounded-lg text-muted-foreground hover:bg-muted transition-colors ml-1"
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
                                 <label htmlFor="fx-rate" className="font-medium text-muted-foreground whitespace-nowrap text-[11px]">
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
                                            className="w-20 text-right bg-card border border-border rounded-md p-0.5 pr-5 font-mono text-[11px] text-foreground disabled:bg-muted"
                                            disabled={isFxLoading}
                                        />
                                        {isFxLoading && <div className="absolute right-1 top-1/2 -translate-y-1/2 animate-spin text-primary pointer-events-none" >
                                            <div className="loader ease-linear rounded-full border-2 border-t-2 border-border h-3 w-3"></div>
                                        </div>}
                                    </div>
                                     <span className="ml-1.5 font-semibold text-foreground text-[11px]">{displayCurrency}</span>
                                </div>
                            </div>
                            {fxRateDate && !isFxLoading && (
                                <p className="text-right text-[10px] text-muted-foreground mt-0.5">
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
