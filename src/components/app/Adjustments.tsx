
'use client';

import React, { useMemo, useState } from 'react';
import { CURRENCIES } from '../constants';
import { Plus, X, CheckCircle2, AlertCircle, PartyPopper, Info } from 'lucide-react';
import { Person } from '../types';

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
                    <p className="text-[10px] text-accent mt-0.5 font-medium">{tax.translatedName}</p>
                )}
            </div>
        </div>
        <div className="flex items-center">
            <span className="mr-2 text-gray-500 text-xs">{currencySymbol}</span>
            <input
                type="number"
                id={`${tax.id}-amount`}
                value={tax.amount ? (tax.amount * fxRate).toFixed(2) : '0'}
                onChange={(e) => dispatch({ type: 'UPDATE_TAX', payload: { id: tax.id, amount: Number(e.target.value) / fxRate }})}
                className="w-20 text-right bg-transparent border border-gray-200 rounded-md p-1 font-mono text-xs text-gray-900"
            />
        </div>
    </div>
);


const Adjustments: React.FC<{ state: any; dispatch: React.Dispatch<any>, currencySymbol: string, fxRate: number, formatNumber: (num: number) => string }> = ({ state, dispatch, currencySymbol, fxRate, formatNumber }) => {
  const { items, discount, taxes, tip, billTotal, splitMode, tipSplitMode } = state;
  const [showTipInput, setShowTipInput] = useState(state.tip > 0);
  const [showDiscountInput, setShowDiscountInput] = useState(state.discount.value > 0);

  const originalSubtotal = useMemo(() => items.reduce((sum: number, item: any) => sum + item.price, 0), [items]);
  
  const assignedSubtotal = useMemo(() => {
      // This is only relevant for 'item' mode.
      if (splitMode !== 'item') return 0;
      return items.reduce((sum: number, item: any) => {
          const totalShares = item.shares.reduce((a: number, b: number) => a + b, 0);
          if (totalShares > 0) {
              return sum + item.price;
          }
          return sum;
      }, 0);
  }, [items, splitMode]);

  const itemDiscountsTotal = useMemo(() => {
    // This is only relevant for 'item' mode.
    if (splitMode !== 'item') return 0;
    return items.reduce((sum: number, item: any) => {
        const totalShares = item.shares.reduce((a: number, b: number) => a + b, 0);
        // Only count as discount if item is marked free AND assigned to someone
        if (item.isFree && totalShares > 0) {
            return sum + item.price;
        }
        return sum;
    }, 0);
  }, [items, splitMode]);

  const { calculatedTotal, globalDiscountAmount, adjustment } = useMemo(() => {
    // If splitting evenly, base calcs on original subtotal.
    // If splitting by item, base on subtotal of items actually assigned.
    const baseForCharges = splitMode === 'item' 
        ? (assignedSubtotal - itemDiscountsTotal) 
        : originalSubtotal;

    const discountAmount = discount.type === 'percentage' ? baseForCharges * (discount.value / 100) : discount.value;
    const subtotalAfterDiscount = baseForCharges - discountAmount;
    
    const serviceChargeAmount = taxes.serviceCharge.isEnabled ? taxes.serviceCharge.amount : 0;
    const vatAmount = taxes.vat.isEnabled ? taxes.vat.amount : 0;
    const otherTaxAmount = taxes.otherTax.isEnabled ? taxes.otherTax.amount : 0;

    const calcTotal = subtotalAfterDiscount + serviceChargeAmount + vatAmount + otherTaxAmount;
    const adj = billTotal > 0 ? billTotal - calcTotal : 0;
    return { calculatedTotal: calcTotal, globalDiscountAmount: discountAmount, adjustment: adj };
  }, [originalSubtotal, assignedSubtotal, itemDiscountsTotal, discount, taxes, billTotal, splitMode]);
  
  const showOtherTax = useMemo(() => taxes.otherTax.isEnabled || taxes.otherTax.amount > 0, [taxes.otherTax]);

  return (
    <div className="space-y-4">
        {/* Review & Adjust Section */}
        <div>
            <h3 className="text-sm font-bold mb-2 border-b pb-2 border-gray-200 text-gray-700">Review & Adjust</h3>
            <div className="space-y-1 pt-2">
                <AdjustmentRow label="Original Receipt Subtotal">
                    <div className="flex items-center">
                        <span className="mr-2 text-gray-500 text-xs">{currencySymbol}</span>
                        <input type="text" value={(originalSubtotal * fxRate).toFixed(2)} readOnly className="w-24 text-right bg-gray-200 rounded-md p-1 font-mono text-xs border-none text-gray-900" />
                    </div>
                </AdjustmentRow>
                {splitMode === 'item' && (
                    <>
                         <AdjustmentRow label="Assigned Items Subtotal">
                            <div className="flex items-center">
                                <span className="mr-2 text-gray-500 text-xs">{currencySymbol}</span>
                                <input type="text" value={(assignedSubtotal * fxRate).toFixed(2)} readOnly className="w-24 text-right bg-gray-200 rounded-md p-1 font-mono text-xs border-none text-gray-900" />
                            </div>
                        </AdjustmentRow>
                         <AdjustmentRow label="Item Discounts (Free & Assigned)">
                            <div className="flex items-center">
                                <span className="mr-2 text-gray-500 text-xs">{currencySymbol}</span>
                                <input type="text" value={(itemDiscountsTotal * fxRate).toFixed(2)} readOnly className="w-24 text-right bg-gray-200 rounded-md p-1 font-mono text-xs border-none text-gray-900" />
                            </div>
                        </AdjustmentRow>
                    </>
                )}
            </div>
            <div className="space-y-2 pt-4">
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
                                <input 
                                    type="number" 
                                    value={discount.type === 'fixed' ? (discount.value * fxRate).toFixed(2) : discount.value} 
                                    onChange={e => {
                                        const val = Number(e.target.value);
                                        const newDiscountValue = discount.type === 'fixed' ? val / fxRate : val;
                                        dispatch({type: 'UPDATE_DISCOUNT', payload: {value: newDiscountValue}})
                                    }} 
                                    className="w-20 text-right bg-transparent border border-gray-300 rounded-md p-1 font-mono text-xs text-gray-900" 
                                />
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

        {/* Reconciliation Section */}
        <div className="border-t pt-4 mt-4 border-gray-200">
             <h3 className="text-sm font-bold mb-2 border-b pb-2 border-gray-200 text-gray-700">Reconciliation</h3>
             <div className="space-y-1 text-xs bg-gray-50 p-3 rounded-lg text-gray-800 mt-4">
                {splitMode === 'item' ? (
                     <div className="flex justify-between"><span>Subtotal After Item Discounts:</span><span className="font-mono">{currencySymbol}{formatNumber((assignedSubtotal - itemDiscountsTotal) * fxRate)}</span></div>
                ) : (
                     <div className="flex justify-between"><span>Receipt Subtotal:</span><span className="font-mono">{currencySymbol}{formatNumber(originalSubtotal * fxRate)}</span></div>
                )}
                {globalDiscountAmount > 0 && <div className="flex justify-between text-red-600"><span>Global Discount:</span><span className="font-mono">-{currencySymbol}{formatNumber(globalDiscountAmount * fxRate)}</span></div>}
                {taxes.serviceCharge.isEnabled && <div className="flex justify-between"><span>{taxes.serviceCharge.name}:</span><span className="font-mono">+{currencySymbol}{formatNumber(taxes.serviceCharge.amount * fxRate)}</span></div>}
                {taxes.vat.isEnabled && <div className="flex justify-between"><span>{taxes.vat.name}:</span><span className="font-mono">+{currencySymbol}{formatNumber(taxes.vat.amount * fxRate)}</span></div>}
                {taxes.otherTax.isEnabled && <div className="flex justify-between"><span>{taxes.otherTax.name}:</span><span className="font-mono">+{currencySymbol}{formatNumber(taxes.otherTax.amount * fxRate)}</span></div>}
                <div className="flex justify-between font-bold border-t mt-1 pt-1 border-gray-300"><span>Calculated Total:</span><span className="font-mono">{currencySymbol}{formatNumber(calculatedTotal * fxRate)}</span></div>
             </div>
             <AdjustmentRow label="Bill Total (from receipt)">
                <div className="flex items-center">
                    <span className="mr-2 text-gray-500 text-xs">{currencySymbol}</span>
                    <input type="number" value={(billTotal * fxRate).toFixed(2)} onChange={e => dispatch({ type: 'UPDATE_BILL_TOTAL', payload: Number(e.target.value) / fxRate })} className="w-24 text-right bg-transparent border border-gray-200 rounded-md p-1 font-mono text-gray-900 text-xs" />
                </div>
            </AdjustmentRow>
             <div className="mt-4">
                {(() => {
                    const absAdjustment = Math.abs(adjustment);
                    const isNearlyReconciled = absAdjustment > 0 && absAdjustment < 0.1;
                    const isReconciled = absAdjustment < 0.01;
                    const matchPercentage = billTotal > 0 ? (1 - absAdjustment / billTotal) * 100 : 100;
                    
                    if (isReconciled) {
                        return (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                <div>
                                    <h4 className="font-bold text-green-800 text-sm">Perfect Match!</h4>
                                    <p className="text-xs text-green-700 mt-1">
                                        The calculated total matches the bill total from the receipt.
                                        (<strong className="font-mono">{matchPercentage.toFixed(2)}% Match</strong>)
                                    </p>
                                </div>
                            </div>
                        );
                    }
                    
                    if (isNearlyReconciled) {
                        return (
                             <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                <div>
                                    <h4 className="font-bold text-green-800 text-sm">Almost There!</h4>
                                    <p className="text-xs text-green-700 mt-1">
                                        The totals are off by a tiny amount, likely due to rounding. The difference of <strong className="font-mono">{currencySymbol}{formatNumber(adjustment * fxRate)}</strong> will be automatically split to ensure everything matches perfectly.
                                        (<strong className="font-mono">{matchPercentage.toFixed(2)}% Match</strong>)
                                    </p>
                                </div>
                            </div>
                        )
                    }

                    if (matchPercentage < 90) {
                        return (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                <div>
                                    <h4 className="font-bold text-yellow-800 text-sm">Large Difference Detected</h4>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        The calculated total is off by <strong className="font-mono">{currencySymbol}{formatNumber(absAdjustment * fxRate)}</strong>. Please review items and adjustments carefully.
                                        (<strong className="font-mono text-red-600">{matchPercentage.toFixed(2)}% Match</strong>)
                                    </p>
                                </div>
                            </div>
                        )
                    }
                    
                    const matchClass = matchPercentage > 99 ? 'text-green-700' : 'text-yellow-700';

                    if (adjustment > 0) { // Shortfall
                        return (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                <div>
                                    <h4 className="font-bold text-yellow-800 text-sm">Shortfall Detected</h4>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Difference of <strong className="font-mono">{currencySymbol}{formatNumber(absAdjustment * fxRate)}</strong> will be split among everyone.
                                        (<strong className={`font-mono ${matchClass}`}>{matchPercentage.toFixed(2)}% Match</strong>)
                                    </p>
                                </div>
                            </div>
                        );
                    }
                    
                    // Surplus
                    const surplus = absAdjustment;
                    const taxLikeSurplus = [taxes.serviceCharge, taxes.vat, taxes.otherTax].find(tax => 
                        tax.isEnabled && Math.abs(surplus - tax.amount) / tax.amount < 0.1 // Within 10%
                    );

                    if (taxLikeSurplus) {
                        return (
                             <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                                <Info className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                <div>
                                    <h4 className="font-bold text-indigo-800 text-sm">Surplus Found!</h4>
                                    <p className="text-xs text-indigo-700 mt-1">
                                        The surplus of <strong className="font-mono">{currencySymbol}{formatNumber(surplus * fxRate)}</strong> is very similar to your <strong className="font-semibold">'{taxLikeSurplus.name}'</strong>.
                                        Could the AI have mistaken this tax for a line item? Please review the items list above.
                                    </p>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                            <PartyPopper className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <div>
                                <h4 className="font-bold text-indigo-800 text-sm">Surplus Found!</h4>
                                <p className="text-xs text-indigo-700 mt-1">
                                    Extra <strong className="font-mono">{currencySymbol}{formatNumber(absAdjustment * fxRate)}</strong> will be distributed back.
                                    (<strong className={`font-mono ${matchClass}`}>{matchPercentage.toFixed(2)}% Match</strong>)
                                </p>
                            </div>
                        </div>
                    );
                })()}
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
                            <input type="number" value={(tip * fxRate).toFixed(2)} onChange={e => dispatch({ type: 'UPDATE_TIP', payload: Number(e.target.value) / fxRate })} className="w-24 text-right bg-transparent border border-gray-200 rounded-md p-1 font-mono text-gray-900 text-xs" />
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
    </div>
  );
};

export default Adjustments;
