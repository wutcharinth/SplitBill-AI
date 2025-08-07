
'use client';

import React, { useState } from 'react';
import PolicyPageLayout from '@/components/app/PolicyPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Paperclip } from 'lucide-react';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [inquiryType, setInquiryType] = useState('');
    const [fileName, setFileName] = useState('');
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    variant: 'destructive',
                    title: 'File Too Large',
                    description: 'Please select a file smaller than 5MB.',
                });
                setFileName('');
                e.target.value = ''; // Reset the input
            } else {
                setFileName(file.name);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message || !inquiryType) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please fill out all fields before submitting.',
            });
            return;
        }

        const subject = encodeURIComponent(`SplitBill AI Inquiry: ${inquiryType} from ${name}`);
        let body = `Name: ${name}\nEmail: ${email}\nInquiry Type: ${inquiryType}\n\nMessage:\n${message}`;
        if (fileName) {
            body += `\n\n--- User intended to attach file: ${fileName} ---`;
        }

        const mailtoLink = `mailto:contact@splitbill-ai.com?subject=${subject}&body=${encodeURIComponent(body)}`;
        
        // This is a bit of a hack for client-side only. 
        // We open the mail client and then show a confirmation.
        window.location.href = mailtoLink;
        
        toast({
            title: 'Redirecting to Email Client',
            description: `Your email client has been opened to send your message. ${fileName ? 'Please remember to manually attach your file!' : ''}`,
        });
    };

    return (
        <PolicyPageLayout title="Contact Us">
            <p className="text-muted-foreground">
                Have a <strong>question</strong>, <strong>feedback</strong>, or a <strong>legal inquiry</strong>? We'd love to hear from you. Please use the form below, and we'll get back to you as soon as possible.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-card p-6 rounded-lg border">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground font-semibold">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-background"
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
                            className="bg-background"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="inquiry-type" className="text-foreground font-semibold">Purpose of Inquiry</Label>
                     <Select onValueChange={setInquiryType} required value={inquiryType}>
                        <SelectTrigger id="inquiry-type" className="w-full bg-background">
                            <SelectValue placeholder="Select a reason..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Bug/Issue Report">Bug/Issue Report</SelectItem>
                            <SelectItem value="Feature Suggestion">Feature Suggestion</SelectItem>
                            <SelectItem value="Review & Feedback">Review & Feedback</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground font-semibold">Message</Label>
                    <Textarea
                        id="message"
                        placeholder="Please describe your inquiry here in detail..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={6}
                        className="bg-background"
                    />
                </div>
                
                 <div className="space-y-2">
                    <Label htmlFor="attachment" className="text-foreground font-semibold">Attachment (Optional)</Label>
                    <Label htmlFor="attachment" className="relative flex items-center gap-3 w-full border border-dashed rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                         <div className="flex-shrink-0 bg-muted p-2 rounded-md">
                             <Paperclip className="h-5 w-5 text-muted-foreground"/>
                         </div>
                         <div className="flex-grow">
                             <p className="text-sm font-medium text-foreground">{fileName || 'Click to upload a file'}</p>
                             <p className="text-xs text-muted-foreground">Max file size: 5MB</p>
                         </div>
                    </Label>
                    <Input
                        id="attachment"
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                     <p className="text-[11px] text-center text-muted-foreground pt-1">Note: The file will not be automatically attached. You must attach it manually in your email client after clicking the send button.</p>
                </div>

                <Button type="submit" className="w-full font-bold">
                    Send via Email Client
                </Button>
            </form>
        </PolicyPageLayout>
    );
}
