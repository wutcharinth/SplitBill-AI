
'use client';

import React, { useMemo } from 'react';
import { Deposit } from '@/lib/types';

const DetailRow: React.FC<{ label: React.ReactNode; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
    <div className={`flex justify-between items-center py-1.5 ${className}`}>
        <label className="text-xs text-muted-foreground">{label}</label>
        {children}
    </div>
);

const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (parseFloat(e.target.value) === 0) {
      e.target.value = '';
    }
};

const ReconciliationDetails: React.FC<{ state: any; dispatch: React.Dispatch<any>, currencySymbol: string, fxRate: number, formatNumber: (num: number) => string }> = ({ state, dispatch, currencySymbol, fxRate, formatNumber }) => {
  const { items, billTotal, discount, taxes, splitMode, tip, deposits } = state;

  const { subtotal, discountAmount, serviceChargeAmount, vatAmount, otherTaxAmount, calculatedTotal, adjustment, grandTotalWithTipAndDeposit, totalDeposit } = useMemo(() => {
    const sub = items.reduce((sum: number, item: any) => sum + item.price, 0);
    
    let baseForCharges = sub;
    if (splitMode === 'item') {
        const assignedItems = items.filter((item: any) => item.shares.reduce((a: number, b: number) => a + b, 0) > 0);
        baseForCharges = assignedItems.reduce((sum: number, item: any) => sum + item.price, 0);
    }
    
    const discAmount = discount.type === 'percentage' ? baseForCharges * (discount.value / 100) : discount.value;
    const subAfterDiscount = baseForCharges - discAmount;

    const scAmount = taxes.serviceCharge.isEnabled ? taxes.serviceCharge.amount : 0;
    const vAmount = taxes.vat.isEnabled ? taxes.vat.amount : 0;
    const otAmount = taxes.otherTax.isEnabled ? taxes.otherTax.amount : 0;
    const depAmount = deposits.reduce((sum: number, deposit: Deposit) => sum + deposit.amount, 0);

    const calcTotal = subAfterDiscount + scAmount + vAmount + otAmount;
    const adj = billTotal > 0 ? billTotal - calcTotal : 0;
    const gTotalWithTipAndDeposit = calcTotal + adj + tip - depAmount;

    return { 
        subtotal: sub,
        discountAmount: discAmount, 
        serviceChargeAmount: scAmount,
        vatAmount: vAmount,
        otherTaxAmount: otAmount,
        calculatedTotal: calcTotal,
        adjustment: adj,
        grandTotalWithTipAndDeposit: gTotalWithTipAndDeposit,
        totalDeposit: depAmount
    };
}, [items, billTotal, discount, taxes, splitMode, tip, deposits]);


  return (
    <div>
        <h2 className="text-base font-bold mb-4 text-primary font-headline">Reconciliation Details</h2>
        <div className="space-y-1 pt-2 bg-muted/50 p-3 rounded-lg border">
            <div className="flex justify-between items-center py-2 border-b mb-2">
                <label className="font-semibold text-gray-800 text-sm">Receipt Total</label>
                <div className="flex items-center">
                    <span className="mr-2 text-gray-600 text-sm">{currencySymbol}</span>
                    <input 
                        type="number" 
                        value={billTotal > 0 ? (billTotal * fxRate).toFixed(2) : ''}
                        onFocus={handleFocus}
                        onChange={e => dispatch({type: 'UPDATE_BILL_TOTAL', payload: Number(e.target.value) / fxRate})} 
                        className="w-24 text-right bg-card border border-border rounded-md p-1 font-mono text-sm text-foreground"
                        placeholder="Enter total"
                    />
                </div>
            </div>
            
            <DetailRow label="Items Subtotal">
                <span className="font-mono text-xs text-foreground">{currencySymbol}{(subtotal * fxRate).toFixed(2)}</span>
            </DetailRow>

            {discount.value > 0 && (
                <DetailRow label={`Discount (${discount.type === 'fixed' ? currencySymbol : ''}${discount.value}${discount.type === 'percentage' ? '%' : ''})`} className="text-red-600">
                    <span className="font-mono text-xs">- {currencySymbol}{(discountAmount * fxRate).toFixed(2)}</span>
                </DetailRow>
            )}

            {taxes.serviceCharge.isEnabled && taxes.serviceCharge.amount > 0 && (
                 <DetailRow label={taxes.serviceCharge.name}>
                    <span className="font-mono text-xs text-foreground">+ {currencySymbol}{(serviceChargeAmount * fxRate).toFixed(2)}</span>
                </DetailRow>
            )}

            {taxes.vat.isEnabled && taxes.vat.amount > 0 && (
                <DetailRow label={taxes.vat.name}>
                    <span className="font-mono text-xs text-foreground">+ {currencySymbol}{(vatAmount * fxRate).toFixed(2)}</span>
                </DetailRow>
            )}

            {taxes.otherTax.isEnabled && taxes.otherTax.amount > 0 && (
                 <DetailRow label={taxes.otherTax.name}>
                    <span className="font-mono text-xs text-foreground">+ {currencySymbol}{(otherTaxAmount * fxRate).toFixed(2)}</span>
                </DetailRow>
            )}

            <div className="flex justify-between items-center pt-2 mt-2 border-t font-semibold text-sm">
                <h4 className="text-gray-800">Calculated Total</h4>
                <span className="font-mono text-foreground">{currencySymbol}{(calculatedTotal * fxRate).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center pt-1 text-sm font-semibold">
                <h4 className="text-blue-600">Difference</h4>
                <span className={`font-mono ${adjustment >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {adjustment >= 0 ? '+' : '-'} {currencySymbol}{Math.abs(adjustment * fxRate).toFixed(2)}
                </span>
            </div>
            
             {tip > 0 && (
                <div className="flex justify-between items-center pt-1 text-sm font-semibold">
                    <h4 className="text-blue-600">Tip</h4>
                    <span className="font-mono text-blue-600">+ {currencySymbol}{(tip * fxRate).toFixed(2)}</span>
                </div>
            )}
            
            {totalDeposit > 0 && (
                <div className="flex justify-between items-center pt-1 text-sm font-semibold">
                    <h4 className="text-red-600">Deposit</h4>
                    <span className="font-mono text-red-600">- {currencySymbol}{(totalDeposit * fxRate).toFixed(2)}</span>
                </div>
            )}

            <div className="flex justify-between items-center pt-2 mt-2 border-t font-bold text-base">
                <h4 className="text-gray-900">Grand Total</h4>
                <span className="font-mono text-gray-900">{currencySymbol}{(grandTotalWithTipAndDeposit * fxRate).toFixed(2)}</span>
            </div>
        </div>
    </div>
  );
};

export default ReconciliationDetails;
