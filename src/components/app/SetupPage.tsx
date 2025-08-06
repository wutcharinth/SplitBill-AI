import React from 'react';
import SplitModeToggle from './SplitModeToggle';
import ManagePeople from './ManagePeople';
import ItemAssignment from './ItemAssignment';
import Adjustments from './Adjustments';
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
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-card p-4 sm:p-6">
        <h2 className="text-lg font-bold mb-4 text-agoda-blue">1. Split Mode</h2>
        <SplitModeToggle mode={state.splitMode} setMode={(mode: SplitMode) => dispatch({ type: 'SET_SPLIT_MODE', payload: mode })} />
      </div>

      {state.splitMode === 'item' ? (
        <>
          <div className="bg-white rounded-xl shadow-card p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-4 text-agoda-blue">2. Manage People</h2>
            <ManagePeople people={state.people} dispatch={dispatch} />
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-4 text-agoda-blue">3. Assign Items</h2>
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
        <div className="bg-white rounded-xl shadow-card p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-4 text-agoda-blue">2. How many people?</h2>
          <div className="flex items-center justify-between space-x-4 bg-gray-50 p-4 rounded-lg">
            <label htmlFor="people-count-evenly" className="font-semibold text-gray-900">Split between:</label>
            <input
              type="number"
              id="people-count-evenly"
              value={state.peopleCountEvenly}
              min="1"
              onChange={(e) => dispatch({ type: 'SET_PEOPLE_COUNT_EVENLY', payload: Number(e.target.value) })}
              className="w-24 text-center bg-white border border-gray-200 rounded-md p-2 text-lg font-bold text-gray-900"
            />
            <span className="font-semibold text-gray-900">people</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-card p-4 sm:p-6">
        <h2 className="text-lg font-bold mb-4 text-agoda-blue">{state.splitMode === 'item' ? '4' : '3'}. Adjustments &amp; Reconciliation</h2>
        <Adjustments state={state} dispatch={dispatch} currencySymbol={currencySymbol} fxRate={state.fxRate} formatNumber={formatNumber} />
      </div>
    </div>
  );
};

export default SetupPage;
