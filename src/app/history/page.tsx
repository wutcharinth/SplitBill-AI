'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { getUserBills, deleteBill, SavedBill } from '@/lib/firebase/billService';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, ExternalLink, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { CURRENCIES } from '@/components/constants';

function HistoryPageContent() {
    const { user, loading: authLoading } = useAuth();
    const [bills, setBills] = useState<SavedBill[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/');
            return;
        }

        loadBills();
    }, [user, authLoading, router]);

    const loadBills = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const userBills = await getUserBills(user.uid);
            setBills(userBills);
        } catch (error) {
            console.error('Error loading bills:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load your bills.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (billId: string, restaurantName: string) => {
        if (!user) return;

        if (!confirm(`Delete bill "${restaurantName || 'Untitled'}"?`)) {
            return;
        }

        try {
            await deleteBill(billId, user.uid);
            setBills(bills.filter(b => b.id !== billId));
            toast({
                title: 'Bill deleted',
                description: 'The bill has been deleted successfully.',
            });
        } catch (error) {
            console.error('Error deleting bill:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete bill.',
            });
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">My Bills</h1>
                        <p className="text-sm text-muted-foreground">View and manage your saved bills</p>
                    </div>
                    <Link href="/">
                        <Button variant="outline">New Bill</Button>
                    </Link>
                </div>

                {bills.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg border border-border">
                        <p className="text-muted-foreground mb-4">No saved bills yet</p>
                        <Link href="/">
                            <Button>Create Your First Bill</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bills.map((bill) => {
                            const currencySymbol = CURRENCIES[bill.billData.baseCurrency] || bill.billData.baseCurrency;

                            return (
                                <div
                                    key={bill.id}
                                    className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-foreground text-lg truncate">
                                                {bill.billData.restaurantName || 'Untitled Bill'}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <Calendar size={12} />
                                                <span>{bill.billData.billDate || formatDate(bill.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm mb-3">
                                        <DollarSign size={14} className="text-primary" />
                                        <span className="font-semibold text-foreground">
                                            {currencySymbol}{bill.billData.billTotal.toFixed(2)}
                                        </span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-muted-foreground">
                                            {bill.billData.people.length} {bill.billData.people.length === 1 ? 'person' : 'people'}
                                        </span>
                                    </div>

                                    <div className="text-xs text-muted-foreground mb-4">
                                        Updated: {formatDate(bill.updatedAt)}
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/edit/${bill.id}`} className="flex-1">
                                            <Button variant="default" className="w-full" size="sm">
                                                Edit
                                            </Button>
                                        </Link>
                                        <Link href={`/bill/${bill.id}`} className="flex-1">
                                            <Button variant="outline" className="w-full" size="sm">
                                                <ExternalLink size={14} className="mr-1" />
                                                View
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(bill.id, bill.billData.restaurantName)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function HistoryPage() {
    return (
        <AuthProvider>
            <HistoryPageContent />
        </AuthProvider>
    );
}
