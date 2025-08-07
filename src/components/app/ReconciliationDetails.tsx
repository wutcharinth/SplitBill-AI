'use client';

import React, { useMemo } from 'react';

const AdjustmentRow: React.FC<{ label: React.ReactNode; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex justify-between items-center py-2">
        <label className="font-semibold text-gray-700 text-xs">{label}</label>
        {children}
    </div>
);


const ReconciliationDetails: React.FC<{ state: any; dispatch: React.Dispatch<any>, currencySymbol: string, fxRate: number, formatNumber: (num: number) => string }> = ({ state, dispatch, currencySymbol, fxRate, formatNumber }) => {
  const { items, billTotal } = state;

  const originalSubtotal = useMemo(() => items.reduce((sum: number, item: any) => sum + item.price, 0), [items]);

  return (
    <div>
        <h2 className="text-base font-bold mb-4 text-primary font-headline">Reconciliation Details</h2>
        <div className="space-y-1 pt-2">
            <AdjustmentRow label="Receipt Total">
                <div className="flex items-center">
                    <span className="mr-2 text-gray-500 text-xs">{currencySymbol}</span>
                    <input 
                        type="number" 
                        value={billTotal > 0 ? (billTotal * fxRate).toFixed(2) : ''} 
                        onChange={e => dispatch({type: 'UPDATE_BILL_TOTAL', payload: Number(e.target.value) / fxRate})} 
                        className="w-24 text-right bg-transparent border border-gray-300 rounded-md p-1 font-mono text-xs text-gray-900"
                        placeholder="Enter total"
                    />
                </div>
            </AdjustmentRow>
            <AdjustmentRow label="Original Items Subtotal">
                <div className="flex items-center">
                    <span className="mr-2 text-gray-500 text-xs">{currencySymbol}</span>
                    <input type="text" value={(originalSubtotal * fxRate).toFixed(2)} readOnly className="w-24 text-right bg-gray-100 rounded-md p-1 font-mono text-xs border-none text-gray-700" />
                </div>
            </AdjustmentRow>
        </div>
    </div>
  );
};

export default ReconciliationDetails;
