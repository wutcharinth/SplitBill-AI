
import React from 'react';
import PolicyPageLayout from '@/components/app/PolicyPageLayout';
import { Camera, Edit, Share2, Users, ArrowDown, Zap, Globe, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-card rounded-xl p-6 flex flex-col items-center text-center shadow-card border border-border h-full">
        <div className="bg-primary/10 text-primary rounded-full p-3 mb-4 inline-block">
            {icon}
        </div>
        <h3 className="font-bold text-lg mb-2 text-foreground font-headline">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
    </div>
);

const StepIcon = ({ icon }: { icon: React.ReactNode }) => (
    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full ring-4 ring-card shadow-lg">
        {icon}
    </div>
);

const StepLine = () => (
    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
);

const WhyCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-accent/10 text-accent p-3 rounded-lg">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-foreground font-headline">{title}</h4>
            <p className="text-sm text-muted-foreground">{text}</p>
        </div>
    </div>
)

const CheckMark = () => <CheckCircle className="text-green-500 mx-auto" size={20} />;
const XMark = () => <XCircle className="text-red-500 mx-auto" size={20} />;
const FeatureText = ({ children, className }: { children: React.ReactNode, className?: string }) => <span className={`text-xs text-center ${className}`}>{children}</span>;

const comparisonData = [
    { category: 'Core Splitting', features: [
        { name: 'Group Creation', splitbill: <CheckMark />, splitwise: <CheckMark />, splid: <CheckMark />, tricount: <CheckMark />, tab: <CheckMark /> },
        { name: 'Equal Split', splitbill: <CheckMark />, splitwise: <CheckMark />, splid: <CheckMark />, tricount: <CheckMark />, tab: <CheckMark /> },
        { name: 'Unequal Split (Amount, %, Share)', splitbill: <CheckMark />, splitwise: <CheckMark />, splid: <CheckMark />, tricount: <CheckMark />, tab: <CheckMark /> },
        { name: 'Multi-Currency Support', splitbill: <CheckMark />, splitwise: <CheckMark />, splid: <CheckMark />, tricount: <CheckMark />, tab: <XMark /> },
        { name: 'Offline Mode', splitbill: <CheckMark />, splitwise: <CheckMark />, splid: <CheckMark />, tricount: <CheckMark />, tab: <CheckMark /> },
    ]},
    { category: 'Advanced Features', features: [
        { name: 'Receipt Scanning (OCR)', splitbill: <FeatureText className="text-green-600 font-medium">Free</FeatureText>, splitwise: <FeatureText className="text-orange-500 font-medium">$ (Pro)</FeatureText>, splid: <XMark />, tricount: <XMark />, tab: <FeatureText className="text-green-600 font-medium">Free</FeatureText> },
        { name: 'Expense Itemization', splitbill: <FeatureText className="text-green-600 font-medium">Free</FeatureText>, splitwise: <FeatureText className="text-orange-500 font-medium">$ (Pro)</FeatureText>, splid: <XMark />, tricount: <XMark />, tab: <FeatureText className="text-green-600 font-medium">Free</Text> },
        { name: 'Recurring Bills', splitbill: <XMark />, splitwise: <CheckMark />, splid: <XMark />, tricount: <XMark />, tab: <XMark /> },
        { name: 'Expense Categorization', splitbill: <CheckMark />, splitwise: <CheckMark />, splid: <XMark />, tricount: <XMark />, tab: <XMark /> },
        { name: 'Charts & Analytics', splitbill: <XMark />, splitwise: <FeatureText className="text-orange-500 font-medium">$ (Pro)</FeatureText>, splid: <XMark />, tricount: <XMark />, tab: <XMark /> },
        { name: 'CSV / Excel Export', splitbill: <XMark />, splitwise: <CheckMark />, splid: <FeatureText className="text-orange-500 font-medium">$ (1-time)</FeatureText>, tricount: <CheckMark />, tab: <XMark /> },
    ]},
    { category: 'Localization & Integration', features: [
        { name: 'QR Code Generation (for Venmo, etc.)', splitbill: <CheckMark />, splitwise: <XMark />, splid: <XMark />, tricount: <XMark />, tab: <XMark /> },
        { name: 'E-Wallet Integration', splitbill: <FeatureText>Future</FeatureText>, splitwise: <FeatureText>US-centric</FeatureText>, splid: <XMark />, tricount: <XMark />, tab: <FeatureText>Venmo</FeatureText> },
        { name: 'Full English UI/UX', splitbill: <CheckMark />, splitwise: <CheckMark />, splid: <CheckMark />, tricount: <CheckMark />, tab: <CheckMark /> },
    ]},
    { category: 'Business Model', features: [
        { name: 'Daily Entry Limit', splitbill: <FeatureText className="font-medium">None</FeatureText>, splitwise: <FeatureText className="text-red-600 font-medium">3 (Free)</FeatureText>, splid: <FeatureText className="font-medium">None</FeatureText>, tricount: <FeatureText className="font-medium">None</FeatureText>, tab: <FeatureText className="font-medium">None</FeatureText> },
        { name: 'Intrusive Ads (Free Tier)', splitbill: <FeatureText className="font-medium">None</FeatureText>, splitwise: <FeatureText className="text-red-600 font-medium">Yes (10s)</FeatureText>, splid: <FeatureText className="font-medium">None</FeatureText>, tricount: <FeatureText className="font-medium">None</FeatureText>, tab: <FeatureText className="font-medium">None</FeatureText> },
        { name: 'Monetization Strategy', splitbill: <FeatureText className="text-green-600 font-medium">Free</FeatureText>, splitwise: <FeatureText>Freemium (Core Limits)</FeatureText>, splid: <FeatureText>Freemium (Feature Unlock)</FeatureText>, tricount: <FeatureText>Free</FeatureText>, tab: <FeatureText>Free</FeatureText> },
    ]}
];


export default function AboutPage() {
    return (
        <PolicyPageLayout title="The Smartest Way to Split Bills" disableHeaderLink={true}>
            <div className="text-center">
                <p className="text-muted-foreground max-w-3xl mx-auto text-base leading-relaxed">
                    Tired of the awkward shuffle with calculators and crumpled receipts after a great meal with friends? SplitBill AI transforms that headache into a seamless, quick, and even fun experience. Just snap a photo of any receipt, and let our powerful AI do the heavy lifting. It intelligently extracts every item, translates foreign languages on the fly, and gets everything ready for a fair and easy split. No more manual entry, no more guesswork—just pure convenience.
                </p>
            </div>

            <div className="my-16">
                <h2 className="text-2xl font-bold text-center font-headline mb-10 text-foreground">How It Works: A 3-Step Journey</h2>
                <div className="relative grid md:grid-cols-3 gap-x-8 gap-y-12 text-center">
                    <StepLine />
                    <div className="flex flex-col items-center">
                        <StepIcon icon={<Camera size={32} />} />
                        <h3 className="mt-4 text-xl font-bold font-headline">1. Snap or Upload</h3>
                        <p className="mt-2 text-muted-foreground text-sm">Point your camera at the receipt or upload an image. Our AI instantly scans and digitizes everything—items, prices, taxes, and discounts—with incredible accuracy.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <StepIcon icon={<Users size={32} />} />
                        <h3 className="mt-4 text-xl font-bold font-headline">2. Assign & Adjust</h3>
                        <p className="mt-2 text-muted-foreground text-sm">Tap to assign items to each person. Need to split a shared appetizer? No problem. The app handles the math, letting you split any item multiple ways with just a few taps.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <StepIcon icon={<Share2 size={32} />} />
                        <h3 className="mt-4 text-xl font-bold font-headline">3. Share the Summary</h3>
                        <p className="mt-2 text-muted-foreground text-sm">Generate a beautiful, crystal-clear summary showing exactly who owes what. Share it as an image with your friends via any messaging app to settle up instantly.</p>
                    </div>
                </div>
            </div>

            <div className="my-16 bg-muted p-8 rounded-xl border border-border">
                <h2 className="text-2xl font-bold text-center font-headline mb-8 text-foreground">Why You'll Love SplitBill AI</h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 max-w-4xl mx-auto">
                    <WhyCard 
                        icon={<Zap size={24} />}
                        title="Effortless & Instant"
                        text="Go from a paper receipt to a fully calculated split in seconds. This is the fastest way to handle shared expenses, period."
                    />
                    <WhyCard 
                        icon={<Globe size={24} />}
                        title="Travel-Ready"
                        text="Don't sweat foreign receipts. The app automatically detects the currency and translates item names into English, making it your perfect travel companion."
                    />
                    <WhyCard 
                        icon={<ShieldCheck size={24} />}
                        title="Accuracy You Can Trust"
                        text="Our AI is trained to handle complex receipts, including tricky taxes, service charges, and discounts, ensuring the final split is always fair and accurate."
                    />
                    <WhyCard 
                        icon={<Users size={24} />}
                        title="Keeps Things Friendly"
                        text="Avoid the awkward money conversations. Sending a clean, clear summary makes settling up transparent and stress-free for everyone involved."
                    />
                </div>
            </div>

            <div className="my-16">
                 <h2 className="text-2xl font-bold text-center font-headline mb-8 text-foreground">Advanced Features for Total Control</h2>
                 <div className="grid md:grid-cols-3 gap-6">
                    <FeatureCard 
                        icon={<Camera size={28} />}
                        title="Smart OCR & AI"
                        description="At the core of SplitBill AI is a powerful vision model that doesn't just read text; it understands the structure of a receipt. It identifies line items, distinguishes them from taxes or totals, and processes them into an editable format, saving you from tedious manual data entry."
                    />
                     <FeatureCard 
                        icon={<Edit size={28} />}
                        title="Full Editability"
                        description="The AI gives you a huge head start, but you always have the final say. Easily edit item names and prices, add items the AI may have missed, or remove ones you don't need. You have complete control to ensure the bill is perfect before you split."
                    />
                     <FeatureCard 
                        icon={<Share2 size={28} />}
                        title="Custom Adjustments"
                        description="Handling taxes, tips, and discounts is a breeze. The app automatically detects many of these, but you can also manually add or adjust them. Decide whether a discount applies to the whole bill or just specific people for ultimate flexibility."
                    />
                </div>
            </div>

            <div className="my-16">
                <h2 className="text-2xl font-bold text-center font-headline mb-10 text-foreground">How We Stand Out</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto text-center text-base leading-relaxed mb-12">
                    Many bill-splitting apps exist, but they often come with compromises—either they're bloated with features you don't need, lock essential tools behind a paywall, or bombard you with intrusive ads. We learned from their mistakes. SplitBill AI is designed to be the perfect balance: powerful, user-friendly, and completely free, with a focus on a smooth, friction-free experience.
                </p>
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[800px] border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-3 font-semibold text-foreground w-1/4">Feature / Monetization</th>
                                <th className="text-center p-3 font-semibold text-primary w-[15%]">SplitBill AI (Free)</th>
                                <th className="text-center p-3 font-semibold text-muted-foreground w-[15%]">Splitwise</th>
                                <th className="text-center p-3 font-semibold text-muted-foreground w-[15%]">Splid</th>
                                <th className="text-center p-3 font-semibold text-muted-foreground w-[15%]">Tricount</th>
                                <th className="text-center p-3 font-semibold text-muted-foreground w-[15%]">Tab</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData.map((group) => (
                                <React.Fragment key={group.category}>
                                    <tr>
                                        <td colSpan={6} className="p-3 bg-muted">
                                            <h4 className="font-bold text-foreground text-sm">{group.category}</h4>
                                        </td>
                                    </tr>
                                    {group.features.map(feature => (
                                        <tr key={feature.name} className="border-b border-border/80">
                                            <td className="p-3 text-muted-foreground">{feature.name}</td>
                                            <td className="p-3 text-center align-middle">{feature.splitbill}</td>
                                            <td className="p-3 text-center align-middle">{feature.splitwise}</td>
                                            <td className="p-3 text-center align-middle">{feature.splid}</td>
                                            <td className="p-3 text-center align-middle">{feature.tricount}</td>
                                            <td className="p-3 text-center align-middle">{feature.tab}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="text-center mt-16 bg-card p-8 rounded-xl border border-border shadow-lg">
                <h2 className="text-3xl font-bold font-headline mb-4 text-foreground">Ready to Ditch the Math?</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Stop the post-dinner calculations and bring fairness and simplicity to your next outing. Try SplitBill AI now—it's free, fast, and incredibly easy.</p>
                <Button asChild size="lg" className="font-bold">
                    <Link href="/">Split a Bill Now</Link>
                </Button>
            </div>
        </PolicyPageLayout>
    );
}
