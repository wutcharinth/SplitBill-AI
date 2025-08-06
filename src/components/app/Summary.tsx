'use client';

import React, { useMemo, useState, useRef } from 'react';
import { Download, X, QrCode } from 'lucide-react';
import { CURRENCIES, PERSON_COLORS } from '../constants';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

const fireConfetti = () => {
    // Create a canvas that will be used for the confetti animation.
    // This approach is more robust than relying on the default canvas creation.
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none'; // Make sure it doesn't block user interaction
    canvas.style.zIndex = '1001'; // Ensure it's on top of other elements
    document.body.appendChild(canvas);

    try {
        // Create a confetti instance attached to our canvas.
        const myConfetti = confetti.create(canvas, {
            resize: true, // Automatically resize the canvas when the window resizes
            useWorker: true, // Use a web worker for better performance
        });

        const count = 200;
        const defaults = {
            origin: { x: 0.5, y: 1 }, // Start from bottom-center
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

        // A more elegant, upward fountain effect
        fire(0.25, { spread: 50, startVelocity: 55, decay: 0.9, gravity: 0.8 });
        fire(0.2, { spread: 80, startVelocity: 45, decay: 0.9, gravity: 0.8 });
        fire(0.35, { spread: 120, startVelocity: 35, decay: 0.91, scalar: 0.8, gravity: 0.8 });
        fire(0.1, { spread: 150, startVelocity: 25, decay: 0.92, scalar: 1.2, gravity: 0.8 });
        fire(0.1, { spread: 180, startVelocity: 15, decay: 0.93, gravity: 0.8 });

    } catch(e) {
        console.error('Confetti failed:', e);
    } finally {
        // Clean up the canvas after the animation has had time to finish
        setTimeout(() => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        }, 5000); // 5 seconds should be plenty for the animation to fade
    }
};


const Summary: React.FC<{ state: any; dispatch: React.Dispatch<any>, currencySymbol: string, fxRate: number, formatNumber: (num: number) => string }> = ({ state, dispatch, currencySymbol, fxRate, formatNumber }) => {
    const [summaryViewMode, setSummaryViewMode] = useState<'detailed' | 'compact'>('detailed');
    const summaryRef = useRef<HTMLDivElement>(null);

    const {
        items, people, discount, taxes, tip, billTotal,
        splitMode, peopleCountEvenly, baseCurrency, displayCurrency,
        restaurantName, billDate, qrCodeImage, notes,
        includeReceiptInSummary, uploadedReceipt
    } = state;

    const baseCurrencySymbol = CURRENCIES[baseCurrency] || baseCurrency;

    const calculations = useMemo(() => {
        let subtotal, itemDiscountsTotal;

        if (splitMode === 'evenly') {
            // For 'evenly' mode, calculations are based on the full list of items.
            subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);
            itemDiscountsTotal = 0; // Item-specific discounts are not applicable.
        } else { // 'item' mode
            // Filter for items that have been assigned to at least one person.
            const assignedItems = items.filter((item: any) => {
                const totalShares = item.shares.reduce((a: number, b: number) => a + b, 0);
                return totalShares > 0;
            });
            // Calculate subtotal and discounts based only on assigned items.
            subtotal = assignedItems.reduce((sum: number, item: any) => sum + item.price, 0);
            itemDiscountsTotal = assignedItems.reduce((sum: number, item: any) => item.isFree ? sum + item.price : sum, 0);
        }

        const baseForCharges = subtotal - itemDiscountsTotal;
        const globalDiscountAmount = discount.type === 'percentage' ? baseForCharges * (discount.value / 100) : discount.value;
        const subtotalAfterDiscount = baseForCharges - globalDiscountAmount;

        const serviceChargeAmount = taxes.serviceCharge.isEnabled ? taxes.serviceCharge.amount : 0;
        const vatAmount = taxes.vat.isEnabled ? taxes.vat.amount : 0;
        const otherTaxAmount = taxes.otherTax.isEnabled ? taxes.otherTax.amount : 0;

        const calculatedTotal = subtotalAfterDiscount + serviceChargeAmount + vatAmount + otherTaxAmount;
        const adjustment = billTotal > 0 ? billTotal - calculatedTotal : 0;
        const grandTotal = calculatedTotal + adjustment;
        const grandTotalWithTip = grandTotal + tip;
        
        return { subtotal, serviceChargeAmount, vatAmount, otherTaxAmount, adjustment, grandTotal, grandTotalWithTip, itemDiscountsTotal, globalDiscountAmount, calculatedTotal };
    }, [items, discount, taxes, tip, billTotal, splitMode]);


    const handleSaveSummary = async () => {
        if (!summaryRef.current) return;
        
        const summaryElement = summaryRef.current;
        const parent = summaryElement.parentElement;
        if (!parent) return;

        // Temporarily move the element to the top of the body to ensure it's fully in the viewport
        const originalParent = parent;
        const originalStyles = {
            position: summaryElement.style.position,
            top: summaryElement.style.top,
            left: summaryElement.style.left,
            zIndex: summaryElement.style.zIndex,
        };

        document.body.appendChild(summaryElement);
        summaryElement.style.position = 'absolute';
        summaryElement.style.top = `${window.scrollY}px`;
        summaryElement.style.left = '0px';
        summaryElement.style.zIndex = '-1'; // Hide it from view while capturing

        summaryElement.classList.add('capturing');

        try {
            const dataUrl = await toPng(summaryElement, {
                quality: 1,
                pixelRatio: 2.5, // High resolution
                backgroundColor: '#f1f5f9', // slate-100
            });
            const link = document.createElement('a');
            link.download = `splitbill-summary-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
            fireConfetti();
        } catch (err) {
            console.error('Oops, something went wrong!', err);
        } finally {
            // Restore original position and styles
            summaryElement.classList.remove('capturing');
            originalParent.appendChild(summaryElement);
            summaryElement.style.position = originalStyles.position;
            summaryElement.style.top = originalStyles.top;
            summaryElement.style.left = originalStyles.left;
            summaryElement.style.zIndex = originalStyles.zIndex;
        }
    };
    
    const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            dispatch({ type: 'SET_QR_CODE_IMAGE', payload: reader.result as string });
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset file input
    };
    
    const hasQrCode = !!qrCodeImage;
    const hasNotes = notes && notes.trim().length > 0;

    const DualCurrencyDisplay: React.FC<{
        baseValue: number, 
        sign?: string, 
        displayMode?: 'inline' | 'stacked',
        className?: string,
    }> = ({ baseValue, sign = '', displayMode = 'inline', className = 'text-gray-800' }) => {
        const convertedValue = formatNumber(baseValue * fxRate);
        const originalValue = formatNumber(baseValue);
    
        if (baseCurrency === displayCurrency) {
            return <span className={`font-mono text-sm ${className}`}>{sign}{currencySymbol}{convertedValue}</span>;
        }
        
        if (displayMode === 'stacked') {
            return (
                <div className="text-right">
                    <span className={`font-mono text-sm ${className}`}>{sign}{currencySymbol}{convertedValue}</span>
                    <div className="text-gray-400 text-[10px] leading-tight font-mono">({sign}{baseCurrencySymbol}{originalValue})</div>
                </div>
            );
        }
    
        // inline mode
        return (
            <span className="font-mono text-sm">
                <span className={className}>{sign}{currencySymbol}{convertedValue}</span>
                <span className="text-gray-400 text-[10px] ml-1">({sign}{baseCurrencySymbol}{originalValue})</span>
            </span>
        );
    };

    const renderPerPersonResults = () => {
        const { globalDiscountAmount, serviceChargeAmount, vatAmount, otherTaxAmount, adjustment } = calculations;

        const totalPayableSubtotal = calculations.subtotal - calculations.itemDiscountsTotal;
        let perPersonData: any[] = [];

        if (splitMode === 'item') {
            const personSubtotals = people.map(() => ({ subtotal: 0, items: [] as any[] }));
            items.forEach((item: any) => {
                if(item.isFree) return;
                const totalShares = item.shares.reduce((a:number, b:number) => a + b, 0);
                if(totalShares > 0) {
                    const pricePerShare = item.price / totalShares;
                    item.shares.forEach((shareCount: number, personIndex: number) => {
                        if (shareCount > 0) {
                            const personShareValue = pricePerShare * shareCount;
                            personSubtotals[personIndex].subtotal += personShareValue;
                            personSubtotals[personIndex].items.push({ name: item.name, translatedName: item.translatedName, value: personShareValue, count: shareCount });
                        }
                    });
                }
            });
            
            const discountSharerIds = discount.shares.length > 0 ? discount.shares : people.map((p: any) => p.id);
            const subtotalOfDiscountSharers = people.reduce((acc: number, person: any, index: number) => {
                if (discountSharerIds.includes(person.id)) {
                    return acc + personSubtotals[index].subtotal;
                }
                return acc;
            }, 0);

            perPersonData = people.map((person: any, index: number) => {
                const personSub = personSubtotals[index].subtotal;
                const proportionOfBill = totalPayableSubtotal > 0 ? personSub / totalPayableSubtotal : (1 / people.length);
                
                let personGlobalDiscount = 0;
                if (discountSharerIds.includes(person.id) && subtotalOfDiscountSharers > 0) {
                    const proportionOfDiscountPool = personSub / subtotalOfDiscountSharers;
                    personGlobalDiscount = globalDiscountAmount * proportionOfDiscountPool;
                }

                const personServiceCharge = proportionOfBill * serviceChargeAmount;
                const personVat = proportionOfBill * vatAmount;
                const personOtherTax = proportionOfBill * otherTaxAmount;
                const personAdjustment = proportionOfBill * adjustment;

                const totalWithoutTip = personSub - personGlobalDiscount + personServiceCharge + personVat + personOtherTax + personAdjustment;
                const personTip = proportionOfBill * tip;
                const total = totalWithoutTip + personTip;

                return {
                    ...person,
                    total,
                    items: personSubtotals[index].items,
                    breakdown: {
                        subtotal: personSub,
                        discount: personGlobalDiscount,
                        serviceCharge: personServiceCharge,
                        vat: personVat,
                        otherTax: personOtherTax,
                        adjustment: personAdjustment,
                        tip: personTip
                    }
                };
            });
        } else { // Evenly
            const perPersonTotal = calculations.grandTotalWithTip / peopleCountEvenly;
            for(let i=0; i < peopleCountEvenly; i++) {
                perPersonData.push({ 
                    id: `even-${i}`, 
                    name: `P${i+1}`, 
                    total: perPersonTotal, 
                    color: PERSON_COLORS[i % PERSON_COLORS.length]
                });
            }
        }

        return (
            <div className="space-y-3">
                {perPersonData.map((person, index) => {
                    const breakdown = person.breakdown;
                    const hasAdjustments = breakdown && (
                        breakdown.discount > 0 ||
                        breakdown.serviceCharge > 0 ||
                        breakdown.vat > 0 ||
                        breakdown.otherTax > 0 ||
                        breakdown.adjustment !== 0 ||
                        breakdown.tip > 0
                    );

                    return (
                        <div key={person.id} className="bg-white rounded-lg shadow overflow-hidden" style={{ borderTop: `4px solid ${person.color || '#ccc'}` }}>
                            <div className="p-3">
                                <div className="flex justify-between items-center text-base">
                                    <input type="text" value={person.name} onChange={e => dispatch({type: 'UPDATE_PERSON_NAME', payload: { index, name: e.target.value}})} className="name-input text-gray-800 font-bold" disabled={splitMode === 'evenly'}/>
                                    <div className="text-right">
                                        <span className="font-bold text-agoda-blue">{currencySymbol}{formatNumber(person.total * fxRate)}</span>
                                        {baseCurrency !== displayCurrency && (
                                            <div className="text-xs text-gray-500 font-normal">
                                                ({baseCurrencySymbol}{formatNumber(person.total)})
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {splitMode === 'item' && summaryViewMode === 'compact' && person.items.length > 0 && (
                                     <ul className="list-disc list-inside mt-2 text-xs text-gray-600">
                                        {person.items.map((item: any, i: number) => <li key={i}>{item.name} {item.count > 1 ? `(x${item.count})` : ''}</li>)}
                                    </ul>
                                 )}
                            </div>
                            {splitMode === 'item' && summaryViewMode === 'detailed' && breakdown && (
                                <div className="text-xs mt-2 pt-2 border-t border-gray-200 space-y-1 text-gray-700 bg-slate-50 p-3">
                                    {person.items.map((item:any, i:number) => {
                                        const displayName = item.translatedName && item.translatedName.toLowerCase() !== item.name.toLowerCase() 
                                            ? `${item.translatedName} (${item.name})` 
                                            : item.name;
                                        return (
                                            <div key={i} className="flex justify-between" title={displayName}>
                                                <span className="truncate pr-2">{displayName} {item.count > 1 ? `(x${item.count})` : ''}</span>
                                                <span><DualCurrencyDisplay baseValue={item.value} /></span>
                                            </div>
                                        )
                                    })}
                                    {hasAdjustments && (
                                        <div className="space-y-1 pt-1 mt-1 border-t border-gray-300">
                                            {breakdown.discount > 0 && <div className="flex justify-between"><span>Discount:</span><span><DualCurrencyDisplay baseValue={breakdown.discount} sign="-" className="text-red-600"/></span></div>}
                                            {breakdown.serviceCharge > 0 && <div className="flex justify-between"><span>{taxes.serviceCharge.name}:</span><span><DualCurrencyDisplay baseValue={breakdown.serviceCharge} sign="+"/></span></div>}
                                            {breakdown.vat > 0 && <div className="flex justify-between"><span>{taxes.vat.name}:</span><span><DualCurrencyDisplay baseValue={breakdown.vat} sign="+"/></span></div>}
                                            {breakdown.otherTax > 0 && <div className="flex justify-between"><span>{taxes.otherTax.name}:</span><span><DualCurrencyDisplay baseValue={breakdown.otherTax} sign="+"/></span></div>}
                                            {breakdown.adjustment !== 0 && <div className="flex justify-between"><span>Adjustment:</span><span><DualCurrencyDisplay baseValue={breakdown.adjustment} sign={breakdown.adjustment > 0 ? '+':''}/></span></div>}
                                            {breakdown.tip > 0 && <div className="flex justify-between text-blue-600"><span>Tip:</span><span><DualCurrencyDisplay baseValue={breakdown.tip} sign="+" className="text-blue-600"/></span></div>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="border-t pt-4 border-gray-200">
            <div id="summary-container" className="relative">
                <div ref={summaryRef} className="bg-slate-100 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <input type="text" value={restaurantName} onChange={e => dispatch({type: 'UPDATE_RESTAURANT_NAME', payload: e.target.value})} className="text-lg font-bold p-1 -ml-1 rounded-lg bg-transparent w-full text-gray-900" placeholder="Restaurant Name" />
                            <div className="flex items-center">
                                <label htmlFor="summary-bill-date" className="text-xs text-gray-600 font-medium whitespace-nowrap">Date:</label>
                                <input 
                                    id="summary-bill-date"
                                    type="date"
                                    value={billDate}
                                    onChange={e => dispatch({type: 'UPDATE_BILL_DATE', payload: e.target.value})}
                                    className="p-1 rounded-lg bg-transparent border-none text-xs text-gray-600 summary-date-input"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center ml-2 flex-shrink-0">
                            <img src="https://i.postimg.cc/FmGScVWG/image.png" alt="Logo" className="h-10" />
                            <p className="text-[10px] text-gray-500 mt-1">Snap. Split. Done.</p>
                        </div>
                    </div>
                    
                    {baseCurrency !== displayCurrency && (
                        <div className="text-center text-xs text-gray-500 mb-3 pb-3 border-b border-dashed border-gray-200">
                            FX Rate: 1 {baseCurrency} = {fxRate.toFixed(4)} {displayCurrency}
                             {state.fxRateDate && (
                                <>
                                    <br />
                                    <span className="text-[10px]">(Source: Currency API, as of {state.fxRateDate})</span>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-base font-bold text-gray-800">Split Summary</h3>
                        {splitMode === 'item' && (
                            <div className="flex items-center justify-center space-x-1 bg-gray-200 p-1 rounded-lg text-xs border">
                                <button onClick={() => setSummaryViewMode('detailed')} className={`py-1 px-2 rounded-md ${summaryViewMode === 'detailed' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Detailed</button>
                                <button onClick={() => setSummaryViewMode('compact')} className={`py-1 px-2 rounded-md ${summaryViewMode === 'compact' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Compact</button>
                            </div>
                        )}
                    </div>
                    
                    {renderPerPersonResults()}

                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h3 className="text-base font-bold text-gray-800 mb-2">Reconciliation Summary</h3>
                        <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-lg text-gray-800 border border-gray-200">
                             {splitMode === 'item' ? (
                                <div className="flex justify-between items-center">
                                    <span>Subtotal After Item Discounts:</span>
                                    <DualCurrencyDisplay baseValue={calculations.subtotal - calculations.itemDiscountsTotal} displayMode="stacked" />
                                </div>
                             ) : (
                                <div className="flex justify-between items-center">
                                    <span>Receipt Subtotal:</span>
                                    <DualCurrencyDisplay baseValue={calculations.subtotal} displayMode="stacked" />
                                </div>
                             )}
                            {calculations.globalDiscountAmount > 0 && (
                                <div className="flex justify-between items-center text-red-600">
                                    <span>Global Discount:</span>
                                    <DualCurrencyDisplay baseValue={calculations.globalDiscountAmount} sign="-" displayMode="stacked" className="text-red-600" />
                                </div>
                            )}
                            {taxes.serviceCharge.isEnabled && (
                                <div className="flex justify-between items-center">
                                    <span>{taxes.serviceCharge.name}:</span>
                                    <DualCurrencyDisplay baseValue={calculations.serviceChargeAmount} sign="+" displayMode="stacked" />
                                </div>
                            )}
                            {taxes.vat.isEnabled && (
                                <div className="flex justify-between items-center">
                                    <span>{taxes.vat.name}:</span>
                                    <DualCurrencyDisplay baseValue={calculations.vatAmount} sign="+" displayMode="stacked" />
                                </div>
                            )}
                            {taxes.otherTax.isEnabled && (
                                <div className="flex justify-between items-center">
                                    <span>{taxes.otherTax.name}:</span>
                                    <DualCurrencyDisplay baseValue={calculations.otherTaxAmount} sign="+" displayMode="stacked" />
                                </div>
                            )}
                            <div className="flex justify-between items-center font-bold border-t mt-1 pt-1 border-gray-300">
                                <span>Calculated Total:</span>
                                <DualCurrencyDisplay baseValue={calculations.calculatedTotal} displayMode="stacked" className="font-bold text-gray-800"/>
                            </div>
                            {Math.abs(calculations.adjustment) > 0.01 && (
                                <div className="flex justify-between items-center text-blue-600">
                                    <span>Adjustment (to match receipt):</span>
                                    <DualCurrencyDisplay 
                                        baseValue={calculations.adjustment} 
                                        sign={calculations.adjustment > 0 ? '+' : ''} 
                                        displayMode="stacked" 
                                        className="text-blue-600"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t-2 border-gray-300 flex justify-between font-bold text-xl text-gray-900">
                        <span>Grand Total:</span>
                        <div className="text-right">
                            <span>{currencySymbol}{formatNumber(calculations.grandTotalWithTip * fxRate)}</span>
                            {baseCurrency !== displayCurrency && (
                                <div className="text-sm font-normal text-gray-500">
                                    ({baseCurrencySymbol}{formatNumber(calculations.grandTotalWithTip)})
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {includeReceiptInSummary && uploadedReceipt && (
                        <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 text-center mb-2">Attached Receipt</h4>
                            <img src={`data:image/png;base64,${uploadedReceipt}`} alt="Receipt" className="w-full rounded-lg shadow-sm" />
                        </div>
                    )}

                    {(hasQrCode || hasNotes) && (
                        <div className={`mt-4 pt-4 border-t border-dashed border-gray-300/80 grid grid-cols-1 ${hasQrCode && hasNotes ? 'sm:grid-cols-2' : ''} gap-4`}>
                            {hasQrCode && (
                                <div className={`space-y-2 ${!hasNotes ? 'flex flex-col items-center' : ''}`}>
                                    <h4 className="text-sm font-semibold text-gray-700 text-center">Payment QR Code</h4>
                                    <div className="relative w-fit mx-auto">
                                        <img src={qrCodeImage} alt="Payment QR Code" className={`rounded-lg object-contain ${!hasNotes ? 'max-w-[240px] max-h-[240px]' : 'max-w-[120px] max-h-[120px]'}`} />
                                    </div>
                                </div>
                            )}
                            {hasNotes && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-700 text-center sm:text-left">Notes</h4>
                                    <p className="w-full p-2 text-xs whitespace-pre-wrap bg-white rounded-md border border-gray-200 min-h-[128px] text-gray-800">{notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-gray-300/80 space-y-3">
                <div className="flex items-center gap-3">
                    {/* QR Code Uploader/Display */}
                    {qrCodeImage ? (
                        <div className="relative w-fit flex-shrink-0">
                            <img src={qrCodeImage} alt="Payment QR Code" className="rounded-lg h-12 w-12 object-cover border border-gray-200" />
                            <button onClick={() => dispatch({type: 'SET_QR_CODE_IMAGE', payload: null})} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md border-2 border-white">
                                <X size={12} strokeWidth={3} />
                            </button>
                        </div>
                    ) : (
                        <label htmlFor="qr-upload" className="flex-shrink-0 flex items-center justify-center h-12 w-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-100 hover:bg-gray-200 transition">
                            <QrCode className="w-6 h-6 text-gray-500" />
                            <input id="qr-upload" type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
                        </label>
                    )}
                    
                    {/* Notes Input */}
                    <input
                        type="text"
                        value={notes}
                        onChange={e => dispatch({type: 'SET_NOTES', payload: e.target.value})}
                        placeholder="Add QR payment info or other notes..."
                        className="w-full p-2 h-12 border rounded-md text-sm bg-white text-gray-900 border-gray-300 focus:ring-agoda-blue focus:border-agoda-blue transition"
                    />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-300/80">
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100">
                    <input
                    type="checkbox"
                    checked={includeReceiptInSummary}
                    onChange={() => dispatch({ type: 'TOGGLE_INCLUDE_RECEIPT' })}
                    className="h-4 w-4 rounded text-agoda-blue focus:ring-agoda-blue border-gray-300 disabled:opacity-50"
                    disabled={!uploadedReceipt}
                    />
                    <span className={`text-sm ${!uploadedReceipt ? 'text-gray-400' : 'text-gray-700'}`}>
                        Attach receipt image to summary
                    </span>
                </label>
            </div>
            
             <button onClick={handleSaveSummary} className="mt-4 w-full bg-agoda-blue hover:bg-agoda-blue-dark text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                <Download size={18} />
                <span>Save Summary as Image</span>
            </button>
        </div>
    );
};

export default Summary;

    