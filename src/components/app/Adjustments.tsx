
'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { CURRENCIES } from '../constants';
import { Plus, X, CheckCircle2, AlertCircle, PartyPopper, Info, User, Trash2 } from 'lucide-react';
import { Person, Payment, Discount, Fee } from '../types';

const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (parseFloat(e.target.value) === 0) {
      e.target.value = '';
    }
};

const AmountInput: React.FC<{
    value: number;
    fxRate: number;
    onUpdate: (newValue: number) => void;
}> = ({ value, fxRate, onUpdate }) => {
    const [localValue, setLocalValue] = useState((value * fxRate).toFixed(2));

    useEffect(() => {
        setLocalValue((value * fxRate).toFixed(2));
    }, [value, fxRate]);

    const handleBlur = () => {
        const numericValue = parseFloat(localValue);
        if (!isNaN(numericValue)) {
            onUpdate(numericValue / fxRate);
        } else {
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

const FeeRow: React.FC<{
    fee: Fee,
    dispatch: any,
    currencySymbol: string,
    fxRate: number
}> = ({ fee, dispatch, currencySymbol, fxRate }) => (
    <div className="flex justify-between items-center py-2">
        <div className="flex items-center flex-grow mr-2">
            <input
                id={`${fee.id}-toggle`}
                type="checkbox"
                className="h-4 w-4 rounded text-primary focus:ring-primary border-gray-300"
                checked={fee.isEnabled}
                onChange={(e) => dispatch({ type: 'UPDATE_FEE', payload: { id: fee.id, data: { isEnabled: e.target.checked } }})}
            />
            <div className="ml-2 flex-grow">
                 <input
                    type="text"
                    id={`${fee.id}-name`}
                    placeholder="Fee Name"
                    value={fee.name}
                    onChange={(e) => dispatch({ type: 'UPDATE_FEE', payload: { id: fee.id, data: { name: e.target.value } }})}
                    className="tax-name-input flex-grow text-xs text-gray-900 w-full"
                />
                {fee.translatedName && fee.translatedName.toLowerCase() !== fee.name.toLowerCase() && (
                    <p className="text-[10px] text-accent mt-0.5 font-medium">Original: {fee.translatedName}</p>
                )}
            </div>
        </div>
        <div className="flex items-center">
            <button onClick={() => dispatch({ type: 'REMOVE_FEE', payload: { id: fee.id } })} className="text-gray-400 hover:text-red-500 mr-2" aria-label={`Remove ${fee.name}`}>
                <Trash2 size={16} />
            </button>
            <span className="mr-2 text-gray-500 text-xs">{currencySymbol}</span>
            <AmountInput
                value={fee.amount}
                fxRate={fxRate}
                onUpdate={(newAmount) => dispatch({ type: 'UPDATE_FEE', payload: { id: fee.id, data: { amount: newAmount } }})}
            />
        </div>
    </div>
);


const DiscountRow: React.FC<{
    discount: Discount,
    discountIndex: number,
    people: Person[],
    dispatch: any,
    currencySymbol: string,
    fxRate: number
}> = ({ discount, discountIndex, people, dispatch, currencySymbol, fxRate }) => {
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPressOrContext = useRef(false);
  
    const handlePressStart = (personIndex: number) => {
      isLongPressOrContext.current = false;
      pressTimer.current = setTimeout(() => {
        isLongPressOrContext.current = true;
        dispatch({ type: 'UPDATE_DISCOUNT_SHARE', payload: { discountIndex, personIndex, change: -1 } });
      }, 500); // 500ms threshold for long press
    };
  
    const handlePressEnd = () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
    
    const handleClick = (personIndex: number) => {
      if (!isLongPressOrContext.current) {
        dispatch({ type: 'UPDATE_DISCOUNT_SHARE', payload: { discountIndex, personIndex, change: 1 } });
      }
    };
  
    const handleContextMenu = (e: React.MouseEvent, personIndex: number) => {
      e.preventDefault();
      if (isLongPressOrContext.current) return;
  
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
      isLongPressOrContext.current = true;
      dispatch({ type: 'UPDATE_DISCOUNT_SHARE', payload: { discountIndex, personIndex, change: -1 } });
    };

    return (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-grow pr-2">
                    <input
                        type="text"
                        value={discount.name}
                        onChange={(e) => dispatch({ type: 'UPDATE_DISCOUNT', payload: { id: discount.id, data: { name: e.target.value } }})}
                        className="w-full p-1 -ml-1 bg-transparent text-xs font-medium text-gray-800 rounded-md border border-transparent focus:border-gray-300 focus:bg-white focus:outline-none"
                        placeholder="Discount Name"
                    />
                </div>
                <div className="flex items-center flex-shrink-0">
                    <span className="font-mono text-xs text-gray-500">{currencySymbol}</span>
                    <AmountInput
                        value={discount.amount}
                        fxRate={fxRate}
                        onUpdate={(newAmount) => dispatch({ type: 'UPDATE_DISCOUNT', payload: { id: discount.id, data: { amount: newAmount } }})}
                    />
                     <button onClick={() => dispatch({ type: 'REMOVE_DISCOUNT', payload: { id: discount.id } })} className="ml-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Remove item">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-2">
                    {people.map((person, personIndex) => {
                        const shareCount = discount.shares[personIndex];
                        const isSelected = shareCount > 0;
                        return (
                            <button
                                key={person.id}
                                onMouseDown={() => handlePressStart(personIndex)}
                                onMouseUp={handlePressEnd}
                                onTouchStart={() => handlePressStart(personIndex)}
                                onTouchEnd={handlePressEnd}
                                onClick={() => handleClick(personIndex)}
                                onContextMenu={(e) => handleContextMenu(e, personIndex)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                                    isSelected
                                        ? 'text-white shadow'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                style={isSelected ? { backgroundColor: person.color } : {}}
                            >
                                {person.name}
                                {shareCount > 1 && <span className="ml-1.5 text-white/80">x{shareCount}</span>}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}


const Adjustments: React.FC<{ state: any; dispatch: React.Dispatch<any>, currencySymbol: string, fxRate: number, formatNumber: (num: number) => string }> = ({ state, dispatch, currencySymbol, fxRate, formatNumber }) => {
  const { people, discounts, fees, tip, tipSplitMode } = state;
  const [showTipInput, setShowTipInput] = useState(state.tip > 0);

  return (
    <div className="space-y-4">
        {/* Charges & Discounts Section */}
        <div className="border-t pt-4 mt-4 border-gray-200">
             <h3 className="text-sm font-bold mb-2 text-gray-700">Fees & Charges</h3>
             <div className="space-y-2 pt-2">
                {fees.map((fee: Fee) => (
                    <FeeRow key={fee.id} fee={fee} dispatch={dispatch} currencySymbol={currencySymbol} fxRate={fxRate}/>
                ))}
                <button
                    onClick={() => dispatch({ type: 'ADD_FEE' })}
                    className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center space-x-2 transition-colors"
                >
                    <Plus size={14} />
                    <span className="text-xs font-medium">Add Fee / Charge</span>
                </button>
            </div>
        </div>

        <div className="border-t pt-4 mt-4 border-gray-200">
             <h3 className="text-sm font-bold mb-2 text-gray-700">Discounts</h3>
             <div className="space-y-3 pt-2">
                {discounts.map((discount: Discount, index: number) => (
                    <DiscountRow 
                        key={discount.id} 
                        discount={discount} 
                        discountIndex={index}
                        people={people} 
                        dispatch={dispatch} 
                        currencySymbol={currencySymbol} 
                        fxRate={fxRate}
                    />
                ))}
                <button
                    onClick={() => dispatch({ type: 'ADD_DISCOUNT' })}
                    className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center space-x-2 transition-colors"
                >
                    <Plus size={14} />
                    <span className="text-xs font-medium">Add Discount</span>
                </button>
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
                    <div className="flex justify-between items-center py-2">
                        <label className="font-semibold text-gray-700 text-xs">Amount</label>
                         <div className="flex items-center">
                            <span className="mr-2 text-gray-500 text-xs">{currencySymbol}</span>
                            <TipInput tip={tip} fxRate={fxRate} dispatch={dispatch} />
                        </div>
                    </div>
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
    </div>
  );
};

export default Adjustments;
