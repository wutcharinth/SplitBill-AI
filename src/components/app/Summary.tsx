

'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Download, X, QrCode, Share2, CheckCircle2, Mail, Loader2, Languages, Save, Copy } from 'lucide-react';
import { CURRENCIES, PERSON_COLORS } from '../constants';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Payment } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { saveBillToFirestore } from '@/lib/firebase/firestore';
import { uploadImageAndGetUrl } from '@/lib/firebase/storage';


const fireConfetti = () => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1001';
    document.body.appendChild(canvas);

    try {
        const myConfetti = confetti.create(canvas, {
            resize: true,
            useWorker: true,
        });

        const count = 200;
        const defaults = {
            origin: { x: 0.5, y: 1 },
            disableForReducedMotion: true,
            zIndex: 1001,
        };
        
        const allColors = [...PERSON_COLORS, '#fcc419', '#ffffff'];

        function fire(particleRatio: number, opts: confetti.Options) {
            myConfetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
                colors: allColors,
            });
        }

        fire(0.25, { spread: 50, startVelocity: 55, decay: 0.9, gravity: 0.8 });
        fire(0.2, { spread: 80, startVelocity: 45, decay: 0.9, gravity: 0.8 });
        fire(0.35, { spread: 120, startVelocity: 35, decay: 0.91, scalar: 0.8, gravity: 0.8 });
        fire(0.1, { spread: 150, startVelocity: 25, decay: 0.92, scalar: 1.2, gravity: 0.8 });
        fire(0.1, { spread: 180, startVelocity: 15, decay: 0.93, gravity: 0.8 });

    } catch(e) {
        console.error('Confetti failed:', e);
    } finally {
        setTimeout(() => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        }, 5000);
    }
};

const generateImageDataUrl = (element: HTMLElement, toast: (options: any) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!element) {
            return reject(new Error('Element for image generation not found'));
        }
        
        element.classList.add('capturing');

        // Give browser 250ms to render images before capture
        setTimeout(async () => {
            try {
                const dataUrl = await toPng(element, {
                    quality: 0.95,
                    pixelRatio: 1.5,
                    style: {
                        fontFamily: "'Inter', sans-serif",
                    },
                    filter: (node: HTMLElement) => {
                        if (typeof node.getAttribute !== 'function') return true;
                        const isToggleButton = node.getAttribute('data-summary-toggle') === 'true';
                        const isActionContainer = node.getAttribute('data-summary-actions') === 'true';
                        return !isToggleButton && !isActionContainer;
                    },
                    cacheBust: true,
                });
                resolve(dataUrl);
            } catch (err) {
                console.error('Failed to generate summary image:', err);
                reject(err); // Reject the promise on error
            } finally {
                element.classList.remove('capturing');
            }
        }, 250);
    });
};


const DualCurrencyDisplay: React.FC<{
    baseValue: number, 
    sign?: string, 
    displayMode?: 'inline' | 'stacked',
    className?: string,
    currencySymbol: string,
    baseCurrencySymbol: string,
    fxRate: number,
    baseCurrency: string,
    displayCurrency: string,
    formatNumber: (num: number) => string;
}> = ({ baseValue, sign = '', displayMode = 'inline', className = 'text-foreground', currencySymbol, baseCurrencySymbol, fxRate, baseCurrency, displayCurrency, formatNumber }) => {
    const convertedValue = formatNumber(baseValue);
    const originalValue = formatNumber(baseValue / fxRate);

    if (baseCurrency === displayCurrency) {
        return <span className={`font-mono text-xs ${className}`}>{sign}{currencySymbol}{convertedValue}</span>;
    }
    
    if (displayMode === 'stacked') {
        return (
            <div className="text-right">
                <span className={`font-mono text-[11px] leading-none ${className}`}>{sign}{currencySymbol}{convertedValue}</span>
                <div className="text-muted-foreground text-[9px] leading-tight font-mono">({sign}{baseCurrencySymbol}{originalValue})</div>
            </div>
        );
    }

    return (
        <span className="font-mono text-xs">
            <span className={className}>{sign}{currencySymbol}{convertedValue}</span>
            <span className="text-muted-foreground text-[10px] ml-1">({sign}{baseCurrencySymbol}{originalValue})</span>
        </span>
    );
};

const FinalAmountDisplay: React.FC<{
    person: any,
    currencySymbol: string,
    baseCurrencySymbol: string,
    fxRate: number,
    baseCurrency: string,
    displayCurrency: string,
    formatNumber: (num: number) => string;
}> = ({ person, currencySymbol, baseCurrencySymbol, fxRate, baseCurrency, displayCurrency, formatNumber }) => {
    const isOwed = person.finalTotal < 0;
    const displayValue = Math.abs(person.finalTotal * fxRate);
    const originalValue = Math.abs(person.finalTotal);
    const textColor = isOwed ? 'text-green-600' : 'text-primary';
    const labelText = isOwed ? 'Gets' : 'Pays';

    return (
         <div className="flex-shrink-0 whitespace-nowrap">
            <div className={`text-right font-bold text-sm ${textColor}`}>
                 <div className="flex flex-col items-end">
                     <span>
                         {labelText}: {currencySymbol}{formatNumber(displayValue)}
                     </span>
                     {baseCurrency !== displayCurrency && (
                         <span className="text-[10px] text-muted-foreground font-normal">({baseCurrencySymbol}{formatNumber(originalValue)})</span>
                     )}
                 </div>
            </div>
        </div>
    );
}
const TotalShareDisplay: React.FC<{
    person: any,
    currencySymbol: string,
    baseCurrencySymbol: string,
    fxRate: number,
    baseCurrency: string,
    displayCurrency: string,
    formatNumber: (num: number) => string;
}> = ({ person, currencySymbol, baseCurrencySymbol, fxRate, baseCurrency, displayCurrency, formatNumber }) => {
    return (
        <div className="text-right">
            <span className="font-semibold text-xs text-muted-foreground">
                Total Share: {currencySymbol}{formatNumber(person.totalShare * fxRate)}
            </span>
             {baseCurrency !== displayCurrency && (
                <div className="text-[10px] text-muted-foreground/80 font-normal">
                    ({baseCurrencySymbol}{formatNumber(person.totalShare)})
                </div>
            )}
        </div>
    );
}

const SummaryToggles = ({ state, dispatch }: { state: any, dispatch: any }) => {
    const { items, splitMode, ui } = state;
    const { summaryViewMode, showTranslatedNames } = ui;

    const hasAnyTranslatedItems = items.some((item: any) => item.translatedName && item.translatedName.toLowerCase() !== item.name.toLowerCase());

    return (
        <div className="flex flex-wrap-reverse justify-end items-center gap-2 mb-3" data-summary-toggle="true">
            {splitMode === 'item' && (
                <div className="flex items-center justify-center space-x-1 bg-muted p-1 rounded-lg text-xs border">
                    <div onClick={() => dispatch({ type: 'SET_UI_STATE', payload: { summaryViewMode: 'detailed' } })} className={`cursor-pointer py-1 px-2 rounded-md ${summaryViewMode === 'detailed' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>Detailed</div>
                    <div onClick={() => dispatch({ type: 'SET_UI_STATE', payload: { summaryViewMode: 'compact' } })} className={`cursor-pointer py-1 px-2 rounded-md ${summaryViewMode === 'compact' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>Compact</div>
                </div>
            )}
            {hasAnyTranslatedItems && splitMode === 'item' && (
                <div onClick={() => dispatch({ type: 'SET_UI_STATE', payload: { showTranslatedNames: !showTranslatedNames } })} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md cursor-pointer">
                    <Languages size={14} />
                    <span>{showTranslatedNames ? 'Translated' : 'Original'}</span>
                </div>
            )}
        </div>
    );
};


const Summary: React.FC<{ state: any; dispatch: React.Dispatch<any>, currencySymbol: string, fxRate: number, formatNumber: (num: number) => string }> = ({ state, dispatch, currencySymbol, fxRate, formatNumber }) => {
    const summaryRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [shareableLink, setShareableLink] = useState<string | null>(null);
    
    const {
        items, people, discounts, fees, tip, tipSplitMode, billTotal, payments,
        splitMode, peopleCountEvenly, baseCurrency, displayCurrency,
        restaurantName, billDate, qrCodeImage, notes,
        includeReceiptInSummary, uploadedReceipt,
        ui: { summaryViewMode, showTranslatedNames }
    } = state;


    const handleDownload = async () => {
        if (!imageDataUrl) {
             toast({
                variant: 'destructive',
                title: "No Image Data",
                description: "Please save the summary first to generate the image.",
            });
            return;
        }

        setIsDownloading(true);
        const now = new Date();
        const datePart = now.toISOString().slice(0, 10);
        const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '-');
        const restaurantPart = restaurantName.replace(/[^a-zA-Z0-9]/g, ' ').trim().replace(/\s+/g, '-');
        const filename = `SplitBill-AI-${datePart}${restaurantPart ? `-${restaurantPart}` : ''}-${timePart}.png`;
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = imageDataUrl;
        link.click();

        setIsDownloading(false);

        toast({
            variant: 'success',
            title: "Summary Saved!",
            description: "Your summary image has been saved.",
        });
    }

    const handleSaveAndShare = async () => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: "Not Logged In",
                description: "You must be logged in to save your bill summary.",
            });
            return;
        }

        setIsSaving(true);
        
        try {
            const dataUrl = await generateImageDataUrl(summaryRef.current!, toast);
            setImageDataUrl(dataUrl);

            const url = await uploadImageAndGetUrl(dataUrl, user.uid);
            
            // Exclude fields that are not part of BillData
            const { qrCodeImage, notes, ui, uploadedReceipt, ...billToSave } = state;
            const billId = await saveBillToFirestore({ ...billToSave, imageUrl: url, userId: user.uid });
            
            setShareableLink(url);
            fireConfetti();
            toast({
                variant: 'success',
                title: "Saved Successfully!",
                description: "Your summary has been saved. You can now download it or copy the link.",
            });

        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred during save.';
            toast({
                variant: 'destructive',
                title: "Save Failed",
                description: message,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyLink = () => {
        if (!shareableLink) return;
        navigator.clipboard.writeText(shareableLink).then(() => {
            toast({
                variant: 'success',
                title: "Link Copied!",
                description: "The shareable link has been copied to your clipboard.",
            });
        }).catch(err => {
            console.error("Failed to copy link:", err);
            toast({
                variant: 'destructive',
                title: "Copy Failed",
                description: "Could not copy the link to your clipboard.",
            });
        })
    }
    
    const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            dispatch({ type: 'SET_QR_CODE_IMAGE', payload: reader.result as string });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const baseCurrencySymbol = CURRENCIES[baseCurrency] || baseCurrency;

    const calculations = useMemo(() => {
        let subtotal, itemDiscountsTotal;

        if (splitMode === 'evenly') {
            subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);
            itemDiscountsTotal = 0;
        } else {
            const assignedItems = items.filter((item: any) => {
                const totalShares = item.shares.reduce((a: number, b: number) => a + b, 0);
                return totalShares > 0;
            });
            subtotal = assignedItems.reduce((sum: number, item: any) => sum + item.price, 0);
            itemDiscountsTotal = 0;
        }

        const totalFeesAmount = fees.filter((f:any) => f.isEnabled).reduce((sum:number, f:any) => sum + f.amount, 0);
        const totalDiscountsAmount = discounts.reduce((sum:number, d:any) => sum + d.amount, 0);

        const subtotalAfterDiscount = subtotal - totalDiscountsAmount;

        const totalPayment = payments.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);

        const calculatedTotal = subtotalAfterDiscount + totalFeesAmount;
        const adjustment = billTotal > 0 ? billTotal - calculatedTotal : 0;
        const grandTotal = calculatedTotal + adjustment;
        const amountToSettle = grandTotal + tip - totalPayment;
        
        return { 
            subtotal, 
            totalFeesAmount,
            adjustment, 
            grandTotal, 
            amountToSettle,
            itemDiscountsTotal, 
            totalDiscountsAmount, 
            calculatedTotal, 
            totalPayment 
        };
    }, [items, discounts, fees, tip, billTotal, splitMode, payments]);
    
    const perPersonResults = useMemo(() => {
        const { totalDiscountsAmount, totalFeesAmount, adjustment, subtotal: assignedSubtotal } = calculations;

        let perPersonData: any[] = [];

        if (splitMode === 'item') {
            const personSubtotals = people.map(() => ({ subtotal: 0, items: [] as any[] }));
            items.forEach((item: any) => {
                const totalShares = item.shares.reduce((a:number, b:number) => a + b, 0);
                if(totalShares > 0) {
                    const pricePerShare = item.price / totalShares;
                    item.shares.forEach((shareCount: number, personIndex: number) => {
                        if (shareCount > 0) {
                            const personShareValue = pricePerShare * shareCount;
                            personSubtotals[personIndex].subtotal += personShareValue;
                            
                            const mainName = showTranslatedNames && item.translatedName ? item.translatedName : item.name;
                            const subName = showTranslatedNames && item.translatedName ? item.name : null;

                            personSubtotals[personIndex].items.push({ 
                                name: mainName, 
                                originalName: subName,
                                value: personShareValue, 
                                count: shareCount 
                            });
                        }
                    });
                }
            });

            const totalItemShares = personSubtotals.reduce((sum, p) => sum + p.subtotal, 0);

            perPersonData = people.map((person: any, index: number) => {
                const personSub = personSubtotals[index].subtotal;
                const proportionOfBill = totalItemShares > 0 ? personSub / totalItemShares : (1 / people.length);

                let personTotalDiscount = 0;
                discounts.forEach((discount: any) => {
                    const totalShares = discount.shares.reduce((a: number, b: number) => a + b, 0);
                    if (totalShares > 0) {
                        const pricePerShare = discount.amount / totalShares;
                        personTotalDiscount += pricePerShare * discount.shares[index];
                    } else {
                        // If no one is assigned, split it based on their bill proportion
                        personTotalDiscount += discount.amount * proportionOfBill;
                    }
                });

                const personFees = proportionOfBill * totalFeesAmount;
                const personAdjustment = proportionOfBill * adjustment;
                const personTip = tipSplitMode === 'equally' ? tip / people.length : proportionOfBill * tip;
                
                const personPayment = payments.reduce((sum: number, payment: Payment) => {
                    return payment.paidBy === person.id ? sum + payment.amount : sum;
                }, 0);

                const totalShare = personSub - personTotalDiscount + personFees + personAdjustment + personTip;
                const finalTotal = totalShare - personPayment;

                return {
                    ...person,
                    totalShare,
                    finalTotal,
                    items: personSubtotals[index].items,
                    breakdown: {
                        subtotal: personSub,
                        discount: personTotalDiscount,
                        fees: personFees,
                        adjustment: personAdjustment,
                        tip: personTip,
                        payment: personPayment,
                    }
                };
            });
        } else { // Evenly
            const grandTotalWithTip = calculations.grandTotal + tip;
            const totalSharePerPerson = grandTotalWithTip / peopleCountEvenly;

            for(let i=0; i < peopleCountEvenly; i++) {
                const person = people[i] || { id: `even-${i}`, name: `P${i+1}`, color: PERSON_COLORS[i % PERSON_COLORS.length] };
                const personPayment = payments.reduce((sum: number, payment: Payment) => {
                    return payment.paidBy === person.id ? sum + payment.amount : sum;
                }, 0);
                const finalTotalPerPerson = totalSharePerPerson - personPayment;

                perPersonData.push({ 
                    ...person,
                    totalShare: totalSharePerPerson,
                    finalTotal: finalTotalPerPerson,
                });
            }
        }
        return perPersonData;
    }, [calculations, items, people, discounts, fees, tip, tipSplitMode, splitMode, peopleCountEvenly, payments, showTranslatedNames]);
    
    const totalFromIndividuals = useMemo(() => perPersonResults.reduce((sum, p) => sum + p.finalTotal, 0), [perPersonResults]);

    const hasQrCode = !!qrCodeImage;
    const hasNotes = notes && notes.trim().length > 0;
    
    const commonCurrencyProps = {
        currencySymbol,
        baseCurrencySymbol,
        fxRate,
        baseCurrency,
        displayCurrency,
        formatNumber
    };
    
    return (
        <div className="border-t pt-4 border-border">
            <div id="summary-container" className="relative">
                <div ref={summaryRef} className="bg-background p-4 rounded-lg font-sans">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <input type="text" value={restaurantName} onChange={e => dispatch({type: 'UPDATE_RESTAURANT_NAME', payload: e.target.value})} className="name-input text-base font-bold p-1 -ml-1 rounded-lg bg-transparent w-full text-foreground font-headline" placeholder="Restaurant Name" />
                            <div className="flex items-center">
                                <label htmlFor="summary-bill-date" className="text-xs text-muted-foreground font-medium whitespace-nowrap">Date:</label>
                                <input 
                                    id="summary-bill-date"
                                    type="date"
                                    value={billDate}
                                    onChange={e => dispatch({type: 'UPDATE_BILL_DATE', payload: e.target.value})}
                                    className="p-1 rounded-lg bg-transparent border-none text-xs text-muted-foreground summary-date-input"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center ml-2 flex-shrink-0">
                            <img src="https://i.postimg.cc/hgX62bcn/Chat-GPT-Image-Aug-8-2025-04-14-15-PM.png" alt="SplitBill AI Logo" className="h-10" crossOrigin='anonymous' />
                            <p className="text-xs text-muted-foreground mt-1 font-semibold">Snap.Split.Share!</p>
                        </div>
                    </div>
                    
                    {baseCurrency !== displayCurrency && (
                        <div className="text-center text-xs text-muted-foreground mb-3 pb-3 border-b border-dashed border-border">
                            FX Rate: 1 {baseCurrency} = {fxRate.toFixed(4)} {displayCurrency}
                             {state.fxRateDate && (
                                <>
                                    <br />
                                    <span className="text-[10px]">(Source: Currency API, as of {state.fxRateDate})</span>
                                </>
                            )}
                        </div>
                    )}

                    <div className="mb-3">
                        <h3 className="text-sm font-bold text-foreground font-headline mt-2">Split Summary</h3>
                    </div>
                    
                    <div className="space-y-3">
                        {perPersonResults.map((person, index) => {
                            const breakdown = person.breakdown;
                            const hasAdjustments = breakdown && (
                                breakdown.discount > 0 ||
                                breakdown.fees > 0 ||
                                breakdown.adjustment !== 0 ||
                                breakdown.tip > 0 ||
                                breakdown.payment > 0
                            );

                            return (
                                <div key={person.id} className="bg-card rounded-lg shadow-sm overflow-hidden" style={{ borderTop: `4px solid ${person.color || '#ccc'}` }}>
                                    <div className="p-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <input type="text" value={person.name} onChange={e => dispatch({type: 'UPDATE_PERSON_NAME', payload: { index, name: e.target.value}})} className="name-input text-foreground font-bold text-sm w-full" disabled={splitMode === 'evenly'}/>
                                            <FinalAmountDisplay person={person} {...commonCurrencyProps} />
                                        </div>
                                        {splitMode === 'item' && summaryViewMode === 'compact' && person.items.length > 0 && (
                                            <ul className="list-disc list-inside mt-1 text-xs text-muted-foreground">
                                                {person.items.map((item: any, i: number) => <li key={i}>{item.name} {item.count > 1 ? `(x${item.count})` : ''}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                    {splitMode === 'item' && summaryViewMode === 'detailed' && breakdown && (
                                        <div className="text-xs border-t border-border space-y-1 text-foreground bg-muted/50 p-3">
                                            {person.items.map((item:any, i:number) => {
                                                return (
                                                    <div key={i} className="flex justify-between" title={item.name}>
                                                        <span className="truncate pr-2">
                                                            {item.name} {item.count > 1 ? `(x${item.count})` : ''}
                                                            {item.originalName && <span className="text-accent ml-1">({item.originalName})</span>}
                                                        </span>
                                                        <span><DualCurrencyDisplay baseValue={item.value * fxRate} {...commonCurrencyProps} /></span>
                                                    </div>
                                                )
                                            })}
                                            {hasAdjustments && (
                                                <div className="space-y-1 pt-1 mt-1 border-t border-border">
                                                    {breakdown.discount > 0 && <div className="flex justify-between"><span>Discount:</span><span><DualCurrencyDisplay baseValue={breakdown.discount * fxRate} sign="-" className="text-red-600" {...commonCurrencyProps}/></span></div>}
                                                    {breakdown.fees > 0 && <div className="flex justify-between"><span>Fees & Charges:</span><span><DualCurrencyDisplay baseValue={breakdown.fees * fxRate} sign="+" {...commonCurrencyProps}/></span></div>}
                                                    {breakdown.adjustment !== 0 && <div className="flex justify-between"><span>Adjustment:</span><span><DualCurrencyDisplay baseValue={breakdown.adjustment * fxRate} sign={breakdown.adjustment > 0 ? '+':''} {...commonCurrencyProps}/></span></div>}
                                                    
                                                    {breakdown.tip > 0 && (
                                                        <>
                                                            <div className="flex justify-between font-semibold border-t mt-1 pt-1">
                                                                <span>Bill Share:</span>
                                                                <DualCurrencyDisplay baseValue={(person.totalShare - breakdown.tip) * fxRate} className="font-semibold" {...commonCurrencyProps}/>
                                                            </div>
                                                            <div className="flex justify-between text-blue-600">
                                                                <span>Tip:</span>
                                                                <span><DualCurrencyDisplay baseValue={breakdown.tip * fxRate} sign="+" className="text-blue-600" {...commonCurrencyProps}/></span>
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="flex justify-between font-bold border-t mt-1 pt-1">
                                                        <span>Total Share:</span>
                                                        <DualCurrencyDisplay baseValue={person.totalShare * fxRate} className="font-bold" {...commonCurrencyProps}/>
                                                    </div>
                                                    {breakdown.payment > 0 && <div className="flex justify-between text-red-600"><span>Payment:</span><span><DualCurrencyDisplay baseValue={breakdown.payment * fxRate} sign="-" className="text-red-600" {...commonCurrencyProps}/></span></div>}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-4 bg-card rounded-lg shadow-sm p-3">
                        <h3 className="text-sm font-bold text-foreground mb-2 font-headline">Reconciliation</h3>
                        <div className="space-y-1 text-xs bg-muted p-3 rounded-lg text-foreground border border-border">
                             {splitMode === 'item' ? (
                                <div className="flex justify-between items-center">
                                    <span>Assigned Items Subtotal:</span>
                                    <DualCurrencyDisplay baseValue={calculations.subtotal * fxRate} displayMode="stacked" {...commonCurrencyProps} />
                                </div>
                             ) : (
                                <div className="flex justify-between items-center">
                                    <span>Receipt Subtotal:</span>
                                    <DualCurrencyDisplay baseValue={calculations.subtotal * fxRate} displayMode="stacked" {...commonCurrencyProps} />
                                </div>
                             )}
                            {calculations.totalDiscountsAmount > 0 && (
                                <div className="flex justify-between items-center text-red-600">
                                    <span>Total Discounts:</span>
                                    <DualCurrencyDisplay baseValue={calculations.totalDiscountsAmount * fxRate} sign="-" displayMode="stacked" className="text-red-600" {...commonCurrencyProps} />
                                </div>
                            )}
                            {calculations.totalFeesAmount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span>Total Fees & Charges:</span>
                                    <DualCurrencyDisplay baseValue={calculations.totalFeesAmount * fxRate} sign="+" displayMode="stacked" {...commonCurrencyProps} />
                                </div>
                            )}
                            <div className="flex justify-between items-center font-bold border-t mt-1 pt-1 border-border">
                                <span>Calculated Total:</span>
                                <DualCurrencyDisplay baseValue={calculations.calculatedTotal * fxRate} displayMode="stacked" className="font-bold text-foreground" {...commonCurrencyProps}/>
                            </div>
                            {Math.abs(calculations.adjustment) > 0.01 && (
                                <div className="flex justify-between items-center text-blue-600">
                                    <span>Adjustment (to match receipt):</span>
                                    <DualCurrencyDisplay 
                                        baseValue={calculations.adjustment * fxRate} 
                                        sign={calculations.adjustment > 0 ? '+' : ''} 
                                        displayMode="stacked" 
                                        className="text-blue-600"
                                        {...commonCurrencyProps}
                                    />
                                </div>
                            )}
                            <div className="flex justify-between items-center font-bold border-t mt-1 pt-1 border-border">
                                <span>Bill Grand Total:</span>
                                <DualCurrencyDisplay baseValue={calculations.grandTotal * fxRate} displayMode="stacked" className="font-bold text-foreground" {...commonCurrencyProps}/>
                            </div>
                             {tip > 0 && (
                                <div className="flex justify-between items-center text-blue-600 font-medium">
                                    <span>Total Tip:</span>
                                    <DualCurrencyDisplay baseValue={tip * fxRate} sign="+" displayMode="stacked" className="text-blue-600 font-medium" {...commonCurrencyProps} />
                                </div>
                            )}
                            {calculations.totalPayment > 0 && (
                                <div className="flex justify-between items-center text-red-600 font-medium">
                                    <span>Total Payments:</span>
                                    <DualCurrencyDisplay baseValue={calculations.totalPayment * fxRate} sign="-" displayMode="stacked" className="text-red-600 font-medium" {...commonCurrencyProps} />
                                </div>
                            )}
                        </div>

                        <div className="mt-2 text-green-600 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="flex justify-between items-center font-bold text-xs">
                                 <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Total of Individual Balances:</span>
                                 <div className="text-right">
                                     <span>{currencySymbol}{formatNumber(totalFromIndividuals * fxRate)}</span>
                                     {baseCurrency !== displayCurrency && (
                                        <div className="text-xs font-normal text-green-700/80">
                                            ({baseCurrencySymbol}{formatNumber(totalFromIndividuals)})
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-2 pt-3 border-t-2 border-border flex justify-between font-bold text-base text-foreground">
                            <span>Amount to Settle:</span>
                            <div className="text-right">
                                <span>{currencySymbol}{formatNumber(calculations.amountToSettle * fxRate)}</span>
                                {baseCurrency !== displayCurrency && (
                                    <div className="text-xs font-normal text-muted-foreground">
                                        ({baseCurrencySymbol}{formatNumber(calculations.amountToSettle)})
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-dashed border-border/80">
                         <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted -m-2" data-summary-toggle="true">
                            <input
                            type="checkbox"
                            checked={includeReceiptInSummary}
                            onChange={() => dispatch({ type: 'TOGGLE_INCLUDE_RECEIPT' })}
                            className="h-4 w-4 rounded text-primary focus:ring-primary border-border disabled:opacity-50"
                            disabled={!uploadedReceipt}
                            />
                            <span className={`text-xs ${!uploadedReceipt ? 'text-muted-foreground' : 'text-foreground'}`}>
                                Attach receipt image to summary
                            </span>
                        </label>
                        {includeReceiptInSummary && uploadedReceipt && (
                            <div className="mt-2">
                                <h4 className="text-xs font-semibold text-muted-foreground text-center mb-2">Attached Receipt</h4>
                                <img src={`data:image/png;base64,${uploadedReceipt}`} alt="Receipt" className="w-full rounded-lg shadow-sm" data-summary-image="true" crossOrigin="anonymous" />
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-dashed border-border/80">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                            {hasQrCode && (
                                <div className="space-y-2 text-center w-full">
                                    <h4 className="text-xs font-semibold text-muted-foreground">Payment QR Code</h4>
                                    <div className="relative w-fit mx-auto">
                                        <img src={qrCodeImage} alt="Payment QR Code" className="rounded-lg object-contain w-full max-w-[256px] h-auto" data-summary-image="true" crossOrigin="anonymous" />
                                    </div>
                                </div>
                            )}
                            {hasNotes && (
                                <div className="space-y-2 w-full">
                                    <h4 className="text-xs font-semibold text-muted-foreground text-center">Notes</h4>
                                    <p className="w-full p-2 text-xs whitespace-pre-wrap bg-card rounded-md border border-border min-h-[64px] text-foreground">{notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center text-xs text-muted-foreground mt-4 pt-4 border-t border-dashed">
                        <p>Generated by SplitBill AI</p>
                        <p className="font-semibold text-primary">splitbill-ai.com</p>
                        <p className="mt-2 text-[10px]">&copy; {new Date().getFullYear()} SplitBill AI. All rights reserved.</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-border/80 space-y-3" data-summary-actions="true">
                <div className="flex items-center gap-3">
                    {qrCodeImage ? (
                        <div className="relative w-fit flex-shrink-0">
                            <img src={qrCodeImage} alt="Payment QR Code" className="rounded-lg h-10 w-10 object-cover border border-border" />
                            <button onClick={() => dispatch({type: 'SET_QR_CODE_IMAGE', payload: null})} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md border-2 border-card">
                                <X size={10} strokeWidth={3} />
                            </button>
                        </div>
                    ) : (
                        <label htmlFor="qr-upload" className="flex-shrink-0 flex items-center justify-center h-10 w-10 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition">
                            <QrCode className="w-5 h-5 text-muted-foreground" />
                            <input id="qr-upload" type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
                        </label>
                    )}
                    
                    <input
                        type="text"
                        value={notes}
                        onChange={e => dispatch({type: 'SET_NOTES', payload: e.target.value})}
                        placeholder="Add QR payment info or other notes..."
                        className="w-full p-2 h-10 border rounded-md text-xs bg-card text-foreground border-border focus:ring-ring focus:border-ring transition"
                    />
                </div>
                 <p className="text-center text-xs text-muted-foreground">Add notes or a payment QR code. Then, save the summary to get a shareable link.</p>
            </div>
            
             <div className="mt-4 grid grid-cols-1 gap-3" data-summary-actions="true">
                {!shareableLink ? (
                    <Button onClick={handleSaveAndShare} className="w-full font-bold" disabled={isSaving || !user}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                <span>Save & Get Share Link</span>
                            </>
                        )}
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <div className="relative">
                            <Input type="text" readOnly value={shareableLink} className="pr-10 text-xs bg-muted"/>
                            <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleCopyLink} title="Copy link">
                                <Copy size={16} />
                            </Button>
                        </div>
                        <Button onClick={handleDownload} className="w-full font-bold" variant="outline" disabled={isDownloading}>
                            {isDownloading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Generating PNG...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    <span>Download as PNG</span>
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

Summary.Toggles = SummaryToggles;


export default Summary;

    

