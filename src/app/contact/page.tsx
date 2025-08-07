
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PolicyPageLayout from '@/components/app/PolicyPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please fill out all fields before submitting.',
            });
            return;
        }

        const subject = encodeURIComponent(`SplitBill AI Inquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        window.location.href = `mailto:contact@splitbill-ai.com?subject=${subject}&body=${body}`;
        
        toast({
            title: 'Redirecting to Email',
            description: 'Your email client has been opened to send your message.',
        });
    };

    return (
        <PolicyPageLayout title="Contact Us">
            <p className="text-muted-foreground">
                Have a question, feedback, or a legal inquiry? Please use the form below. I will get back to you as soon as possible.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-semibold">Full Name</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-card"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-semibold">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-card"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground font-semibold">Message</Label>
                    <Textarea
                        id="message"
                        placeholder="Please describe your inquiry here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={6}
                        className="bg-card"
                    />
                </div>
                <Button type="submit" className="w-full font-bold">
                    Send via Email Client
                </Button>
            </form>
        </PolicyPageLayout>
    );
}
