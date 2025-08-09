
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface AuthFormProps {
    onAuthSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, signUp, sendPasswordReset, loading } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signUp(email, password);
            }
            toast({
                title: isLogin ? 'Login Successful' : 'Signup Successful',
                description: "Welcome to SplitBill AI!",
                variant: 'success',
            });
            onAuthSuccess();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Authentication Failed',
                description: error.message,
            });
        }
    };
    
    const handlePasswordReset = async () => {
        if (!email) {
            toast({
                variant: 'destructive',
                title: 'Email Required',
                description: 'Please enter your email address to reset your password.',
            });
            return;
        }
        try {
            await sendPasswordReset(email);
            toast({
                title: 'Password Reset Email Sent',
                description: 'Check your inbox for instructions to reset your password.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Password Reset Failed',
                description: error.message,
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
            <div className="w-full max-w-sm mx-auto">
                <div className="text-center mb-6">
                    <img src="https://i.postimg.cc/hgX62bcn/Chat-GPT-Image-Aug-8-2025-04-14-15-PM.png" alt="SplitBill AI Logo" className="h-24 w-24 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold text-foreground font-headline">Welcome to SplitBill AI</h1>
                    <p className="text-muted-foreground">{isLogin ? 'Sign in to continue' : 'Create an account to get started'}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full font-bold" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Log In' : 'Sign Up')}
                    </Button>
                </form>
                
                <div className="text-center mt-4 text-sm">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
                        {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
                    </button>
                    {isLogin && (
                        <p className="mt-2">
                            <button onClick={handlePasswordReset} className="text-muted-foreground hover:underline text-xs">
                                Forgot password?
                            </button>
                        </p>
                    )}
                </div>
                <footer className="text-center pt-8 mt-4 text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} SplitBill AI. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default AuthForm;
