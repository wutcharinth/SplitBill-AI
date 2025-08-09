
'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { Person, Payment } from '../types';

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

const SettleUp: React.FC<{ state: any; dispatch: React.Dispatch<any>, currencySymbol: string, fxRate: number, formatNumber: (num: number) => string }> = ({ state, dispatch, currencySymbol, fxRate, formatNumber }) => {
    const { items, people, discount, taxes, tip, payments, billTotal } = state;

    const { grandTotalWithTip, remainingAmount } = useMemo(() => {
        const subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);
        const discountAmount = discount.type === 'percentage' ? subtotal * (discount.value / 100) : discount.value;
        const subtotalAfterDiscount = subtotal - discountAmount;
        const serviceChargeAmount = taxes.serviceCharge.isEnabled ? taxes.serviceCharge.amount : 0;
        const vatAmount = taxes.vat.isEnabled ? taxes.vat.amount : 0;
        const otherTaxAmount = taxes.otherTax.isEnabled ? taxes.otherTax.amount : 0;
        const calculatedTotal = subtotalAfterDiscount + serviceChargeAmount + vatAmount + otherTaxAmount;
        const adjustment = billTotal > 0 ? billTotal - calculatedTotal : 0;
        const totalWithTip = calculatedTotal + adjustment + tip;
        const totalPayments = payments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
        const remaining = totalWithTip - totalPayments;
        return { grandTotalWithTip: totalWithTip, remainingAmount: remaining };
    }, [items, discount, taxes, tip, billTotal, payments]);

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground -mt-1">Enter who paid the restaurant to see who owes who.</p>
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
        </div>
    );
}

export default SettleUp;
