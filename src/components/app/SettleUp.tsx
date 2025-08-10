
'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { Person, Payment } from '../types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (parseFloat(e.target.value) === 0) {
      e.target.value = '';
    }
};

const SinglePersonPaymentInput: React.FC<{ person: Person; payment: Payment | undefined, fxRate: number; dispatch: React.Dispatch<any>; currencySymbol: string }> = ({ person, payment, fxRate, dispatch, currencySymbol }) => {
    const paymentAmount = payment ? payment.amount : 0;
    const [localAmount, setLocalAmount] = useState((paymentAmount * fxRate).toFixed(2));
  
    useEffect(() => {
        setLocalAmount((paymentAmount * fxRate).toFixed(2));
    }, [paymentAmount, fxRate]);
  
    const handleBlur = () => {
      const numericValue = parseFloat(localAmount);
      if (!isNaN(numericValue)) {
        dispatch({ type: 'UPDATE_PERSON_PAYMENT', payload: { paidBy: person.id, amount: numericValue / fxRate } });
      } else {
        setLocalAmount((paymentAmount * fxRate).toFixed(2));
      }
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalAmount(e.target.value);
    };
  
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: person.color }}>
            {person.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-medium text-sm text-gray-800">{person.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium">{currencySymbol}</span>
          <input
            type="number"
            value={localAmount}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="w-28 text-right bg-white border border-gray-300 rounded-md p-2 font-mono text-sm text-gray-900"
          />
        </div>
      </div>
    );
};

const SettleUp: React.FC<{ state: any; dispatch: React.Dispatch<any>, currencySymbol: string, fxRate: number, formatNumber: (num: number) => string, settleMode: 'single' | 'multiple', setSettleMode: (mode: 'single' | 'multiple') => void }> = ({ state, dispatch, currencySymbol, fxRate, formatNumber, settleMode, setSettleMode }) => {
    const { items, people, discounts, fees, tip, payments, billTotal } = state;

    const { grandTotalWithTip, remainingAmount } = useMemo(() => {
        const subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);
        const totalDiscounts = discounts.reduce((sum: number, d: any) => sum + d.amount, 0);
        const totalFees = fees.filter((f: any) => f.isEnabled).reduce((sum: number, f: any) => sum + f.amount, 0);
        
        const subtotalAfterDiscount = subtotal - totalDiscounts;
        const calculatedTotal = subtotalAfterDiscount + totalFees;

        const adjustment = billTotal > 0 ? billTotal - calculatedTotal : 0;
        const totalWithTip = calculatedTotal + adjustment + tip;
        const totalPayments = payments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
        const remaining = totalWithTip - totalPayments;
        return { grandTotalWithTip: totalWithTip, remainingAmount: remaining };
    }, [items, discounts, fees, tip, billTotal, payments]);

    const handleSinglePayerSelect = (selectedPersonId: string) => {
        // Set all other people's payments to 0
        people.forEach((person: Person) => {
            if (person.id !== selectedPersonId) {
                dispatch({ type: 'UPDATE_PERSON_PAYMENT', payload: { paidBy: person.id, amount: 0 } });
            }
        });
        // Set the selected person's payment to the grand total
        dispatch({ type: 'UPDATE_PERSON_PAYMENT', payload: { paidBy: selectedPersonId, amount: grandTotalWithTip } });
    };

    const singlePayerId = useMemo(() => {
        const payers = payments.filter((p: Payment) => p.amount > 0);
        if (payers.length === 1 && Math.abs(payers[0].amount - grandTotalWithTip) < 0.01) {
            return payers[0].paidBy;
        }
        return null;
    }, [payments, grandTotalWithTip]);

    return (
        <div className="space-y-3">
             <div className="text-center">
                <p className="text-xs text-muted-foreground -mt-1">
                    {settleMode === 'single' ? "Tap who paid the entire bill" : "Enter amounts if multiple people paid"}
                </p>
             </div>
            
            {settleMode === 'single' ? (
                 <div className="pt-2">
                    <div className="flex flex-wrap justify-center items-center gap-3">
                        {people.map((person: Person) => {
                            const isSelected = singlePayerId === person.id;
                            return (
                                <button
                                    key={person.id}
                                    onClick={() => handleSinglePayerSelect(person.id)}
                                    className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all transform duration-200 ${
                                        isSelected
                                            ? 'ring-4 ring-offset-2 ring-primary scale-110 shadow-lg'
                                            : 'hover:scale-105 shadow-md'
                                    }`}
                                    style={{ backgroundColor: person.color }}
                                    title={person.name}
                                >
                                    {person.name.substring(0, 2).toUpperCase()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg text-primary">
                        <span className="text-sm font-medium">Remaining:</span>
                        <span className="text-xl font-bold tracking-tight">{currencySymbol}{formatNumber(remainingAmount * fxRate)}</span>
                    </div>
                    <div className="space-y-2">
                        {people.map((person: Person) => {
                            const payment = payments.find((d: Payment) => d.paidBy === person.id);
                            return <SinglePersonPaymentInput key={person.id} person={person} payment={payment} fxRate={fxRate} dispatch={dispatch} currencySymbol={currencySymbol} />
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default SettleUp;
