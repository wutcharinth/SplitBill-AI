
'use client';

import React, { useState, useMemo } from 'react';
import { ALLOWED_CURRENCIES } from '../constants';
import { Star, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ManagePinnedCurrenciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedCurrencies: string[];
  togglePin: (currencyCode: string) => void;
}

const ManagePinnedCurrenciesModal: React.FC<ManagePinnedCurrenciesModalProps> = ({ isOpen, onClose, pinnedCurrencies, togglePin }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = useMemo(() => {
    const allCurrencies = Object.entries(ALLOWED_CURRENCIES).sort(([codeA], [codeB]) => codeA.localeCompare(codeB));
    if (!searchQuery) {
      return allCurrencies;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return allCurrencies.filter(([code, name]) => 
      code.toLowerCase().includes(lowercasedQuery) || 
      name.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-card rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-foreground font-headline">Manage Pinned Currencies</h2>
          <button onClick={onClose} className="p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors">
            <X size={24} />
          </button>
        </header>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-background"
            />
          </div>
        </div>
        <main className="p-4 overflow-y-auto">
            <p className="text-sm text-muted-foreground mb-4">Select the currencies you use most often. They will appear at the top of the currency selection list for quick access.</p>
            <div className="flex flex-col space-y-1">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map(([code, name]) => {
                  const isPinned = pinnedCurrencies.includes(code);
                  return (
                  <button
                      key={code}
                      onClick={() => togglePin(code)}
                      className={`flex items-center justify-between p-2 rounded-md text-left transition-colors text-sm w-full ${isPinned ? 'bg-accent/10' : 'hover:bg-muted'}`}
                  >
                      <span className="font-medium text-foreground">{code} - {name}</span>
                      <Star
                          size={18}
                          className={`transition-all duration-200 ${isPinned ? 'text-yellow-500 fill-current' : 'text-gray-400 hover:text-yellow-400'}`}
                      />
                  </button>
                  );
              })
            ) : (
              <p className="text-center text-muted-foreground py-4 text-sm">No currencies found for "{searchQuery}"</p>
            )}
            </div>
        </main>
        <footer className="p-4 border-t mt-auto">
            <button
                onClick={onClose}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Done
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ManagePinnedCurrenciesModal;
