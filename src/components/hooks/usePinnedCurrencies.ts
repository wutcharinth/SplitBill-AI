import { useState, useCallback, useEffect } from 'react';

const PINNED_CURRENCIES_KEY = 'splitbill_pinned_currencies';
const DEFAULT_PINNED = ['USD', 'EUR', 'GBP', 'JPY', 'THB'];

export const usePinnedCurrencies = () => {
  const [pinnedCurrencies, setPinnedCurrencies] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PINNED_CURRENCIES_KEY);
      if (stored) {
        setPinnedCurrencies(JSON.parse(stored));
      } else {
        setPinnedCurrencies(DEFAULT_PINNED);
      }
    } catch (error) {
      console.error('Failed to read pinned currencies from localStorage:', error);
      setPinnedCurrencies(DEFAULT_PINNED);
    }
  }, []);

  const togglePin = useCallback((currencyCode: string) => {
    setPinnedCurrencies(prev => {
      const isPinned = prev.includes(currencyCode);
      const newPinned = isPinned
        ? prev.filter(c => c !== currencyCode)
        : [...prev, currencyCode];
      
      try {
        localStorage.setItem(PINNED_CURRENCIES_KEY, JSON.stringify(newPinned));
      } catch (error) {
        console.error('Failed to save pinned currencies to localStorage:', error);
      }
      
      return newPinned;
    });
  }, []);

  return { pinnedCurrencies, togglePin };
};
