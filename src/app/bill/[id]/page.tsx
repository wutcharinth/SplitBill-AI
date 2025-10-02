'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBill, SavedBill } from '@/lib/firebase/billService';
import { Loader2, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import MainApp from '@/components/app/MainApp';
import { AuthProvider } from '@/hooks/useAuth';

function ViewBillPageContent() {
    const params = useParams();
    const router = useRouter();
    const [bill, setBill] = useState<SavedBill | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const billId = params.id as string;

    useEffect(() => {
        loadBill();
    }, [billId]);

    const loadBill = async () => {
        if (!billId) {
            setError('Invalid bill ID');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const savedBill = await getBill(billId);

            if (!savedBill) {
                setError('Bill not found');
            } else if (!savedBill.isPublic) {
                setError('This bill is private');
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
        router.push('/');
    };

    if (loading) {
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
                        This bill may have been deleted or is not available.
                    </p>
                    <Link href="/">
                        <Button>
                            <Home size={16} className="mr-2" />
                            Go Home
                        </Button>
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
                        <Link href="/">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft size={16} className="mr-1" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-foreground">
                                {bill.billData.restaurantName || 'Untitled Bill'}
                            </h1>
                            <p className="text-xs text-muted-foreground">View Only</p>
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
                    initialPage="summary"
                />
            </div>
        </div>
    );
}

export default function ViewBillPage() {
    return (
        <AuthProvider>
            <ViewBillPageContent />
        </AuthProvider>
    );
}
