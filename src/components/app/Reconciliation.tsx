'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, AlertCircle, PartyPopper, Info, Pointer } from 'lucide-react';

const Reconciliation: React.FC<{ state: any; currencySymbol: string, fxRate: number, formatNumber: (num: number) => string }> = ({ state, currencySymbol, fxRate, formatNumber }) => {
    const { items, discount, taxes, billTotal, splitMode } = state;

    const { unassignedItemsCount, totalShares } = useMemo(() => {
        let unassignedCount = 0;
        let sharesTotal = 0;
        items.forEach((item: any) => {
            const currentItemShares = item.shares.reduce((a: number, b: number) => a + b, 0);
            if (currentItemShares === 0) {
                unassignedCount++;
            }
            sharesTotal += currentItemShares;
        });
        return { unassignedItemsCount: unassignedCount, totalShares: sharesTotal };
    }, [items]);
    
    const assignedSubtotal = useMemo(() => {
        if (splitMode !== 'item') return 0;
        return items.reduce((sum: number, item: any) => {
            const totalShares = item.shares.reduce((a: number, b: number) => a + b, 0);
            if (totalShares > 0) {
                return sum + item.price;
            }
            return sum;
        }, 0);
    }, [items, splitMode]);

    const { calculatedTotal, adjustment } = useMemo(() => {
        const baseForCharges = assignedSubtotal;
        const discountAmount = discount.type === 'percentage' ? baseForCharges * (discount.value / 100) : discount.value;
        const subtotalAfterDiscount = baseForCharges - discountAmount;
        const serviceChargeAmount = taxes.serviceCharge.isEnabled ? taxes.serviceCharge.amount : 0;
        const vatAmount = taxes.vat.isEnabled ? taxes.vat.amount : 0;
        const otherTaxAmount = taxes.otherTax.isEnabled ? taxes.otherTax.amount : 0;
        const calcTotal = subtotalAfterDiscount + serviceChargeAmount + vatAmount + otherTaxAmount;
        const adj = billTotal > 0 ? billTotal - calcTotal : 0;
        return { calculatedTotal: calcTotal, adjustment: adj };
    }, [assignedSubtotal, discount, taxes, billTotal]);
    
    const renderContent = () => {
        if (splitMode !== 'item') {
            return (
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div>
                        <h4 className="font-bold text-indigo-800 text-sm">Splitting Evenly</h4>
                        <p className="text-xs text-indigo-700 mt-1">
                            The total will be divided equally among the number of people you select below.
                        </p>
                    </div>
                </div>
            );
        }

        if (totalShares === 0) {
            return (
                <div className="flex items-start gap-3">
                    <Pointer className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div>
                        <h4 className="font-bold text-indigo-800 text-sm">Let's Get Started!</h4>
                        <p className="text-xs text-indigo-700 mt-1">
                            Tap the person icons below each item to start assigning shares.
                        </p>
                    </div>
                </div>
            );
        }
        
        if (unassignedItemsCount > 0) {
             return (
                <div className="flex items-start gap-3">
                    <Pointer className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div>
                        <h4 className="font-bold text-indigo-800 text-sm">Keep Going!</h4>
                        <p className="text-xs text-indigo-700 mt-1">
                            You have {unassignedItemsCount} item(s) left to assign.
                        </p>
                    </div>
                </div>
            );
        }

        const absAdjustment = Math.abs(adjustment);
        const isNearlyReconciled = absAdjustment > 0 && absAdjustment < 0.1;
        const isReconciled = absAdjustment < 0.01;
        const matchPercentage = billTotal > 0 ? (1 - absAdjustment / billTotal) * 100 : 100;
        
        if (isReconciled) {
            return (
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div>
                        <h4 className="font-bold text-green-800 text-sm">
                            Perfect Match!
                            <span className="font-mono text-xs ml-2">({matchPercentage.toFixed(2)}% Match)</span>
                        </h4>
                        <p className="text-xs text-green-700 mt-1">
                            The calculated total matches the bill total from the receipt.
                        </p>
                    </div>
                </div>
            );
        }
        
        if (isNearlyReconciled) {
            return (
                 <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div>
                        <h4 className="font-bold text-green-800 text-sm">
                            Almost There!
                            <span className="font-mono text-xs ml-2">({matchPercentage.toFixed(2)}% Match)</span>
                        </h4>
                        <p className="text-xs text-green-700 mt-1">
                            The totals are off by a tiny amount, likely due to rounding. The difference of <strong className="font-mono">{currencySymbol}{formatNumber(adjustment * fxRate)}</strong> will be automatically split to ensure everything matches perfectly.
                        </p>
                    </div>
                </div>
            )
        }

        if (matchPercentage < 90) {
            return (
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div>
                        <h4 className="font-bold text-yellow-800 text-sm">
                            Large Difference Detected
                            <span className="font-mono text-xs ml-2 text-red-600">({matchPercentage.toFixed(2)}% Match)</span>
                        </h4>
                        <p className="text-xs text-yellow-700 mt-1">
                            The calculated total is off by <strong className="font-mono">{currencySymbol}{formatNumber(absAdjustment * fxRate)}</strong>. Please review items and adjustments carefully.
                        </p>
                    </div>
                </div>
            )
        }
        
        const matchClass = matchPercentage > 99 ? 'text-green-700' : 'text-yellow-700';

        if (adjustment > 0) { // Shortfall
            return (
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div>
                        <h4 className="font-bold text-yellow-800 text-sm">
                            Shortfall Detected
                            <span className={`font-mono text-xs ml-2 ${matchClass}`}>({matchPercentage.toFixed(2)}% Match)</span>
                        </h4>
                        <p className="text-xs text-yellow-700 mt-1">
                            There's a difference of <strong className="font-mono">{currencySymbol}{formatNumber(absAdjustment * fxRate)}</strong>. This will be split among everyone.
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
                 <div className="flex items-start gap-3">
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
            <div className="flex items-start gap-3">
                <PartyPopper className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                    <h4 className="font-bold text-indigo-800 text-sm">
                        Surplus Found!
                        <span className={`font-mono text-xs ml-2 ${matchClass}`}>({matchPercentage.toFixed(2)}% Match)</span>
                    </h4>
                    <p className="text-xs text-indigo-700 mt-1">
                        Extra <strong className="font-mono">{currencySymbol}{formatNumber(absAdjustment * fxRate)}</strong> will be distributed back.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-card/80 backdrop-blur-md rounded-xl shadow-card p-3 sm:p-4 border border-border">
            {renderContent()}
        </div>
    );
};

export default Reconciliation;
