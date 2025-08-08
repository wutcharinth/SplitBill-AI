
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { CURRENCIES } from '../constants';
import { Plus, X, CheckCircle2, AlertCircle, PartyPopper, Info, User } from 'lucide-react';
import { Person, Deposit } from '../types';

const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (parseFloat(e.target.value) === 0) {
      e.target.value = '';
    }
};

const TaxInput: React.FC<{
    value: number;
    fxRate: number;
    onUpdate: (newValue: number) => void;
}> = ({ value, fxRate, onUpdate }) => {
    const [localValue, setLocalValue] = useState((value * fxRate).toFixed(2));

    useEffect(() => {
        // Update local state if the prop value changes from outside
        setLocalValue((value * fxRate).toFixed(2));
    }, [value, fxRate]);

    const handleBlur = () => {
        const numericValue = parseFloat(localValue);
        if (!isNaN(numericValue)) {
            onUpdate(numericValue / fxRate);
        } else {
            // Reset to original value if input is invalid
            setLocalValue((value * fxRate).toFixed(2));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <input
            type="number"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            step="0.01"
            className="w-20 text-right bg-transparent border border-gray-200 rounded-md p-1 font-mono text-xs text-gray-900"
        />
    );
}

const TipInput: React.FC<{
    tip: number;
    fxRate: number;
    dispatch: React.Dispatch<any>;
}> = ({ tip, fxRate, dispatch }) => {
    const [localTip, setLocalTip] = useState((tip * fxRate).toFixed(2));

    useEffect(() => {
        setLocalTip((tip * fxRate).toFixed(2));
    }, [tip, fxRate]);

    const handleBlur = () => {
        const numericValue = parseFloat(localTip);
        if (!isNaN(numericValue)) {
            dispatch({ type: 'UPDATE_TIP', payload: numericValue / fxRate });
        } else {
            setLocalTip((tip * fxRate).toFixed(2));
        }
    };

    return (
        <input
            type="number"
            value={localTip}
            onChange={(e) => setLocalTip(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="w-24 text-right bg-transparent border border-gray-200 rounded-md p-1 font-mono text-gray-900 text-xs"
        />
    );
};

const DepositInput: React.FC<{
    deposit: Deposit;
    people: Person[];
    fxRate: number;
    dispatch: React.Dispatch<any>;
    currencySymbol: string;
}> = ({ deposit, people, fxRate, dispatch, currencySymbol }) => {
    const [localAmount, setLocalAmount] = useState((deposit.amount * fxRate).toFixed(2));

    useEffect(() => {
        setLocalAmount((deposit.amount * fxRate).toFixed(2));
    }, [deposit.amount, fxRate]);

    const handleBlur = () => {
        const numericValue = parseFloat(localAmount);
        if (!isNaN(numericValue)) {
            dispatch({ type: 'UPDATE_DEPOSIT', payload: { id: deposit.id, amount: numericValue / fxRate } });
        } else {
            setLocalAmount((deposit.amount * fxRate).toFixed(2)); // Reset on invalid input
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
                <select
                    value={deposit.paidBy || ''}
                    onChange={e => dispatch({ type: 'UPDATE_DEPOSIT', payload: { id: deposit.id, paidBy: e.target.value } })}
                    className="bg-white rounded-md p-1 text-xs border border-gray-300 text-gray-900"
                >
                    <option value="">Select Person</option>
                    {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <span className="text-xs text-gray-600">paid an amount of</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">{currencySymbol}</span>
                <input
                    type="number"
                    value={localAmount}
                    onChange={(e) => setLocalAmount(e.target.value)}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    className="w-24 text-right bg-white border border-gray-300 rounded-md p-1 font-mono text-xs text-gray-900"
                />
                <button 
                    onClick={() => dispatch({ type: 'REMOVE_DEPOSIT', payload: { id: deposit.id } })}
                    className="text-gray-500 hover:text-red-500"
                >
                    <X size={16}/>
                </button>
            </div>
        </div>
    );
};


const DiscountInput: React.FC<{
    discount: { value: number, type: string };
    fxRate: number;
    dispatch: React.Dispatch<any>;
}> = ({ discount, fxRate, dispatch }) => {
    const isFixed = discount.type === 'fixed';
    const initialValue = isFixed ? (discount.value * fxRate).toFixed(2) : discount.value.toString();
    const [localValue, setLocalValue] = useState(initialValue);

    useEffect(() => {
        const updatedValue = isFixed ? (discount.value * fxRate).toFixed(2) : discount.value.toString();
        setLocalValue(updatedValue);
    }, [discount.value, discount.type, fxRate]);

    const handleBlur = () => {
        const numericValue = parseFloat(localValue);
        if (!isNaN(numericValue)) {
            const newDiscountValue = isFixed ? numericValue / fxRate : numericValue;
            dispatch({ type: 'UPDATE_DISCOUNT', payload: { value: newDiscountValue } });
        } else {
            setLocalValue(initialValue); // Reset on invalid input
        }
    };

    return (
        <input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="w-20 text-right bg-transparent border border-gray-300 rounded-md p-1 font-mono text-xs text-gray-900"
        />
    );
};


const AdjustmentRow: React.FC<{ label: React.ReactNode; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex justify-between items-center py-2">
        <label className="font-semibold text-gray-700 text-xs">{label}</label>
        {children}
    </div>
);

const TaxRow: React.FC<{tax: any, dispatch: any, currencySymbol: string, fxRate: number}> = ({ tax, dispatch, currencySymbol, fxRate}) => (
    <div className="flex justify-between items-center py-2">
        <div className="flex items-center flex-grow mr-2">
            <input
                id={`${tax.id}-toggle`}
                type="checkbox"
                className="h-4 w-4 rounded text-primary focus:ring-primary border-gray-300"
                checked={tax.isEnabled}
                onChange={(e) => dispatch({ type: 'UPDATE_TAX', payload: { id: tax.id, isEnabled: e.target.checked }})}
            />
            <div className="ml-2 flex-grow">
                 <input
                    type="text"
                    id={`${tax.id}-name`}
                    placeholder={tax.name}
                    value={tax.name}
                    onChange={(e) => dispatch({ type: 'UPDATE_TAX', payload: { id: tax.id, name: e.target.value }})}
                    className="tax-name-input flex-grow text-xs text-gray-900 w-full"
                />
                {tax.translatedName && tax.translatedName.toLowerCase() !== tax.name.toLowerCase() && (
                    <p className="text-[10px] text-accent mt-0.5 font-medium">Original: {tax.translatedName}</p>
                )}
            </div>
        </div>
        <div className="flex items-center">
            <span className="mr-2 text-gray-500 text-xs">{currencySymbol}</span>
            <TaxInput 
                value={tax.amount} 
                fxRate={fxRate}
                onUpdate={(newAmount) => dispatch({ type: 'UPDATE_TAX', payload: { id: tax.id, amount: newAmount }})}
            />
        </div>
    </div>
);


const Adjustments: React.FC<{ state: any; dispatch: React.Dispatch<any>, currencySymbol: string, fxRate: number, formatNumber: (num: number) => string }> = ({ state, dispatch, currencySymbol, fxRate, formatNumber }) => {
  const { items, discount, taxes, tip, deposits, billTotal, splitMode, tipSplitMode } = state;
  const [showTipInput, setShowTipInput] = useState(state.tip > 0);
  const [showDiscountInput, setShowDiscountInput] = useState(state.discount.value > 0);
  
  const showOtherTax = useMemo(() => taxes.otherTax.isEnabled || taxes.otherTax.amount > 0, [taxes.otherTax]);

  return (
    <div className="space-y-4">
        {/* Charges & Discounts Section */}
        <div className="border-t pt-4 mt-4 border-gray-200">
             <h3 className="text-sm font-bold mb-2 text-gray-700">Charges & Discounts</h3>
            <div className="space-y-2 pt-2">
                {showDiscountInput ? (
                     <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold text-xs text-gray-800">Global Discount</h4>
                            <button onClick={() => { setShowDiscountInput(false); dispatch({ type: 'UPDATE_DISCOUNT', payload: { value: 0 } }); }} className="text-gray-500 hover:text-gray-700" aria-label="Remove discount">
                                <X size={16} />
                            </button>
                        </div>
                        <AdjustmentRow label="Amount">
                            <div className="flex items-center space-x-2">
                                <DiscountInput discount={discount} fxRate={fxRate} dispatch={dispatch} />
                                <select 
                                    value={discount.type} 
                                    onChange={e => dispatch({type: 'UPDATE_DISCOUNT', payload: {type: e.target.value}})} 
                                    className="bg-white rounded-md p-1 text-xs border border-gray-300 text-gray-900"
                                >
                                    <option value="percentage">%</option>
                                    <option value="fixed">{currencySymbol}</option>
                                </select>
                            </div>
                        </AdjustmentRow>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <label className="font-semibold text-gray-700 text-xs mb-2 block">
                                Shared By
                            </label>
                            <p className="text-xs text-gray-500 mb-2">Select who shares this discount. If no one is selected, it's shared by everyone.</p>
                            <div className="flex flex-wrap gap-2">
                                {state.people.map((person: Person) => {
                                    const isSelected = state.discount.shares.includes(person.id);
                                    return (
                                        <button
                                            key={person.id}
                                            onClick={() => dispatch({ type: 'TOGGLE_DISCOUNT_SHARE', payload: { personId: person.id } })}
                                            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                                                isSelected
                                                    ? 'text-white shadow'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                            style={isSelected ? { backgroundColor: person.color } : {}}
                                        >
                                            {person.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                     <button 
                        onClick={() => setShowDiscountInput(true)}
                        className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center space-x-2 transition-colors"
                    >
                        <Plus size={14} />
                        <span className="text-xs font-medium">Add Global Discount</span>
                    </button>
                )}
                
                <TaxRow tax={taxes.serviceCharge} dispatch={dispatch} currencySymbol={currencySymbol} fxRate={fxRate}/>
                <TaxRow tax={taxes.vat} dispatch={dispatch} currencySymbol={currencySymbol} fxRate={fxRate}/>
                
                {showOtherTax ? (
                     <TaxRow tax={taxes.otherTax} dispatch={dispatch} currencySymbol={currencySymbol} fxRate={fxRate}/>
                ) : (
                    <button 
                        onClick={() => dispatch({ type: 'UPDATE_TAX', payload: { id: 'otherTax', isEnabled: true }})}
                        className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center space-x-2 transition-colors"
                    >
                        <Plus size={14} />
                        <span className="text-xs font-medium">Add Other Tax / Fee</span>
                    </button>
                )}
            </div>
        </div>

        {/* Tips Section */}
        <div className="border-t pt-4 mt-4 border-gray-200">
            {showTipInput ? (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-xs text-gray-800">Tip</h4>
                         <button onClick={() => { setShowTipInput(false); dispatch({ type: 'UPDATE_TIP', payload: 0 }); }} className="text-gray-500 hover:text-gray-700" aria-label="Cancel tip">
                            <X size={16} />
                        </button>
                    </div>
                    <AdjustmentRow label="Amount">
                         <div className="flex items-center">
                            <span className="mr-2 text-gray-500 text-xs">{currencySymbol}</span>
                            <TipInput tip={tip} fxRate={fxRate} dispatch={dispatch} />
                        </div>
                    </AdjustmentRow>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <label className="font-semibold text-gray-700 text-xs mb-2 block">Split Method</label>
                        <div className="flex items-center justify-center space-x-2 bg-gray-200 p-1 rounded-lg">
                            <button
                                onClick={() => dispatch({ type: 'UPDATE_TIP_SPLIT_MODE', payload: 'proportionally' })}
                                className={`w-full py-1 px-2 rounded-md text-xs font-medium transition-all duration-200 ${tipSplitMode === 'proportionally' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
                            >
                                Proportionally
                            </button>
                            <button
                                onClick={() => dispatch({ type: 'UPDATE_TIP_SPLIT_MODE', payload: 'equally' })}
                                className={`w-full py-1 px-2 rounded-md text-xs font-medium transition-all duration-200 ${tipSplitMode === 'equally' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
                            >
                                Equally
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setShowTipInput(true)}
                    className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center space-x-2 transition-colors"
                >
                    <Plus size={14} />
                    <span className="text-xs font-medium">Add a Tip</span>
                </button>
            )}
        </div>

        {/* Deposit Section */}
        <div className="border-t pt-4 mt-4 border-gray-200 space-y-2">
            <h4 className="font-semibold text-xs text-gray-800">Payments / Deposits</h4>
            {deposits.map((deposit: Deposit) => (
                <DepositInput
                    key={deposit.id}
                    deposit={deposit}
                    people={state.people}
                    fxRate={fxRate}
                    dispatch={dispatch}
                    currencySymbol={currencySymbol}
                />
            ))}
            <button 
                onClick={() => dispatch({ type: 'ADD_DEPOSIT' })}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center space-x-2 transition-colors"
            >
                <Plus size={14} />
                <span className="text-xs font-medium">Add Payment / Deposit</span>
            </button>
        </div>
    </div>
  );
};

export default Adjustments;
