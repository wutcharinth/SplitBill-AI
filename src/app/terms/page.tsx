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

export default function TermsOfServicePage() {
    return (
        <PolicyPageLayout title="Terms of Service">
            <p className='text-sm text-muted-foreground'>Effective Date: August 7, 2025</p>
            <div className="mt-6 space-y-4 text-foreground">
                <p>By downloading, accessing, or using the Split Bill AI mobile application (the "App") or its official website https://splitbill-ai.com (the "Website"), you agree to these Terms of Service ("Terms"). The App and Website are collectively referred to as the "Service."</p>
                <p className="font-bold uppercase">THIS SERVICE IS AN EXPERIMENTAL PROTOTYPE PROVIDED "AS IS" AND "AS AVAILABLE." USE IT ENTIRELY AT YOUR OWN RISK.</p>
                
                <h2 className="text-xl font-bold font-headline pt-4">1. Description of Service</h2>
                <p>Split Bill AI is an experimental tool. It is not a commercial product.</p>

                <h2 className="text-xl font-bold font-headline pt-4">2. No Support or Maintenance</h2>
                <p>The Service is provided without any promise of support, maintenance, or technical assistance. I am under no obligation to provide updates, fix bugs, or respond to general help requests. The contact email is provided for legal and privacy-related inquiries only.</p>

                <h2 className="text-xl font-bold font-headline pt-4">3. User-Generated Content</h2>
                <p>You are solely responsible for Your Content. By uploading it, you grant me a license to use it solely for the purpose of operating and providing the Service to you.</p>

                <h2 className="text-xl font-bold font-headline pt-4">4. Prohibited Activities</h2>
                <p>You agree not to use the Service to: violate any law; upload malicious code; infringe on any rights; or attempt to reverse-engineer, scrape, or decompile the Service.</p>

                <h2 className="text-xl font-bold font-headline pt-4">5. No Financial Transactions</h2>
                <p>The Service DOES NOT process payments. I take no responsibility for any financial transactions.</p>

                <h2 className="text-xl font-bold font-headline pt-4">6. DISCLAIMER OF WARRANTIES</h2>
                <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT ANY WARRANTY OF ANY KIND. I DO NOT WARRANT THAT THE SERVICE WILL BE ACCURATE, RELIABLE, OR ERROR-FREE.</p>

                <h2 className="text-xl font-bold font-headline pt-4">7. LIMITATION OF LIABILITY</h2>
                <p>IN NO EVENT SHALL I (THE DEVELOPER) BE LIABLE FOR ANY DIRECT, INDIRECT, PUNITIVE, INCIDENTAL, OR CONSEQUENTIAL DAMAGES WHATSOEVER ARISING OUT OF THE USE OF THE SERVICE.</p>

                <h2 className="text-xl font-bold font-headline pt-4">8. Indemnification</h2>
                <p>You agree to defend and indemnify me (the developer) from any and all claims, damages, and expenses arising from your use of the Service or your violation of these Terms.</p>

                <h2 className="text-xl font-bold font-headline pt-4">9. Changes to These Terms</h2>
                <p>I reserve the right to modify these Terms. The most current version will be at https://splitbill-ai.com/terms.</p>

                <h2 className="text-xl font-bold font-headline pt-4">10. Governing Law</h2>
                <p>These Terms shall be governed by the laws of Thailand.</p>
            </div>
        </PolicyPageLayout>
    );
}
