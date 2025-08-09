
'use client';

import React, { useState, useMemo } from 'react';
import SplitModeToggle from './SplitModeToggle';
import ManagePeople from './ManagePeople';
import ItemAssignment from './ItemAssignment';
import Adjustments from './Adjustments';
import ReconciliationDetails from './ReconciliationDetails';
import { SplitMode } from '../types';
import DraggableReconciliation from './DraggableReconciliation';
import { Button } from '../ui/button';
import { Wand2 } from 'lucide-react';

interface SetupPageProps {
  state: any;
  dispatch: React.Dispatch<any>;
  currencySymbol: string;
  fxRate: number;
  formatNumber: (num: number) => string;
}

const SetupPage: React.FC<SetupPageProps> = ({ state, dispatch, currencySymbol, fxRate, formatNumber }) => {
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  
  const { items, billTotal, splitMode, discount, taxes } = state;

  const { totalShares, adjustment, absAdjustment } = useMemo(() => {
    let sharesTotal = 0;
    items.forEach((item: any) => {
        sharesTotal += item.shares.reduce((a: number, b: number) => a + b, 0);
    });

    const assignedSubtotal = items
        .filter((item: any) => item.shares.reduce((a: number, b: number) => a + b, 0) > 0)
        .reduce((sum: number, item: any) => sum + item.price, 0);

    const discountAmount = discount.type === 'percentage' ? assignedSubtotal * (discount.value / 100) : discount.value;
    const subtotalAfterDiscount = assignedSubtotal - discountAmount;
    const serviceChargeAmount = taxes.serviceCharge.isEnabled ? taxes.serviceCharge.amount : 0;
    const vatAmount = taxes.vat.isEnabled ? taxes.vat.amount : 0;
    const otherTaxAmount = taxes.otherTax.isEnabled ? taxes.otherTax.amount : 0;
    const calcTotal = subtotalAfterDiscount + serviceChargeAmount + vatAmount + otherTaxAmount;
    const adj = billTotal > 0 ? billTotal - calcTotal : 0;
    
    return { 
      totalShares: sharesTotal, 
      adjustment: adj, 
      absAdjustment: Math.abs(adj) 
    };
  }, [items, discount, taxes, billTotal]);

  const getDynamicClasses = () => {
    const isNearlyReconciled = absAdjustment > 0 && absAdjustment < 0.1;
    const isReconciled = absAdjustment < 0.01;

    let bgClass = "bg-primary hover:bg-primary/90"; // For Button
    let balloonWrapperClass = "text-primary-foreground rounded-xl shadow-lg p-3 sm:p-4 border-2 bg-primary border-primary-foreground/50";

    if (totalShares === 0 && splitMode === 'item') {
        // Initial state, use default colors
    } else if (isReconciled || isNearlyReconciled) {
        bgClass = "bg-green-600 hover:bg-green-600/90";
        balloonWrapperClass = "text-primary-foreground rounded-xl shadow-lg p-3 sm:p-4 border-2 bg-green-600 border-green-300";
    } else if (adjustment > 0) { // Shortfall
        bgClass = "bg-yellow-600 hover:bg-yellow-600/90";
        balloonWrapperClass = "text-primary-foreground rounded-xl shadow-lg p-3 sm:p-4 border-2 bg-yellow-600 border-yellow-300";
    } else { // Surplus
        bgClass = "bg-orange-500 hover:bg-orange-500/90";
        balloonWrapperClass = "text-primary-foreground rounded-xl shadow-lg p-3 sm:p-4 border-2 bg-orange-500 border-orange-300";
    }
    
    return { buttonClass: bgClass, balloonWrapperClass };
  };

  const { buttonClass, balloonWrapperClass } = getDynamicClasses();
  
  return (
    <div>
       <DraggableReconciliation 
          state={state} 
          currencySymbol={currencySymbol} 
          fxRate={fxRate} 
          formatNumber={formatNumber}
          isVisible={isGuideVisible}
          onClose={() => setIsGuideVisible(false)}
          wrapperClass={balloonWrapperClass}
        />

        {!isGuideVisible && (
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              onClick={() => setIsGuideVisible(true)}
              className={`rounded-full shadow-lg ${buttonClass}`}
              size="lg"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              Help me Reconcile
            </Button>
          </div>
        )}


      <div className="space-y-3 mt-4">
        <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
          <h2 className="text-base font-bold mb-4 text-primary font-headline">1. Split Mode</h2>
          <SplitModeToggle mode={state.splitMode} setMode={(mode: SplitMode) => dispatch({ type: 'SET_SPLIT_MODE', payload: mode })} />
        </div>

        {state.splitMode === 'item' ? (
          <>
            <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
              <h2 className="text-base font-bold mb-4 text-primary font-headline">2. Manage People</h2>
              <ManagePeople people={state.people} dispatch={dispatch} />
            </div>
            <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
              <h2 className="text-base font-bold mb-4 text-primary font-headline">3. Assign Items</h2>
              <ItemAssignment
                items={state.items}
                people={state.people}
                currencySymbol={currencySymbol}
                fxRate={state.fxRate}
                dispatch={dispatch}
              />
            </div>
          </>
        ) : (
          <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
            <h2 className="text-base font-bold mb-4 text-primary font-headline">2. How many people?</h2>
            <div className="flex items-center justify-between space-x-4 bg-muted p-4 rounded-lg">
              <label htmlFor="people-count-evenly" className="font-semibold text-foreground text-sm">Split between:</label>
              <input
                type="number"
                id="people-count-evenly"
                value={state.peopleCountEvenly}
                min="1"
                onChange={(e) => dispatch({ type: 'SET_PEOPLE_COUNT_EVENLY', payload: Number(e.target.value) })}
                className="w-20 text-center bg-card border border-border rounded-md p-2 text-base font-bold text-foreground"
              />
              <span className="font-semibold text-foreground text-sm">people</span>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl shadow-card p-4 sm:p-5" id="adjustments-section">
          <h2 className="text-base font-bold mb-4 text-primary font-headline">{state.splitMode === 'item' ? '4' : '3'}. Review & Adjust</h2>
          <Adjustments state={state} dispatch={dispatch} currencySymbol={currencySymbol} fxRate={fxRate} formatNumber={formatNumber} />
        </div>

        <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
           <ReconciliationDetails state={state} dispatch={dispatch} currencySymbol={currencySymbol} fxRate={fxRate} formatNumber={formatNumber} />
        </div>
        
        {state.uploadedReceipt && (
          <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
            <h2 className="text-base font-bold mb-4 text-primary font-headline">Original Receipt</h2>
            <img 
              src={`data:image/png;base64,${state.uploadedReceipt}`} 
              alt="Uploaded Receipt"
              className="w-full rounded-lg" 
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default SetupPage;
