
'use server';

/**
 * @fileOverview A receipt data extraction AI agent.
 *
 * - extractReceiptData - A function that handles the receipt data extraction process.
 * - ExtractReceiptDataInput - The input type for the extractReceiptData function.
 * - ExtractReceiptDataOutput - The return type for the extractReceiptData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractReceiptDataInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractReceiptDataInput = z.infer<typeof ExtractReceiptDataInputSchema>;

const feeSchema = z.object({
    id: z.string().describe('A unique identifier for the fee (e.g., "delivery", "service-charge").'),
    name: z.string().describe('The original name of the fee/charge from the receipt.'),
    translatedName: z.string().optional().describe('The English translation of the fee/charge name if it was not in English.'),
    amount: z.number().describe('The amount of the fee/charge.'),
});

const discountSchema = z.object({
    id: z.string().describe('A unique identifier for the discount (e.g., "coupon", "store-discount").'),
    name: z.string().describe('The original name of the discount from the receipt (e.g., "Coupon", "ส่วนลดร้านที่ร่วมรายการ").'),
    translatedName: z.string().optional().describe('The English translation of the discount name if it was not in English.'),
    amount: z.number().describe('The amount of the discount as a positive number.'),
});


const ExtractReceiptDataOutputSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().describe('The name of the item.'),
      translatedName: z.string().optional().describe('The English translation of the item name if it was not in English.'),
      price: z.number().describe('The price of the item.'),
    })
  ).describe('The list of items extracted from the receipt. If the item name is not in English, provide an English translation.'),
  total: z.number().describe('The total amount due on the receipt.'),
  restaurantName: z.string().optional().describe('The name of the restaurant.'),
  date: z.string().optional().describe('The date of the receipt in YYYY-MM-DD format. Find this date on the receipt.'),
  currency: z.string().optional().describe('The currency of the receipt (e.g., USD, EUR, THB).'),
  fees: z.array(feeSchema).optional().describe('A list of all fees found on the receipt, such as "Delivery fee", "Service Charge", "VAT", "Tax", "Additional service fee", etc. Each fee should be its own object in the array.'),
  discounts: z.array(discountSchema).optional().describe('A list of all discounts found on the receipt. Discounts are typically negative numbers on a receipt, but should be returned as positive values here. Examples include "Coupon" or campaign discounts.'),
});
export type ExtractReceiptDataOutput = z.infer<typeof ExtractReceiptDataOutputSchema>;

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
