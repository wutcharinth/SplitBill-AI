
'use client';

import React, { useState, useReducer, useEffect } from 'react';
import { BillData, BillItem, Person, Tax, Discount, SplitMode } from '../../types';
import { CURRENCIES } from '../constants';
import Summary from './Summary';
import { RotateCw, ArrowRight } from 'lucide-react';
import Header from './Header';
import SetupPage from './SetupPage';
import Link from 'next/link';
import { useUsage, UsageProvider } from '@/hooks/useUsageTracker';

const getFxRateApi = async (from: string, to: string): Promise<{rate: number, date: string} | null> => {
    if (!from || !to || from.toUpperCase() === to.toUpperCase()) {
        return { rate: 1, date: new Date().toISOString().split('T')[0] };
    }
    const API_BASE_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';
    try {
        const response = await fetch(`${API_BASE_URL}/${from.toLowerCase()}.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const rate = data[from.toLowerCase()][to.toLowerCase()];
        const date = data.date;
        if (rate && date) return { rate, date };
        throw new Error(`Rate or date not found for ${from} to ${to}`);
    } catch (error) {
        console.error(`Failed to fetch FX rate for ${from} to ${to}:`, error);
        return null; // Fallback
    }
};

const formatNumber = (num: number) => {
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


interface AppState extends BillData {
  splitMode: SplitMode;
  peopleCountEvenly: number;
  displayCurrency: string;
  fxRate: number;
  fxRateDate: string | null;
  qrCodeImage: string | null;
  notes: string;
  isFxLoading: boolean;
  includeReceiptInSummary: boolean;
  uploadedReceipt: string | null;
}

type Action =
  | { type: 'SET_SPLIT_MODE'; payload: SplitMode }
  | { type: 'ADD_PERSON'; payload: Person }
  | { type: 'REMOVE_PERSON'; payload: { personId: string } }
  | { type: 'SET_PEOPLE_COUNT_EVENLY'; payload: number }
  | { type: 'UPDATE_PERSON_NAME'; payload: { index: number; name: string } }
  | { type: 'ADD_ITEM'; payload: { name: string; price: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemIndex: number } }
  | { type: 'UPDATE_ITEM_NAME'; payload: { itemIndex: number; name: string } }
  | { type: 'UPDATE_ITEM_PRICE'; payload: { itemIndex: number; price: number } }
  | { type: 'UPDATE_ITEM_SHARE'; payload: { itemIndex: number; personIndex: number; change: 1 | -1 } }
  | { type: 'UPDATE_TAX'; payload: Partial<Tax> & { id: 'serviceCharge' | 'vat' | 'otherTax' } }
  | { type: 'UPDATE_DISCOUNT'; payload: Partial<Discount> }
  | { type: 'TOGGLE_DISCOUNT_SHARE'; payload: { personId: string } }
  | { type: 'UPDATE_TIP'; payload: number }
  | { type: 'UPDATE_TIP_SPLIT_MODE'; payload: 'proportionally' | 'equally' }
  | { type: 'UPDATE_BILL_TOTAL'; payload: number }
  | { type: 'UPDATE_RESTAURANT_NAME'; payload: string }
  | { type: 'UPDATE_BILL_DATE'; payload: string }
  | { type: 'SET_BASE_CURRENCY'; payload: string }
  | { type: 'SET_DISPLAY_CURRENCY'; payload: string }
  | { type: 'SET_FX_RATE'; payload: { rate: number; date?: string | null; isLoading?: boolean } }
  | { type: 'SET_QR_CODE_IMAGE'; payload: string | null }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'TOGGLE_INCLUDE_RECEIPT' }
  | { type: 'RESET'; payload: BillData | null };

const getStoredQrCode = (): string | null => {
    try {
        return localStorage.getItem('splitbill_qr');
    } catch (e) {
        console.error("Could not read QR code from local storage", e);
        return null;
    }
};

const createInitialState = (billData: BillData, uploadedReceipt: string | null): AppState => ({
    ...billData, 
    splitMode: 'item', 
    peopleCountEvenly: 2,
    displayCurrency: billData.baseCurrency,
    fxRate: 1,
    fxRateDate: null,
    qrCodeImage: getStoredQrCode(),
    notes: '',
    isFxLoading: false,
    includeReceiptInSummary: !!uploadedReceipt,
    uploadedReceipt,
});

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_SPLIT_MODE':
      return { ...state, splitMode: action.payload };
    
    case 'ADD_PERSON':
      const newPerson = action.payload;
      const newPeopleArray = [...state.people, newPerson];
      const itemsWithNewPerson = state.items.map(item => ({
          ...item,
          shares: [...item.shares, 0]
      }));
      return { ...state, people: newPeopleArray, items: itemsWithNewPerson };

    case 'REMOVE_PERSON': {
      const { personId } = action.payload;
      const personIndexToRemove = state.people.findIndex(p => p.id === personId);
      if (personIndexToRemove === -1 || state.people.length <= 1) {
          return state; // Can't remove last person
      }
      const filteredPeople = state.people.filter(p => p.id !== personId);
      const itemsWithPersonRemoved = state.items.map(item => {
          const newShares = [...item.shares];
          newShares.splice(personIndexToRemove, 1);
          return { ...item, shares: newShares };
      });
      // Also remove person from discount shares
      const newDiscountShares = state.discount.shares.filter(id => id !== personId);
      return {
          ...state,
          people: filteredPeople,
          items: itemsWithPersonRemoved,
          discount: { ...state.discount, shares: newDiscountShares }
      };
    }

    case 'SET_PEOPLE_COUNT_EVENLY':
      return { ...state, peopleCountEvenly: action.payload };
      
    case 'UPDATE_PERSON_NAME':
        const updatedPeople = [...state.people];
        updatedPeople[action.payload.index].name = action.payload.name;
        return { ...state, people: updatedPeople };

    case 'ADD_ITEM':
      const newItem: BillItem = {
        name: action.payload.name,
        price: action.payload.price,
        translatedName: null,
        shares: Array(state.people.length).fill(0)
      };
      return { ...state, items: [...state.items, newItem] };

    case 'REMOVE_ITEM': {
        const { itemIndex } = action.payload;
        const updatedItems = [...state.items];
        updatedItems.splice(itemIndex, 1);
        return { ...state, items: updatedItems };
    }

    case 'UPDATE_ITEM_NAME': {
        const { itemIndex, name } = action.payload;
        const updatedItems = state.items.map((item, index) => {
            if (index === itemIndex) {
                return { ...item, name };
            }
            return item;
        });
        return { ...state, items: updatedItems };
    }

    case 'UPDATE_ITEM_PRICE': {
        const { itemIndex, price } = action.payload;
        const updatedItems = state.items.map((item, index) => {
            if (index === itemIndex) {
                return { ...item, price };
            }
            return item;
        });
        return { ...state, items: updatedItems };
    }

    case 'UPDATE_ITEM_SHARE': {
      const { itemIndex, personIndex, change } = action.payload;
      const updatedItems = state.items.map((item, i) => {
        if (i === itemIndex) {
          const newShares = [...item.shares];
          newShares[personIndex] = Math.max(0, newShares[personIndex] + change);
          return { ...item, shares: newShares };
        }
        return item;
      });
      return { ...state, items: updatedItems };
    }
      
    case 'UPDATE_TAX':
        const { id, ...taxData } = action.payload;
        return {
            ...state,
            taxes: {
                ...state.taxes,
                [id]: { ...state.taxes[id], ...taxData }
            }
        };

    case 'UPDATE_DISCOUNT':
        return { ...state, discount: { ...state.discount, ...action.payload } };

    case 'TOGGLE_DISCOUNT_SHARE': {
        const { personId } = action.payload;
        const currentShares = state.discount.shares;
        const newShares = currentShares.includes(personId)
            ? currentShares.filter(id => id !== personId)
            : [...currentShares, personId];
        return {
            ...state,
            discount: { ...state.discount, shares: newShares }
        };
    }

    case 'UPDATE_TIP':
        return { ...state, tip: action.payload };

    case 'UPDATE_TIP_SPLIT_MODE':
        return { ...state, tipSplitMode: action.payload };

    case 'UPDATE_BILL_TOTAL':
        return { ...state, billTotal: action.payload };

    case 'UPDATE_RESTAURANT_NAME':
        return { ...state, restaurantName: action.payload };
    
    case 'UPDATE_BILL_DATE':
        return { ...state, billDate: action.payload };
    
    case 'SET_BASE_CURRENCY':
      return {
          ...state,
          baseCurrency: action.payload,
          displayCurrency: action.payload,
          fxRate: 1,
          fxRateDate: null,
          isFxLoading: false,
      };

    case 'SET_DISPLAY_CURRENCY':
        return { ...state, displayCurrency: action.payload };

    case 'SET_FX_RATE':
        const newState = { ...state, fxRate: action.payload.rate, isFxLoading: action.payload.isLoading ?? state.isFxLoading };
        if ('date' in action.payload) {
            newState.fxRateDate = action.payload.date;
        }
        return newState;
    
    case 'SET_QR_CODE_IMAGE':
        try {
            if (action.payload) {
                localStorage.setItem('splitbill_qr', action.payload);
            } else {
                localStorage.removeItem('splitbill_qr');
            }
        } catch (e) {
            console.error("Failed to save QR code to local storage", e);
        }
        return { ...state, qrCodeImage: action.payload };
    
    case 'SET_NOTES':
        return { ...state, notes: action.payload };
    
    case 'TOGGLE_INCLUDE_RECEIPT':
        return { ...state, includeReceiptInSummary: !state.includeReceiptInSummary };

    case 'RESET':
        if(action.payload) {
             return { ...createInitialState(action.payload, null) };
        }
        return { ...state }; // No real reset if payload is null
        
    default:
      return state;
  }
};

interface MainAppProps {
  initialBillData: BillData;
  onReset: () => void;
  uploadedReceipt: string | null;
}

const MainApp: React.FC<MainAppProps> = ({ initialBillData, onReset, uploadedReceipt }) => {
  const [state, dispatch] = useReducer(reducer, createInitialState(initialBillData, uploadedReceipt));
  const [activePage, setActivePage] = useState<'setup' | 'summary'>('setup');
  const { baseCurrency, displayCurrency } = state;

  useEffect(() => {
    const fetchRate = async () => {
        if (state.baseCurrency === state.displayCurrency) {
            if (state.fxRate !== 1 || state.isFxLoading || state.fxRateDate !== null) {
                dispatch({ type: 'SET_FX_RATE', payload: { rate: 1, date: null, isLoading: false }});
            }
            return;
        }
        dispatch({ type: 'SET_FX_RATE', payload: { rate: state.fxRate, date: state.fxRateDate, isLoading: true } });
        const fxData = await getFxRateApi(state.baseCurrency, state.displayCurrency);
        if (fxData) {
            dispatch({ type: 'SET_FX_RATE', payload: { rate: fxData.rate, date: fxData.date, isLoading: false }});
        } else {
            dispatch({ type: 'SET_FX_RATE', payload: { rate: 1, date: null, isLoading: false }});
        }
    };
    fetchRate();
  }, [state.baseCurrency, state.displayCurrency]);


  const displayCurrencySymbol = CURRENCIES[state.displayCurrency] || state.displayCurrency;

  const isFxVisible = baseCurrency !== displayCurrency;
  const mainContentPaddingTop = isFxVisible ? 'pt-[170px]' : 'pt-[120px]';
  
  return (
    <div>
        <Header
            activePage={activePage}
            setActivePage={setActivePage}
            state={state}
            dispatch={dispatch}
            onReset={onReset}
        />
        <main className={`w-full max-w-xl mx-auto pb-8 px-4 md:px-0 ${mainContentPaddingTop}`}>
            {activePage === 'setup' && (
                <SetupPage
                    state={state}
                    dispatch={dispatch}
                    currencySymbol={displayCurrencySymbol}
                    fxRate={state.fxRate}
                    formatNumber={formatNumber}
                />
            )}
            {activePage === 'summary' && (
                <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
                    <h2 className="text-sm font-bold mb-4 text-primary font-headline">Final Summary</h2>
                    <Summary state={state} dispatch={dispatch} currencySymbol={displayCurrencySymbol} fxRate={state.fxRate} formatNumber={formatNumber}/>
                </div>
            )}

            <div className="mt-8 space-y-4">
              {activePage === 'setup' && (
                  <button
                      onClick={() => setActivePage('summary')}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all transform hover:shadow-lg hover:scale-105"
                  >
                      <span>View Summary</span>
                      <ArrowRight size={20} />
                  </button>
              )}
              <button onClick={onReset} className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                <RotateCw size={18} />
                <span>Start Over</span>
              </button>
            </div>
            <footer className="text-center pt-6 mt-4 text-xs text-muted-foreground">
                <div className="flex justify-center space-x-4">
                    <Link href="/about" target="_blank" className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors">About</Link>
                    <Link href="/terms" target="_blank" className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors">Terms & Policies</Link>
                </div>
            </footer>
        </main>
    </div>
  );
};

export default MainApp;

    