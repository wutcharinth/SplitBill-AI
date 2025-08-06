'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const USAGE_LIMIT = 5;
const LOCAL_STORAGE_KEY = 'splitbill_usage';

interface UsageState {
  uses: number;
  resetMonth: number; // Storing month as 1-12
}

interface UsageContextType {
  monthlyUses: number;
  canUse: boolean;
  recordUsage: () => void;
  resetUsage: () => void;
  USAGE_LIMIT: number;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export const UsageProvider = ({ children }: { children: ReactNode }) => {
  const [usageState, setUsageState] = useState<UsageState>({ uses: 0, resetMonth: new Date().getMonth() + 1 });

  useEffect(() => {
    let storedUsage: UsageState | null = null;
    try {
      const storedItem = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedItem) {
        storedUsage = JSON.parse(storedItem);
      }
    } catch (error) {
        console.error("Failed to parse usage data from localStorage", error);
    }

    const currentMonth = new Date().getMonth() + 1;
    if (storedUsage && storedUsage.resetMonth === currentMonth) {
      setUsageState(storedUsage);
    } else {
      // Reset for new month or if no data exists
      setUsageState({ uses: 0, resetMonth: currentMonth });
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ uses: 0, resetMonth: currentMonth }));
      } catch (error) {
          console.error("Failed to save initial usage data to localStorage", error);
      }
    }
  }, []);

  const recordUsage = () => {
    setUsageState(prev => {
      const newUses = prev.uses + 1;
      const newState = { ...prev, uses: newUses };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
      } catch (error) {
        console.error("Failed to save usage data to localStorage", error);
      }
      return newState;
    });
  };

  const resetUsage = () => {
    const currentMonth = new Date().getMonth() + 1;
    const newState = { uses: 0, resetMonth: currentMonth };
    setUsageState(newState);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Failed to reset usage data in localStorage", error);
    }
  };

  const canUse = usageState.uses < USAGE_LIMIT;

  return (
    <UsageContext.Provider value={{ monthlyUses: usageState.uses, canUse, recordUsage, resetUsage, USAGE_LIMIT }}>
      {children}
    </UsageContext.Provider>
  );
};

export const useUsage = () => {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
};
