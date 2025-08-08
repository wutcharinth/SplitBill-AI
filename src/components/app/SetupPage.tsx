
'use client';

import React from 'react';
import SplitModeToggle from './SplitModeToggle';
import ManagePeople from './ManagePeople';
import ItemAssignment from './ItemAssignment';
import Adjustments from './Adjustments';
import Reconciliation from './Reconciliation';
import ReconciliationDetails from './ReconciliationDetails';
import { SplitMode } from '../types';

interface SetupPageProps {
  state: any;
  dispatch: React.Dispatch<any>;
  currencySymbol: string;
  fxRate: number;
  formatNumber: (num: number) => string;
}

const SetupPage: React.FC<SetupPageProps> = ({ state, dispatch, currencySymbol, fxRate, formatNumber }) => {
  return (
    <div>
      <div className="sticky-reconciliation-container z-30">
        <Reconciliation state={state} currencySymbol={currencySymbol} fxRate={fxRate} formatNumber={formatNumber} />
      </div>

      <div className="space-y-6 mt-12">
        <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
          <h2 className="text-base font-bold mb-1 text-primary font-headline">1. Split Mode</h2>
          <p className="text-xs text-muted-foreground mb-4">Choose whether to split the bill by individual items or divide the total evenly.</p>
          <SplitModeToggle mode={state.splitMode} setMode={(mode: SplitMode) => dispatch({ type: 'SET_SPLIT_MODE', payload: mode })} />
        </div>

        {state.splitMode === 'item' ? (
          <>
            <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
              <h2 className="text-base font-bold mb-1 text-primary font-headline">2. Manage People</h2>
              <p className="text-xs text-muted-foreground mb-4">Add or remove the people who are sharing this bill.</p>
              <ManagePeople people={state.people} dispatch={dispatch} />
            </div>
            <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
              <h2 className="text-base font-bold mb-1 text-primary font-headline">3. Assign Items</h2>
              <p className="text-xs text-muted-foreground mb-4">Review all items from the receipt. Tap a person's icon to assign them a share of an item.</p>
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
            <h2 className="text-base font-bold mb-1 text-primary font-headline">2. How many people?</h2>
            <p className="text-xs text-muted-foreground mb-4">Select the total number of people to divide the bill between.</p>
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
          <h2 className="text-base font-bold mb-1 text-primary font-headline">{state.splitMode === 'item' ? '4' : '3'}. Review & Adjust</h2>
          <p className="text-xs text-muted-foreground mb-4">Apply any overall discounts, taxes, service fees, or tips to the bill.</p>
          <Adjustments state={state} dispatch={dispatch} currencySymbol={currencySymbol} fxRate={fxRate} formatNumber={formatNumber} />
        </div>

        <div className="bg-card rounded-xl shadow-card p-4 sm:p-5">
           <ReconciliationDetails state={state} dispatch={dispatch} currencySymbol={currencySymbol} fxRate={fxRate} formatNumber={formatNumber} />
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
