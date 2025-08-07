
'use client';

import React from 'react';
import PolicyPageLayout from '@/components/app/PolicyPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TermsContent = () => (
    <div className="mt-6 space-y-4 text-foreground">
        <p className='text-sm text-muted-foreground'>Effective Date: August 7, 2025</p>
        <p>By downloading, accessing, or using the Split Bill AI mobile application (the "App") or its official website https://splitbill-ai.com (the "Website"), you agree to these Terms of Service ("Terms"). The App and Website are collectively referred to as the "Service."</p>
        <p className="font-bold uppercase">THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." USE IT ENTIRELY AT YOUR OWN RISK.</p>
        
        <h2 className="text-xl font-bold font-headline pt-4">1. Description of Service</h2>
        <p>Split Bill AI is a tool designed to help users split bills and expenses. The features and functionalities are subject to change at any time without notice.</p>

        <h2 className="text-xl font-bold font-headline pt-4">2. Support and Maintenance</h2>
        <p>The Service is provided without any promise of guaranteed support, maintenance, or technical assistance. While I aim to provide a reliable experience, I am under no obligation to provide updates, fix bugs, or respond to general help requests.</p>

        <h2 className="text-xl font-bold font-headline pt-4">3. User-Generated Content</h2>
        <p>You are <strong>solely responsible for Your Content</strong>. By uploading it, you grant me a license to use it solely for the purpose of operating and providing the Service to you.</p>

        <h2 className="text-xl font-bold font-headline pt-4">4. Prohibited Activities</h2>
        <p>You agree not to use the Service to: violate any law; upload malicious code; infringe on any rights; or attempt to reverse-engineer, scrape, or decompile the Service.</p>
        
        <h2 className="text-xl font-bold font-headline pt-4">5. Intellectual Property</h2>
        <p>The Service and its original content (excluding User-Generated Content), features, and functionality are and will remain the exclusive property of the developer and its licensors. The Service is protected by copyright, trademark, and other laws of both Thailand and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of the developer.</p>

        <h2 className="text-xl font-bold font-headline pt-4">6. No Financial Transactions</h2>
        <p>The Service <strong>DOES NOT process payments</strong>. I take no responsibility for any financial transactions.</p>

        <h2 className="text-xl font-bold font-headline pt-4">7. DISCLAIMER OF WARRANTIES</h2>
        <p>THE SERVICE IS PROVIDED <strong>"AS IS" WITHOUT ANY WARRANTY OF ANY KIND</strong>. <strong>I DO NOT WARRANT THAT THE SERVICE WILL BE ACCURATE, RELIABLE, OR ERROR-FREE.</strong></p>

        <h2 className="text-xl font-bold font-headline pt-4">8. LIMITATION OF LIABILITY</h2>
        <p><strong>IN NO EVENT SHALL I (THE DEVELOPER) BE LIABLE</strong> FOR ANY DIRECT, INDIRECT, PUNITIVE, INCIDENTAL, OR CONSEQUENTIAL DAMAGES WHATSOEVER ARISING OUT OF THE USE OF THE SERVICE.</p>

        <h2 className="text-xl font-bold font-headline pt-4">9. Indemnification</h2>
        <p>You agree to <strong>defend and indemnify me</strong> (the developer) from any and all claims, damages, and expenses arising from your use of the Service or your violation of these Terms.</p>

        <h2 className="text-xl font-bold font-headline pt-4">10. Changes to These Terms</h2>
        <p>I reserve the right to modify these Terms at any time. The most current version will always be available at <strong>https://splitbill-ai.com/terms</strong>. By continuing to use the Service after changes are made, you agree to be bound by the revised Terms.</p>

        <h2 className="text-xl font-bold font-headline pt-4">11. Governing Law</h2>
        <p>These Terms shall be governed by the laws of Thailand.</p>
    </div>
);

const PrivacyContent = () => (
     <div className="mt-6 space-y-4 text-foreground">
        <p className='text-sm text-muted-foreground'>Effective Date: August 7, 2025</p>
        <p>This Privacy Policy explains how I, the developer of Split Bill AI (the "App") and its official website https://splitbill-ai.com (the "Website"), handle your information.</p>
        
        <h2 className="text-xl font-bold font-headline pt-4">1. Information I Collect</h2>
        <ul className="list-disc list-inside space-y-2">
            <li><strong>Information You Provide:</strong> I collect the content you upload, including images of receipts and any manually entered expense details.</li>
            <li><strong>Information Collected Automatically:</strong> The App and Website automatically collect anonymous usage data and basic technical information to help me fix bugs and improve the service.</li>
        </ul>
        
        <h2 className="text-xl font-bold font-headline pt-4">2. How I Use Your Information</h2>
        <p>Your data is used <strong>solely to provide the service's features</strong>. I use Google's Gemini models to process receipt images for text extraction. I may review anonymized data to improve the service, but I will not look at your personal receipt details unless it is strictly necessary to investigate a critical security issue or as compelled by law.</p>

        <h2 className="text-xl font-bold font-headline pt-4">3. How I Share Your Information</h2>
        <p>I <strong>do not sell or rent your personal data</strong>. Your receipt images are shared with Google for AI processing as described above. Otherwise, I do not share your information unless legally required.</p>

        <h2 className="text-xl font-bold font-headline pt-4">4. Data Security & Retention</h2>
        <p>I take reasonable steps to secure your data, but as this is an experimental project, I cannot guarantee absolute security. <strong>Use the service at your own risk.</strong></p>

        <h2 className="text-xl font-bold font-headline pt-4">5. Your Privacy Rights</h2>
        <p>Depending on your location, you may have rights regarding your personal information, such as the right to <strong>access, correct, or request deletion</strong>. To make such a request, please contact me at contact@splitbill-ai.com.</p>
        
        <h2 className="text-xl font-bold font-headline pt-4">6. Changes to This Privacy Policy</h2>
        <p>I may update this policy from time to time. The latest version will be available at <strong>https://splitbill-ai.com/terms</strong>.</p>

        <h2 className="text-xl font-bold font-headline pt-4">7. Contact Me</h2>
        <p>For questions specifically about this Privacy Policy or to exercise your privacy rights, please contact me at contact@splitbill-ai.com.</p>
    </div>
);

const CookiesContent = () => (
    <div className="mt-6 space-y-4 text-foreground">
        <p className='text-sm text-muted-foreground'>Last Updated: August 7, 2025</p>
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
);


export default function LegalPage() {
    return (
        <PolicyPageLayout title="Terms & Policies">
            <Tabs defaultValue="terms" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                    <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                    <TabsTrigger value="cookies">Cookie Policy</TabsTrigger>
                </TabsList>
                <TabsContent value="terms">
                    <TermsContent />
                </TabsContent>
                <TabsContent value="privacy">
                    <PrivacyContent />
                </TabsContent>
                <TabsContent value="cookies">
                    <CookiesContent />
                </TabsContent>
            </Tabs>
        </PolicyPageLayout>
    );
}
