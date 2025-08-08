
'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, AlertCircle, PartyPopper, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Reconciliation: React.FC<{ state: any; currencySymbol: string, fxRate: number, formatNumber: (num: number) => string }> = ({ state, currencySymbol, fxRate, formatNumber }) => {
    const { items, discount, taxes, billTotal, splitMode } = state;

    const { unassignedItemsCount, totalShares, assignedSubtotal } = useMemo(() => {
        let unassignedCount = 0;
        let sharesTotal = 0;
        let subtotal = 0;
        items.forEach((item: any) => {
            const currentItemShares = item.shares.reduce((a: number, b: number) => a + b, 0);
            if (currentItemShares === 0) {
                unassignedCount++;
            } else {
                subtotal += item.price;
            }
            sharesTotal += currentItemShares;
        });
        return { unassignedItemsCount: unassignedCount, totalShares: sharesTotal, assignedSubtotal: subtotal };
    }, [items]);
    
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

    const absAdjustment = Math.abs(adjustment);
    const matchPercentage = billTotal > 0 ? Math.max(0, (1 - absAdjustment / billTotal) * 100) : (totalShares > 0 ? 0 : 100);

    const getProgressColor = () => {
        if (matchPercentage > 99) return "bg-green-500";
        if (matchPercentage > 90) return "bg-yellow-500";
        return "bg-red-500";
    }

    const MatchProgress = () => (
        <div className="mt-2 w-full">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-muted-foreground">Match Progress</span>
                <span className="text-xs font-bold text-foreground">{matchPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={matchPercentage} indicatorClassName={getProgressColor()} className="w-full" />
        </div>
    );
    
    const renderContent = () => {
        if (splitMode !== 'item') {
            return (
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div>
                        <h4 className="font-bold text-foreground text-base">Splitting Evenly</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            The total will be divided equally among the number of people you select below.
                        </p>
                    </div>
                </div>
            );
        }

        if (totalShares === 0) {
            return (
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div>
                        <h4 className="font-bold text-foreground text-base">
                            Let's Get Started!
                        </h4>
                         <p className="text-sm text-muted-foreground mt-1">
                            Assign items below to see the calculation match the receipt total.
                        </p>
                    </div>
                </div>
            );
        }
        
        if (unassignedItemsCount > 0) {
             return (
                <div className="flex items-start gap-3 w-full">
                    <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div className="flex-grow">
                        <h4 className="font-bold text-foreground text-base">
                            Keep Going!
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            You have {unassignedItemsCount} item(s) left to assign.
                        </p>
                        <MatchProgress />
                    </div>
                </div>
            );
        }

        const isNearlyReconciled = absAdjustment > 0 && absAdjustment < 0.1;
        const isReconciled = absAdjustment < 0.01;
        
        if (isReconciled) {
            return (
                <div className="flex items-start gap-3 w-full">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div className="flex-grow">
                        <h4 className="font-bold text-green-800 text-base">
                            Perfect Match!
                        </h4>
                        <p className="text-sm text-green-700 mt-1">
                            The calculated total matches the bill total from the receipt.
                        </p>
                        <MatchProgress />
                    </div>
                </div>
            );
        }
        
        if (isNearlyReconciled) {
            return (
                 <div className="flex items-start gap-3 w-full">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div className="flex-grow">
                        <h4 className="font-bold text-green-800 text-base">
                            Almost There!
                        </h4>
                        <p className="text-sm text-green-700 mt-1">
                            The totals are off by a tiny amount, likely due to rounding. The difference of <strong className="font-mono">{currencySymbol}{formatNumber(adjustment * fxRate)}</strong> will be automatically split to ensure everything matches perfectly.
                        </p>
                         <MatchProgress />
                    </div>
                </div>
            )
        }

        if (matchPercentage < 90) {
            return (
                <div className="flex items-start gap-3 w-full">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div className="flex-grow">
                        <h4 className="font-bold text-yellow-800 text-base">
                            Large Difference Detected
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                            The calculated total is off by <strong className="font-mono">{currencySymbol}{formatNumber(absAdjustment * fxRate)}</strong>. Please review items and adjustments carefully.
                        </p>
                        <MatchProgress />
                    </div>
                </div>
            )
        }
        
        if (adjustment > 0) { // Shortfall
            return (
                <div className="flex items-start gap-3 w-full">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div className="flex-grow">
                        <h4 className="font-bold text-yellow-800 text-base">
                            Shortfall Detected
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                            There's a difference of <strong className="font-mono">{currencySymbol}{formatNumber(absAdjustment * fxRate)}</strong>. This will be split among everyone.
                        </p>
                        <MatchProgress />
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
                 <div className="flex items-start gap-3 w-full">
                    <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div className="flex-grow">
                        <h4 className="font-bold text-foreground text-base">Surplus Found!</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            The surplus of <strong className="font-mono">{currencySymbol}{formatNumber(surplus * fxRate)}</strong> is very similar to your <strong className="font-semibold">'{taxLikeSurplus.name}'</strong>.
                            Could the AI have mistaken this tax for a line item? Please review the items list above.
                        </p>
                         <MatchProgress />
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-start gap-3 w-full">
                <PartyPopper className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <div className="flex-grow">
                    <h4 className="font-bold text-foreground text-base">
                        Surplus Found!
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                        Extra <strong className="font-mono">{currencySymbol}{formatNumber(absAdjustment * fxRate)}</strong> will be distributed back.
                    </p>
                    <MatchProgress />
                </div>
            </div>
        );
    };

    const getWrapperClass = () => {
        const baseClass = "bg-card/80 backdrop-blur-sm rounded-xl shadow-card p-3 sm:p-4 border";
        const isNearlyReconciled = absAdjustment > 0 && absAdjustment < 0.1;
        const isReconciled = absAdjustment < 0.01;

        if (isReconciled || isNearlyReconciled) {
            return `${baseClass} bg-green-500/10 border-green-500/20`;
        }
        if (adjustment > 0 || (matchPercentage < 90 && totalShares > 0)) {
            return `${baseClass} bg-yellow-500/10 border-yellow-500/20`;
        }
        return `${baseClass} bg-accent/10 border-accent/20`;
    };


    return (
        <div className={getWrapperClass()}>
            {renderContent()}
        </div>
    );
};

export default Reconciliation;
