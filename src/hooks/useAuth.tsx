
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
} from 'firebase/auth';
import { app } from '@/lib/firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<any>;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const auth = getAuth(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
         // Check for redirect result when the app loads
        getRedirectResult(auth)
          .then((result) => {
            if (result && result.user) {
              setUser(result.user);
            }
          })
          .catch((error) => {
            // Handle Errors here.
            console.error("Error getting redirect result:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
    return () => unsubscribe();
  }, []);

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

  const loginWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    // This function will navigate the user away to the Google sign-in page.
    await signInWithRedirect(auth, provider);
    // The result is handled by the useEffect hook when the user is redirected back.
  };

  const logout = async () => {
    return await signOut(auth);
  };

  const value = {
    user,
    loading,
    signUp,
    login,
    logout,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
