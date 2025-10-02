
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
        <path d="M1 1h22v22H1z" fill="none" />
    </svg>
);


const AuthForm = () => {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const { toast } = useToast();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />;
  }

  if (user) {
    return (
      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-card border">
        <div className="flex items-center gap-2">
            <Avatar>
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground truncate">{user.displayName || user.email}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut} title="Sign Out">
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    );
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast({
          title: 'Account created!',
          description: 'Welcome to SplitBill AI',
        });
      } else {
        await signInWithEmail(email, password);
        toast({
          title: 'Signed in successfully!',
        });
      }
      setEmail('');
      setPassword('');
      setShowEmailForm(false);
    } catch (error: any) {
      let errorMessage = 'An error occurred';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }

      toast({
        variant: 'destructive',
        title: 'Authentication failed',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showEmailForm) {
    return (
      <div className="space-y-3">
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <Input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isSubmitting}
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEmailForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
        <Button
          variant="link"
          className="w-full text-xs"
          onClick={() => setIsSignUp(!isSignUp)}
          disabled={isSubmitting}
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={signInWithGoogle} variant="outline" className="w-full font-bold border-2">
        <GoogleIcon />
        <span className="ml-2">Sign in with Google</span>
      </Button>
      <Button
        onClick={() => setShowEmailForm(true)}
        variant="outline"
        className="w-full font-bold border-2"
      >
        <Mail className="h-5 w-5" />
        <span className="ml-2">Sign in with Email</span>
      </Button>
    </div>
  );
};

export default AuthForm;
