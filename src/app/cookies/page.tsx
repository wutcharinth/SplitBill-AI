
import React from 'react';
import PolicyPageLayout from '@/components/app/PolicyPageLayout';


export default function CookiePolicyPage() {
    return (
        <PolicyPageLayout title="Cookie Policy">
            <p className='text-sm text-muted-foreground'>Last Updated: August 7, 2025</p>
            <div className="mt-6 space-y-4 text-foreground">
                <p>This policy explains how I use <strong>cookies and similar technologies</strong> on the Split Bill AI app (the "App") and the official website, https://splitbill-ai.com (the "Website").</p>
                
                <h2 className="text-xl font-bold font-headline pt-4">1. What Are Cookies?</h2>
                <p>Cookies are <strong>small text files</strong> stored on your device that help the service function and help me understand how you use it.</p>
                
                <h2 className="text-xl font-bold font-headline pt-4">2. How I Use Cookies</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Strictly Necessary:</strong> Essential for the service to function.</li>
                    <li><strong>Performance and Analytics:</strong> Collect anonymous information to help me fix bugs.</li>
                    <li><strong>Functionality:</strong> Remember choices you've made.</li>
                </ul>

                <h2 className="text-xl font-bold font-headline pt-4">3. Your Choices</h2>
                <p>Most browsers and devices allow you to <strong>control cookies</strong> through their settings.</p>
            </div>
        </PolicyPageLayout>
    );
}
