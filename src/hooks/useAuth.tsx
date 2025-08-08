
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    User,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { app } from '@/lib/firebase/config';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<any>;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
    });

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          toast({
            title: 'Sign In Successful',
            description: `Welcome back, ${result.user.displayName || result.user.email}!`,
          });
        }
      })
      .catch((error) => {
        // Handle Errors here.
        console.error("Error getting redirect result:", error);
        toast({
          variant: 'destructive',
          title: 'Sign In Failed',
          description: error.message,
        });
      }).finally(() => {
        setLoading(false);
      });

    return () => unsubscribe();
  }, [toast]);

  const signUp = async (email: string, pass: string) => {
    setLoading(true);
    try {
        return await createUserWithEmailAndPassword(auth, email, pass);
    } finally {
        setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
        return await signInWithEmailAndPassword(auth, email, pass);
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    return await signOut(auth);
  };

  const sendPasswordReset = async (email: string) => {
    return await sendPasswordResetEmail(auth, email);
  }

  const value = {
    user,
    loading,
    signUp,
    login,
    logout,
    sendPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
