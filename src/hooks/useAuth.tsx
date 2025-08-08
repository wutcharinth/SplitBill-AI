
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// This is a placeholder for a real user object from Firebase Auth
interface User {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This provider component will wrap your app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd have a listener here for Firebase Auth state changes
    // For this placeholder, we'll just simulate checking for a logged-in user
    try {
        const storedUser = localStorage.getItem('splitbill_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch(e) {
        console.error("Could not read user from localStorage", e);
    }
    setLoading(false);
  }, []);

  // Placeholder login function
  const login = async (email: string, pass: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockUser = { uid: `mock-${Date.now()}`, email };
    setUser(mockUser);
    try {
        localStorage.setItem('splitbill_user', JSON.stringify(mockUser));
    } catch (e) {
        console.error("Could not save user to localStorage", e);
    }
    setLoading(false);
  };

  // Placeholder logout function
  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
     try {
        localStorage.removeItem('splitbill_user');
    } catch (e) {
        console.error("Could not remove user from localStorage", e);
    }
    setLoading(false);
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
