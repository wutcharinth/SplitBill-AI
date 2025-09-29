
'use server';

/**
 * @fileOverview A receipt data extraction AI agent.
 *
 * - extractReceiptData - A function that handles the receipt data extraction process.
 */

import {ai} from '@/ai/init';
import {ExtractReceiptDataInputSchema, ExtractReceiptDataOutputSchema} from './extract-receipt-data.types';
import type { ExtractReceiptDataInput, ExtractReceiptDataOutput } from './extract-receipt-data.types';

export async function extractReceiptData(input: ExtractReceiptDataInput): Promise<ExtractReceiptDataOutput> {
  return extractReceiptDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractReceiptDataPrompt',
  input: {schema: ExtractReceiptDataInputSchema},
  output: {schema: ExtractReceiptDataOutputSchema},
  prompt: `You are an expert financial assistant specializing in extracting and translating data from receipts. Your task is to meticulously analyze the provided receipt image.

**Analysis Steps:**
1.  **Extract Core Information:** You MUST identify the restaurant name and the transaction date from the receipt. You MUST format the date as YYYY-MM-DD.
2.  **Determine Currency:** This is a critical step. You MUST determine the currency from the receipt.
    *   First, look for an explicit currency symbol (e.g., $, £, ¥, ฿) on the receipt.
    *   If no symbol is present, infer the currency from the language of the text or location context on the receipt (e.g., Japanese text implies JPY, Thai text implies THB).
3.  **Identify the FINAL TOTAL:** This is the most important step. Find the final, total amount due from the receipt. This is often labeled "Total", "Grand Total", or "合計" (Go-kei) in Japanese. This value is what you must use for the \`total\` field.
4.  **Separate Items from Charges/Discounts:**
    *   First, identify and list all purchased food and drink items in the 'items' array.
    *   Next, scan the receipt for any line items that are NOT food or drink. These are additional charges or discounts. This includes, but is not limited to, "Delivery fee," "Service Charge," "S.C.," "サービス料" (Service Fee), "VAT," "Tax," "消費税" (Consumption Tax), "Coupon", or store-specific discounts like "ส่วนลดร้านที่ร่วมรายการ".
5.  **Categorize into Fees and Discounts:**
    *   Any charge that adds to the total (e.g., "Delivery Fee", "Service Charge", "VAT") must be placed in the \`fees\` array. Each fee should be a separate object in the array.
    *   Any charge that reduces the total (e.g., "Coupon", or other promotional discounts, often shown as a negative number) must be placed in the \`discounts\` array. The amount for discounts should ALWAYS be a positive number. Each discount should be a separate object in the array.
    *   **IMPORTANT:** Line items categorized as \`fees\` or \`discounts\` MUST NOT appear in the main \`items\` array.
6.  **Translate:** For all extracted item names, fees, and discounts that are not in English, you MUST provide an English translation in the corresponding 'translatedName' field.

**Source of Information:**
Photo: {{media url=photoDataUri}}

Output the extracted data as a JSON object matching the output schema.
`,
});

const extractReceiptDataFlow = ai.defineFlow(
  {
    name: 'extractReceiptDataFlow',
    inputSchema: ExtractReceiptDataInputSchema,
    outputSchema: ExtractReceiptDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
