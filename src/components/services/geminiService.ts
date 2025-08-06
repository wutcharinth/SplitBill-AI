import { GeminiResponse } from '../types';

const API_ENDPOINT = 'https://us-central1-gapps-solutions-dev.cloudfunctions.net/bill-parser-v2';

export const parseReceipt = async (base64Image: string, mimeType: string): Promise<GeminiResponse> => {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Image,
                mime_type: mimeType,
            }),
        });
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error response from API:', errorBody);
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data: GeminiResponse = await response.json();
        return data;

    } catch (error) {
        console.error('Failed to parse receipt:', error);
        if (error instanceof Error) {
            throw new Error(`There was a problem analyzing the receipt: ${error.message}`);
        }
        throw new Error('An unknown error occurred while communicating with the AI service.');
    }
};
