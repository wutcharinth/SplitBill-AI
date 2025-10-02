'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBill, SavedBill } from '@/lib/firebase/billService';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import MainApp from '@/components/app/MainApp';

function EditBillPageContent() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [bill, setBill] = useState<SavedBill | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const billId = params.id as string;

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/');
            return;
        }

        loadBill();
    }, [billId, user, authLoading]);

    const loadBill = async () => {
        if (!billId || !user) {
            setError('Invalid request');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const savedBill = await getBill(billId);

            if (!savedBill) {
                setError('Bill not found');
            } else if (savedBill.userId !== user.uid) {
                setError('Unauthorized - You can only edit your own bills');
            } else {
                setBill(savedBill);
            }
        } catch (error) {
            console.error('Error loading bill:', error);
            setError('Failed to load bill');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        router.push('/history');
    };

    const handleBillSaved = (savedBillId: string) => {
        // Optionally redirect or show a message
        console.log('Bill saved:', savedBillId);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !bill) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
                    <h1 className="text-xl font-bold text-foreground mb-2">
                        {error || 'Bill not found'}
                    </h1>
                    <p className="text-sm text-muted-foreground mb-4">
                        You may not have permission to edit this bill.
                    </p>
                    <Link href="/history">
                        <Button>Go to History</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/history">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft size={16} className="mr-1" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-foreground">
                                Edit: {bill.billData.restaurantName || 'Untitled Bill'}
                            </h1>
                            <p className="text-xs text-muted-foreground">Make changes and save</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4">
                <MainApp
                    initialBillData={bill.billData}
                    onReset={handleReset}
                    uploadedReceipt={null}
                    billId={billId}
                    onBillSaved={handleBillSaved}
                />
            </div>
        </div>
    );
}

export default function EditBillPage() {
    return (
        <AuthProvider>
            <EditBillPageContent />
        </AuthProvider>
    );
}
