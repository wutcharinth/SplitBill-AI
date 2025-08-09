
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
import { Wand2, Info, CheckCircle2, AlertCircle, PartyPopper, Receipt } from 'lucide-react';
import SettleUp from './SettleUp';
import ReceiptViewer from './ReceiptViewer';

interface SetupPageProps {
  state: any;
  dispatch: React.Dispatch<any>;
  currencySymbol: string;
  fxRate: number;
  formatNumber: (num: number) => string;
}

const SetupPage: React.FC<SetupPageProps> = ({ state, dispatch, currencySymbol, fxRate, formatNumber }) => {
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);
  
  const { items, billTotal, splitMode, discount, taxes, uploadedReceipt } = state;

  const { totalShares, adjustment, absAdjustment, unassignedItemsCount } = useMemo(() => {
    let sharesTotal = 0;
    let unassignedCount = 0;

    items.forEach((item: any) => {
        const currentItemShares = item.shares.reduce((a: number, b: number) => a + b, 0);
        if (currentItemShares === 0) {
            unassignedCount++;
        }
        sharesTotal += currentItemShares;
    });

    const subtotalOfAssigned = items
        .filter((item: any) => item.shares.reduce((a: number, b: number) => a + b, 0) > 0)
        .reduce((sum: number, item: any) => sum + item.price, 0);

    const discountAmount = discount.type === 'percentage' ? subtotalOfAssigned * (discount.value / 100) : discount.value;
    const subtotalAfterDiscount = subtotalOfAssigned - discountAmount;
    const serviceChargeAmount = taxes.serviceCharge.isEnabled ? taxes.serviceCharge.amount : 0;
    const vatAmount = taxes.vat.isEnabled ? taxes.vat.amount : 0;
    const otherTaxAmount = taxes.otherTax.isEnabled ? taxes.otherTax.amount : 0;
    const calcTotal = subtotalAfterDiscount + serviceChargeAmount + vatAmount + otherTaxAmount;
    const adj = billTotal > 0 ? billTotal - calcTotal : 0;
    
    return { 
      totalShares: sharesTotal, 
      adjustment: adj, 
      absAdjustment: Math.abs(adj),
      unassignedItemsCount: unassignedCount,
    };
  }, [items, discount, taxes, billTotal]);
  
  const getDynamicContent = () => {
      const isNearlyReconciled = absAdjustment > 0 && absAdjustment < 0.1;
      const isReconciled = absAdjustment < 0.01;
      
      let buttonClass = "bg-primary hover:bg-primary/90";
      let balloonWrapperClass = "text-primary-foreground rounded-xl shadow-lg p-3 sm:p-4 border-2 bg-primary border-primary-foreground/50";
      let text = "Help me Reconcile";
      let Icon = Wand2;

      if (splitMode !== 'item') {
          return { buttonClass, balloonWrapperClass, text, Icon };
      }
      
      if (totalShares === 0) {
          text = "Assign Items to Start";
      } else if (isReconciled || isNearlyReconciled) {
          buttonClass = "bg-green-600 hover:bg-green-600/90";
          balloonWrapperClass = "text-primary-foreground rounded-xl shadow-lg p-3 sm:p-4 border-2 bg-green-600 border-green-300";
          text = isReconciled ? "Perfect Match!" : "Almost There!";
          Icon = CheckCircle2;
      } else if (unassignedItemsCount > 0) {
          buttonClass = "bg-yellow-600 hover:bg-yellow-600/90";
          balloonWrapperClass = "text-primary-foreground rounded-xl shadow-lg p-3 sm:p-4 border-2 bg-yellow-600 border-yellow-300";
          text = "Keep Going!";
          Icon = Info;
      } else if (adjustment > 0) { // Shortfall
          buttonClass = "bg-yellow-600 hover:bg-yellow-600/90";
          balloonWrapperClass = "text-primary-foreground rounded-xl shadow-lg p-3 sm:p-4 border-2 bg-yellow-600 border-yellow-300";
          text = "Shortfall Detected";
          Icon = AlertCircle;
      } else { // Surplus
          buttonClass = "bg-orange-500 hover:bg-orange-500/90";
          balloonWrapperClass = "text-primary-foreground rounded-xl shadow-lg p-3 sm:p-4 border-2 bg-orange-500 border-orange-300";
          text = "Surplus Found";
          Icon = PartyPopper;
      }
      
      return { buttonClass, balloonWrapperClass, text, Icon };
  };

  const { buttonClass, balloonWrapperClass, text, Icon } = getDynamicContent();
  
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
        
        {uploadedReceipt && <ReceiptViewer isVisible={isReceiptVisible} onClose={() => setIsReceiptVisible(false)} receiptImage={uploadedReceipt} />}


        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
            {!isGuideVisible && (
              <Button
                onClick={() => setIsGuideVisible(true)}
                className={`rounded-full shadow-lg ${buttonClass}`}
                size="lg"
              >
                <Icon className="mr-2 h-5 w-5" />
                {text}
              </Button>
            )}
             {uploadedReceipt && !isReceiptVisible && (
                <Button
                    onClick={() => setIsReceiptVisible(true)}
                    className="rounded-full shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    size="lg"
                >
                    <Receipt className="mr-2 h-5 w-5" />
                    View Receipt
                </Button>
            )}
        </div>


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
          <Adjustments state={state} dispatch={dispatch} currencySymbol={currencySymbol} fxRate={state.fxRate} formatNumber={formatNumber} />
        </div>

        <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
            <h2 className="text-base font-bold mb-4 text-primary font-headline">{state.splitMode === 'item' ? '5' : '4'}. Reconciliation Details</h2>
           <ReconciliationDetails state={state} dispatch={dispatch} currencySymbol={currencySymbol} fxRate={state.fxRate} formatNumber={formatNumber} />
        </div>

        <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
            <h2 className="text-base font-bold mb-4 text-primary font-headline">{state.splitMode === 'item' ? '6' : '5'}. Settle Up (Optional)</h2>
           <SettleUp state={state} dispatch={dispatch} currencySymbol={currencySymbol} fxRate={state.fxRate} formatNumber={formatNumber} />
        </div>
        
        {/* The stationary receipt is hidden to avoid redundancy with the floating button */}

      </div>
    </div>
  );
};

export default SetupPage;
