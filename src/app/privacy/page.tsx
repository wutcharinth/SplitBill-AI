import React from 'react';
import Link from 'next/link';

const PolicyPageLayout = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="min-h-screen bg-background text-foreground font-sans">
        <header className="py-4 bg-card border-b">
            <div className="container mx-auto px-4">
                <Link href="/" className="inline-flex items-center gap-3">
                    <img src="https://i.postimg.cc/x1mkMHxS/image.png" alt="SplitBill AI Logo" className="h-10" />
                    <div>
                        <h1 className="text-base font-bold text-foreground font-headline">SplitBill AI</h1>
                        <p className="text-xs text-muted-foreground">Snap. Split. Done.</p>
                    </div>
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

export default function PrivacyPolicyPage() {
    return (
        <PolicyPageLayout title="Privacy Policy">
            <p className='text-sm text-muted-foreground'>Effective Date: August 7, 2025</p>
            <div className="mt-6 space-y-4 text-foreground">
                <p>This Privacy Policy explains how I, the developer of Split Bill AI (the "App") and its official website https://splitbill-ai.com (the "Website"), handle your information.</p>
                
                <h2 className="text-xl font-bold font-headline pt-4">1. Information I Collect</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Information You Provide:</strong> I collect the content you upload, including images of receipts and any manually entered expense details.</li>
                    <li><strong>Information Collected Automatically:</strong> The App and Website automatically collect anonymous usage data and basic technical information to help me fix bugs and improve the service.</li>
                </ul>
                
                <h2 className="text-xl font-bold font-headline pt-4">2. How I Use Your Information</h2>
                <p>Your data is used solely to provide the service's features. I use Google's Gemini models to process receipt images for text extraction. I may review anonymized data to improve the service, but I will not look at your personal receipt details unless it is strictly necessary to investigate a critical security issue or as compelled by law.</p>

                <h2 className="text-xl font-bold font-headline pt-4">3. How I Share Your Information</h2>
                <p>I do not sell or rent your personal data. Your receipt images are shared with Google for AI processing as described above. Otherwise, I do not share your information unless legally required.</p>

                <h2 className="text-xl font-bold font-headline pt-4">4. Data Security & Retention</h2>
                <p>I take reasonable steps to secure your data, but as this is an experimental project, I cannot guarantee absolute security. Use the service at your own risk.</p>

                <h2 className="text-xl font-bold font-headline pt-4">5. Your Privacy Rights</h2>
                <p>Depending on your location, you may have rights regarding your personal information, such as the right to access, correct, or request deletion. To make such a request, please contact me at contact@splitbill-ai.com.</p>
                
                <h2 className="text-xl font-bold font-headline pt-4">6. Changes to This Privacy Policy</h2>
                <p>I may update this policy from time to time. The latest version will be available at https://splitbill-ai.com/privacy.</p>

                <h2 className="text-xl font-bold font-headline pt-4">7. Contact Me</h2>
                <p>For questions specifically about this Privacy Policy or to exercise your privacy rights, please contact me at contact@splitbill-ai.com.</p>
            </div>
        </PolicyPageLayout>
    );
}
