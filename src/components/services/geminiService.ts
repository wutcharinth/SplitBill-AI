import { extractReceiptData } from '@/ai/flows/extract-receipt-data';
import type { ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data.types';

export const parseReceipt = async (base64Image: string, mimeType: string): Promise<ExtractReceiptDataOutput> => {
    try {
        const photoDataUri = `data:${mimeType};base64,${base64Image}`;
        const data = await extractReceiptData({ photoDataUri });
        return data;
    } catch (error) {
        console.error('Failed to parse receipt:', error);
        if (error instanceof Error) {
            throw new Error(`There was a problem analyzing the receipt: ${error.message}`);
        }
        throw new Error('An unknown error occurred while communicating with the AI service.');
    }
};
