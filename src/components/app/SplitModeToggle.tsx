'use client';

import React from 'react';

type SplitMode = 'item' | 'evenly';

interface SplitModeToggleProps {
  mode: SplitMode;
  setMode: (mode: SplitMode) => void;
}

const SplitModeToggle: React.FC<SplitModeToggleProps> = ({ mode, setMode }) => {
  const getButtonClasses = (buttonMode: SplitMode) => {
    return `w-full py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
      mode === buttonMode ? 'bg-white shadow text-gray-800' : 'text-gray-500'
    }`;
  };

  return (
    <div className="flex items-center justify-center space-x-2 bg-gray-100 p-1 rounded-lg">
      <button onClick={() => setMode('item')} className={getButtonClasses('item')}>
        Split by Item
      </button>
      <button onClick={() => setMode('evenly')} className={getButtonClasses('evenly')}>
        Split Evenly
      </button>
    </div>
  );
};

export default SplitModeToggle;

    