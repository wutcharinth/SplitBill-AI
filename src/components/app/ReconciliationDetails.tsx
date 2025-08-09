
'use client';

import React, { useMemo } from 'react';
import { Payment } from '@/lib/types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

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

const ReconciliationStatus: React.FC<{ adjustment: number, currencySymbol: string, formatNumber: (num: number) => string, fxRate: number, billTotal: number }> = ({ adjustment, currencySymbol, formatNumber, fxRate, billTotal }) => {
    const absAdjustment = Math.abs(adjustment);
    
    if (billTotal <= 0) {
        return null; // Don't show status if there's no bill total to reconcile against
    }

    const matchPercentage = (1 - absAdjustment / billTotal) * 100;
    const isNearlyPerfect = matchPercentage >= 99 && matchPercentage < 100;

    if (absAdjustment < 0.01) {
        return (
            <div className="mt-3 p-2 text-sm flex items-center gap-2 rounded-lg bg-green-500/10 text-green-700 border border-green-500/20">
                <CheckCircle2 size={16} />
                <p className="font-medium">Totals match perfectly.</p>
            </div>
        );
    }
    
    if (isNearlyPerfect || matchPercentage > 99) {
        let message;
        if (adjustment > 0) {
             message = `Shortfall of ${currencySymbol}${formatNumber(adjustment * fxRate)} will be split.`;
        } else {
            message = `Surplus of ${currencySymbol}${formatNumber(absAdjustment * fxRate)} will be distributed.`;
        }
         return (
            <div className="mt-3 p-2 text-sm flex items-center gap-2 rounded-lg bg-green-500/10 text-green-700 border border-green-500/20">
                <AlertCircle size={16} />
                <p className="font-medium">{message}</p>
            </div>
        )
    }

    if (adjustment > 0) { // Shortfall
        return (
            <div className="mt-3 p-2 text-sm flex items-center gap-2 rounded-lg bg-yellow-500/10 text-yellow-800 border border-yellow-500/20">
                <AlertCircle size={16} />
                <p className="font-medium">
                    Shortfall of {currencySymbol}{formatNumber(adjustment * fxRate)} will be split.
                </p>
            </div>
        );
    }

    // Surplus
    return (
        <div className="mt-3 p-2 text-sm flex items-center gap-2 rounded-lg bg-blue-500/10 text-blue-800 border border-blue-500/20">
            <AlertCircle size={16} />
            <p className="font-medium">
                Surplus of ${currencySymbol}${formatNumber(absAdjustment * fxRate)} will be distributed.
            </p>
        </div>
    );
};


const ReconciliationDetails: React.FC<{ state: any; dispatch: React.Dispatch<any>, currencySymbol: string, fxRate: number, formatNumber: (num: number) => string }> = ({ state, dispatch, currencySymbol, fxRate, formatNumber }) => {
  const { items, billTotal, discount, taxes, splitMode, tip, payments } = state;

  const { subtotal, discountAmount, serviceChargeAmount, vatAmount, otherTaxAmount, calculatedTotal, adjustment, grandTotal } = useMemo(() => {
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

    const calcTotal = subAfterDiscount + scAmount + vAmount + otAmount;
    const adj = billTotal > 0 ? billTotal - calcTotal : 0;
    const gTotal = calcTotal + adj;

    return { 
        subtotal: sub,
        discountAmount: discAmount, 
        serviceChargeAmount: scAmount,
        vatAmount: vAmount,
        otherTaxAmount: otAmount,
        calculatedTotal: calcTotal,
        adjustment: adj,
        grandTotal: gTotal,
    };
}, [items, billTotal, discount, taxes, splitMode]);


  return (
    <div>
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

            {billTotal > 0 && (
                <div className="flex justify-between items-center pt-1 text-sm font-semibold">
                    <h4 className="text-blue-600">Difference</h4>
                    <span className={`font-mono ${adjustment >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {adjustment >= 0 ? '+' : '-'} {currencySymbol}{Math.abs(adjustment * fxRate).toFixed(2)}
                    </span>
                </div>
            )}

            <div className="flex justify-between items-center pt-2 mt-2 border-t font-bold text-base">
                <h4 className="text-gray-900">Bill Grand Total</h4>
                <span className="font-mono text-gray-900">{currencySymbol}{(grandTotal * fxRate).toFixed(2)}</span>
            </div>

            {tip > 0 && (
                <div className="flex justify-between items-center pt-1 text-sm font-bold">
                    <h4 className="text-blue-600">Tip</h4>
                    <span className="font-mono text-blue-600">+ {currencySymbol}{(tip * fxRate).toFixed(2)}</span>
                </div>
            )}
            
        </div>
         <ReconciliationStatus adjustment={adjustment} currencySymbol={currencySymbol} formatNumber={formatNumber} fxRate={fxRate} billTotal={billTotal}/>
    </div>
  );
};

export default ReconciliationDetails;
