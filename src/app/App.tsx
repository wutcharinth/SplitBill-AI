
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Camera, Upload, PlusCircle } from 'lucide-react';
import { parseReceipt } from '../services/geminiService';
import { BillData, Person } from '../types';
import { ALLOWED_CURRENCIES, PERSON_COLORS, COUNTRY_CURRENCY_MAP, CURRENCIES } from '../constants';
import MainApp from './MainApp';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import imageCompression from 'browser-image-compression';
import { ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data';
import Link from 'next/link';
import { useUsage, UsageProvider } from '@/hooks/useUsageTracker';


function AppContent({ modelName }: { modelName: string }) {
    const [view, setView] = useState<'upload' | 'loading' | 'main' | 'error'>('upload');
    const [billData, setBillData] = useState<BillData | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);
    const [consentGiven, setConsentGiven] = useState(true);
    const [isFirstVisit, setIsFirstVisit] = useState(true);
    const { recordUsage } = useUsage();

    useEffect(() => {
        try {
            const consent = localStorage.getItem('consent_given');
            if (consent === 'true') {
                setIsFirstVisit(false);
                setConsentGiven(true);
            } else {
                setIsFirstVisit(true);
                setConsentGiven(false);
            }
        } catch (e) {
            // If localStorage is not available, default to requiring consent each time.
            setIsFirstVisit(true);
            setConsentGiven(false);
        }
    }, []);

    const handleConsentChange = (checked: boolean) => {
        setConsentGiven(checked);
        if (checked) {
            try {
                localStorage.setItem('consent_given', 'true');
            } catch (e) {
                console.error("Could not save consent to localStorage", e);
            }
        }
    };
    
    const handleFileChange = async (file: File | null) => {
        if (!file) return;

        setView('loading');
        setUploadedReceipt(null);

        try {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            const mimeType = compressedFile.type || 'image/jpeg';
            const base64 = await fileToBase64(compressedFile);
            setUploadedReceipt(base64);
            
            const data = await parseReceipt(base64, mimeType);
            processParsedData(data);
            recordUsage(); // Track usage

        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred while processing the image.';
            setErrorMessage(message);
            setView('error');
        }
    };

    const handleStartManual = () => {
        setUploadedReceipt(null);
        processParsedData(null);
        recordUsage(); // Track usage
    };

    const processParsedData = (data: ExtractReceiptDataOutput | null) => {
        const detectedCurrency = data?.currency?.toUpperCase();
        const baseCurrency = (detectedCurrency && CURRENCIES[detectedCurrency]) 
            ? detectedCurrency 
            : getCurrencyFromLocale();
        
        const initialPeople: Person[] = [
            { id: `p${Date.now()}-1`, name: 'P1', color: PERSON_COLORS[0] },
            { id: `p${Date.now()}-2`, name: 'P2', color: PERSON_COLORS[1] }
        ];

        const initialPayments = initialPeople.map(person => ({
            id: person.id,
            amount: 0,
            paidBy: person.id,
        }));

        const newBillData: BillData = {
            items: data?.items.map(item => ({ ...item, shares: Array(initialPeople.length).fill(0) })) || [],
            people: initialPeople,
            taxes: {
                serviceCharge: { id: 'serviceCharge', name: data?.serviceCharge?.translatedName || data?.serviceCharge?.name || 'Service Charge', translatedName: data?.serviceCharge?.name !== data?.serviceCharge?.translatedName ? data?.serviceCharge?.name : null, amount: data?.serviceCharge?.amount || 0, isEnabled: !!data?.serviceCharge?.amount },
                vat: { id: 'vat', name: data?.vat?.translatedName || data?.vat?.name || 'VAT', translatedName: data?.vat?.name !== data?.vat?.translatedName ? data?.vat?.name : null, amount: data?.vat?.amount || 0, isEnabled: !!data?.vat?.amount },
                otherTax: { id: 'otherTax', name: data?.otherTax?.translatedName || data?.otherTax?.name || 'Other Tax', translatedName: data?.otherTax?.name !== data?.otherTax?.translatedName ? data?.otherTax?.name : null, amount: data?.otherTax?.amount || 0, isEnabled: !!data?.otherTax?.amount },
            },
            discount: { value: data?.discount || 0, type: 'fixed', shares: [] },
            tip: 0,
            tipSplitMode: 'proportionally',
            payments: initialPayments,
            billTotal: data?.total || 0,
            baseCurrency: baseCurrency,
            restaurantName: data?.restaurantName || '',
            billDate: data?.date || new Date().toISOString().split('T')[0],
        };
        setBillData(newBillData);
        setView('main');
    };

    const handleReset = () => {
        setUploadedReceipt(null);
        setView('upload');
        setBillData(null);
        setErrorMessage('');
    };

    const ActionButton = ({ id, onClick, disabled, icon, text, type = 'primary', as: Component = 'button', className = '' }: { id?: string, onClick?: (e?: any) => void, disabled: boolean, icon: React.ReactNode, text: string, type?: 'primary' | 'secondary' | 'ghost', as?: React.ElementType, className?: string }) => {
        const baseClasses = "group flex items-center justify-center space-x-3 w-full font-bold py-3 px-6 rounded-lg transition-all transform";
        const typeClasses = {
            primary: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:scale-105',
            secondary: 'bg-card text-card-foreground border border-border hover:bg-muted hover:shadow-lg hover:scale-105',
            ghost: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-lg hover:scale-105'
        };
        const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none";

        return (
            <Component id={id} onClick={onClick} disabled={disabled} className={`${baseClasses} ${typeClasses[type]} ${disabledClasses} ${className}`}>
                {icon}
                <span>{text}</span>
            </Component>
        )
    }

    const renderContent = () => {
        switch (view) {
            case 'loading':
                return <Loader message="Analyzing receipt..." modelName={modelName} />;
            case 'error':
                return <ErrorMessage message={errorMessage} onReset={handleReset} />;
            case 'main':
                return billData ? <MainApp initialBillData={billData} onReset={handleReset} uploadedReceipt={uploadedReceipt} /> : <ErrorMessage message="Failed to load bill data." onReset={handleReset} />;
            case 'upload':
            default:
                return (
                    <div className="min-h-screen flex flex-col justify-center items-center p-4">
                        <div className="w-full max-w-sm mx-auto text-center">
                            <div className="flex flex-col justify-center items-center mb-4">
                               <img src="https://i.postimg.cc/hgX62bcn/Chat-GPT-Image-Aug-8-2025-04-14-15-PM.png" alt="SplitBill AI Logo" className="h-48 w-48" />
                            </div>
                            <p className="text-gray-600 mb-8 text-lg font-medium">Snap.Split.Share!</p>
                            
                             <div className="space-y-4">
                                <label htmlFor="camera-upload" className={`cursor-pointer ${!consentGiven ? 'cursor-not-allowed' : ''}`}>
                                    <ActionButton
                                        as="div"
                                        disabled={!consentGiven}
                                        icon={<Camera size={20} />}
                                        text="Take a Picture"
                                    />
                                </label>
                                <input id="camera-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} disabled={!consentGiven} />
                                
                                <label htmlFor="file-upload" className={`cursor-pointer ${!consentGiven ? 'cursor-not-allowed' : ''}`}>
                                    <ActionButton
                                        as="div"
                                        disabled={!consentGiven}
                                        icon={<Upload size={20} />}
                                        text="Upload from Library"
                                        type="secondary"
                                    />
                                </label>
                                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} disabled={!consentGiven} />

                                <ActionButton
                                    onClick={handleStartManual}
                                    disabled={!consentGiven}
                                    icon={<PlusCircle size={20} />}
                                    text="Start without Receipt"
                                    type="ghost"
                                />
                            </div>
                            
                            {isFirstVisit && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-start space-x-2">
                                        <input
                                            type="checkbox"
                                            id="consent"
                                            checked={consentGiven}
                                            onChange={(e) => handleConsentChange(e.target.checked)}
                                            className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary border-gray-300"
                                        />
                                        <label htmlFor="consent" className="text-[11px] text-gray-500 text-left">
                                            I have read and agree to the{' '}
                                            <Link href="/terms" target="_blank" className="underline text-primary hover:text-primary/80">
                                                Terms & Policies
                                            </Link>.
                                        </label>
                                    </div>
                                </div>
                            )}
                            
                            <footer className="text-center pt-8 mt-8 text-xs text-muted-foreground">
                                <div className="flex justify-center space-x-4">
                                    <Link href="/about" className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors">About</Link>
                                    <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors">Terms & Policies</Link>
                                    <Link href="/contact" className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors">Contact</Link>
                                </div>
                            </footer>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <>
            {renderContent()}
        </>
    );
}

const fileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            if (base64Data) {
                resolve(base64Data);
            } else {
                reject(new Error('Failed to convert file to base64.'));
            }
        };
        reader.onerror = error => reject(error);
    });
};

const getCurrencyFromLocale = (): string => {
    try {
        const locale = navigator.language; // e.g., "en-US"
        if (locale) {
            const region = locale.split('-')[1]?.toUpperCase();
            if (region) {
                const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(region);
                if (countryName && COUNTRY_CURRENCY_MAP[countryName]) {
                    const currencyCode = COUNTRY_CURRENCY_MAP[countryName];
                    if (CURRENCIES[currencyCode]) {
                        return currencyCode;
                    }
                }
            }
        }
    } catch (e) {
        console.error("Could not determine currency from locale", e);
    }
    return 'USD'; // Fallback
};

export default function App({ modelName }: { modelName: string }) {
    return (
        <UsageProvider>
            <AppContent modelName={modelName} />
        </UsageProvider>
    )
}
