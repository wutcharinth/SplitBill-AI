
import React from 'react';
import PolicyPageLayout from '@/components/app/PolicyPageLayout';
import { Camera, Edit, Share2, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-card rounded-xl p-6 flex flex-col items-center text-center shadow-card border border-border">
        <div className="bg-primary/10 text-primary rounded-full p-3 mb-4">
            {icon}
        </div>
        <h3 className="font-bold text-lg mb-2 text-foreground font-headline">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
    </div>
);

export default function AboutPage() {
    return (
        <PolicyPageLayout title="How It Works" disableHeaderLink={true}>
            <div className="text-center">
                <p className="text-muted-foreground max-w-2xl mx-auto text-base">
                    SplitBill AI takes the headache out of splitting bills. Just snap a photo of any receipt, and our AI will handle the rest—from translating items to calculating who owes what.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 my-12">
                <FeatureCard 
                    icon={<Camera size={28} />}
                    title="1. Snap or Upload"
                    description="Take a picture of your receipt or upload one from your library. The AI instantly extracts every line item, price, tax, and discount."
                />
                 <FeatureCard 
                    icon={<Users size={28} />}
                    title="2. Assign Items"
                    description="Easily assign items to different people. Split a single item multiple ways with just a few taps. The app handles all the math."
                />
                 <FeatureCard 
                    icon={<Share2 size={28} />}
                    title="3. Share the Summary"
                    description="Generate a beautiful, clean summary showing who owes what. Share it as an image with your friends via any messaging app."
                />
            </div>
            
            <div className="text-center mt-12 bg-muted p-8 rounded-xl border border-border">
                <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">Ready to Get Started?</h2>
                <p className="text-muted-foreground mb-6">Stop the awkward post-dinner calculations. Try it now—it's free!</p>
                <Button asChild size="lg">
                    <Link href="/">Split a Bill Now</Link>
                </Button>
            </div>
        </PolicyPageLayout>
    );
}
