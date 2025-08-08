
import React from 'react';
import Link from 'next/link';

const PolicyFooterNavigation = () => (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        <Link href="/about" className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors">About</Link>
        <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors">Terms & Policies</Link>
        <Link href="/contact" className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors">Contact</Link>
    </div>
);


const PolicyPageLayout = ({ title, children, disableHeaderLink = false }: { title: string, children: React.ReactNode, disableHeaderLink?: boolean }) => {
    const HeaderContent = () => (
        <div className="inline-flex items-center gap-3">
            <img src="https://i.postimg.cc/x1mkMHxS/image.png" alt="SplitBill AI Logo" className="h-10" />
            <div>
                <h1 className="text-base font-bold text-foreground font-headline">SplitBill AI</h1>
                <p className="text-xs text-muted-foreground">Snap.Split.Share!</p>
            </div>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <header className="py-4 bg-card border-b sticky top-0 z-10 backdrop-blur-sm bg-background/95">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    {disableHeaderLink ? (
                        <div className="cursor-default">
                            <HeaderContent />
                        </div>
                    ) : (
                        <Link href="/">
                            <HeaderContent />
                        </Link>
                    )}
                    <div className="hidden md:flex">
                        <PolicyFooterNavigation />
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {title && <h1 className="text-3xl font-bold font-headline mb-4 text-foreground">{title}</h1>}
                    <div className="prose prose-sm md:prose-base max-w-none text-foreground">
                        {children}
                    </div>
                </div>
            </main>
            <footer className="text-center py-6 mt-8 border-t text-xs text-muted-foreground">
                <div className="md:hidden mb-4">
                    <PolicyFooterNavigation />
                </div>
                <p>&copy; {new Date().getFullYear()} SplitBill AI. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default PolicyPageLayout;

    
