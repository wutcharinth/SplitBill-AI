import React from 'react';
import Link from 'next/link';

const PolicyPageLayout = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="min-h-screen bg-background text-foreground font-sans">
        <header className="py-4 bg-card border-b">
            <div className="container mx-auto px-4">
                <Link href="/" className="text-xl font-bold font-headline text-primary tracking-tighter">
                    SplitBill AI
                </Link>
            </div>
        </header>
        <main className="container mx-auto px-4 py-8">
            <div className="prose prose-sm md:prose-base max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold font-headline mb-4">{title}</h1>
                {children}
            </div>
        </main>
        <footer className="text-center py-4 mt-8 border-t text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SplitBill AI. All rights reserved.</p>
        </footer>
    </div>
);


export default function CookiePolicyPage() {
    return (
        <PolicyPageLayout title="Cookie Policy">
            <p className='text-sm text-muted-foreground'>Last Updated: August 7, 2025</p>
            <div className="mt-6 space-y-4 text-foreground">
                <p>This policy explains how I use cookies and similar technologies on the Split Bill AI app (the "App") and the official website, https://splitbill-ai.com (the "Website").</p>
                
                <h2 className="text-xl font-bold font-headline pt-4">1. What Are Cookies?</h2>
                <p>Cookies are small text files stored on your device that help the service function and help me understand how you use it.</p>
                
                <h2 className="text-xl font-bold font-headline pt-4">2. How I Use Cookies</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Strictly Necessary:</strong> Essential for the service to function.</li>
                    <li><strong>Performance and Analytics:</strong> Collect anonymous information to help me fix bugs.</li>
                    <li><strong>Functionality:</strong> Remember choices you've made.</li>
                </ul>

                <h2 className="text-xl font-bold font-headline pt-4">3. Your Choices</h2>
                <p>Most browsers and devices allow you to control cookies through their settings.</p>
            </div>
        </PolicyPageLayout>
    );
}
