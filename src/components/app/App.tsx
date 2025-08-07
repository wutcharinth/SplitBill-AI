'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Camera, Upload, PlusCircle } from 'lucide-react';
import { parseReceipt } from '../services/geminiService';
import { BillData, Person } from '../types';
import { ALLOWED_CURRENCIES, PERSON_COLORS, COUNTRY_CURRENCY_MAP, CURRENCIES } from '../constants';
import MainApp from './MainApp';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import imageCompression from 'browser-image-compression';
import { ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data';
import { useUsage } from '../hooks/useUsageTracker';

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


export default function App() {
    const [view, setView] = useState<'upload' | 'loading' | 'main' | 'error'>('upload');
    const [billData, setBillData] = useState<BillData | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);
    const { canUse, recordUsage, monthlyUses, USAGE_LIMIT } = useUsage();

    useEffect(() => {
        const embedGoogleFonts = async () => {
            try {
                // This URL points to the CSS file that defines the Manrope font-family.
                const fontCssUrl = 'https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap';
                const response = await fetch(fontCssUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch font CSS: ${response.statusText}`);
                }
                const cssText = await response.text();
                
                const style = document.createElement('style');
                style.textContent = cssText;
                document.head.appendChild(style);
            } catch (error) {
                console.error('Could not embed Google Fonts:', error);
            }
        };

        embedGoogleFonts();
    }, []);

    const handleFileChange = async (file: File | null) => {
        if (!file) return;

        if (!canUse) {
            setErrorMessage(`You have reached your monthly limit of ${USAGE_LIMIT} receipt scans. Please try again next month.`);
            setView('error');
            return;
        }

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
            
            recordUsage();

            const data = await parseReceipt(base64, mimeType);
            processParsedData(data);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred while processing the image.';
            setErrorMessage(message);
            setView('error');
        }
    };

    const handleStartManual = () => {
        if (!canUse) {
            setErrorMessage(`You have reached your monthly limit of ${USAGE_LIMIT} receipt scans. Please try again next month.`);
            setView('error');
            return;
        }
        
        recordUsage();

        setUploadedReceipt(null);
        processParsedData(null);
    };

    const processParsedData = (data: ExtractReceiptDataOutput | null) => {
        const detectedCurrency = data?.currency?.toUpperCase();
        const baseCurrency = (detectedCurrency && ALLOWED_CURRENCIES[detectedCurrency]) 
            ? detectedCurrency 
            : getCurrencyFromLocale();
        
        const initialPeople: Person[] = [
            { id: `p${Date.now()}-1`, name: 'P1', color: PERSON_COLORS[0] },
            { id: `p${Date.now()}-2`, name: 'P2', color: PERSON_COLORS[1] }
        ];

        const newBillData: BillData = {
            items: data?.items.map(item => ({ ...item, shares: Array(initialPeople.length).fill(0) })) || [],
            people: initialPeople,
            taxes: {
                serviceCharge: { id: 'serviceCharge', name: data?.serviceCharge?.translatedName || data?.serviceCharge?.name || 'Service Charge', amount: data?.serviceCharge?.amount || 0, isEnabled: !!data?.serviceCharge?.amount },
                vat: { id: 'vat', name: data?.vat?.translatedName || data?.vat?.name || 'VAT', amount: data?.vat?.amount || 0, isEnabled: !!data?.vat?.amount },
                otherTax: { id: 'otherTax', name: data?.otherTax?.translatedName || data?.otherTax?.name || 'Other Tax', amount: data?.otherTax?.amount || 0, isEnabled: !!data?.otherTax?.amount },
            },
            discount: { value: data?.discount || 0, type: 'fixed', shares: [] },
            tip: 0,
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

    const renderContent = () => {
        switch (view) {
            case 'loading':
                return <Loader message="Analyzing receipt..." />;
            case 'error':
                return <ErrorMessage message={errorMessage} onReset={handleReset} />;
            case 'main':
                return billData ? <MainApp initialBillData={billData} onReset={handleReset} uploadedReceipt={uploadedReceipt} /> : <ErrorMessage message="Failed to load bill data." onReset={handleReset} />;
            case 'upload':
            default:
                return (
                    <div className="min-h-screen flex flex-col justify-center items-center p-4">
                        <div className="w-full max-w-sm mx-auto text-center">
                            <img src="https://i.postimg.cc/FmGScVWG/image.png" alt="SplitBill Logo" className="h-40 mx-auto" />
                            <p className="text-gray-600 mt-1 mb-6 text-lg font-medium">Snap. Split. Done.</p>
                            
                            <div className="space-y-3">
                                <label htmlFor="camera-upload" className="cursor-pointer group flex items-center justify-center space-x-3 w-full bg-agoda-blue text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:bg-agoda-blue-dark hover:shadow-lg hover:scale-105">
                                    <Camera size={20} />
                                    <span>Take a Picture</span>
                                </label>
                                <input id="camera-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                                
                                <label htmlFor="file-upload" className="cursor-pointer group flex items-center justify-center space-x-3 w-full bg-white text-gray-800 font-bold py-3 px-6 rounded-lg border border-gray-300 transition-all transform hover:bg-gray-50 hover:shadow-lg hover:scale-105">
                                    <Upload size={20} />
                                    <span>Upload from Library</span>
                                </label>
                                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />

                                <button onClick={handleStartManual} className="group flex items-center justify-center space-x-3 w-full bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg transition-all transform hover:bg-slate-300 hover:shadow-lg hover:scale-105">
                                    <PlusCircle size={20} />
                                    <span>Start without Receipt</span>
                                </button>
                            </div>
                                <div className="mt-6 text-center text-sm text-gray-500">
                                    <p>You have {USAGE_LIMIT - monthlyUses} free scans remaining this month.</p>
                                </div>
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
