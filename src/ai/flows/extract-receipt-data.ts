
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

const taxSchema = z.object({
    name: z.string().describe('The original name of the tax/charge from the receipt.'),
    translatedName: z.string().optional().describe('The English translation of the tax/charge name if it was not in English.'),
    amount: z.number().describe('The amount of the tax/charge.'),
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
  discount: z.number().optional().describe('The total discount amount on the receipt. This should be a positive number.'),
  currency: z.string().optional().describe('The currency of the receipt (e.g., USD, EUR, THB).'),
  serviceCharge: taxSchema.optional().describe('The service charge, if present. Look for terms like "Service Charge", "S.C.", or the Japanese term "サービス料".'),
  vat: taxSchema.optional().describe('The Value Added Tax (VAT), if present. Look for terms like "VAT" or the Japanese term "消費税".'),
  otherTax: taxSchema.optional().describe('Any other taxes or fees, if present.'),
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
2.  **Determine Currency:** You MUST determine the currency from the receipt. If a symbol (e.g., $, £, ¥, ฿) is present, use it. If not, infer the currency from the language or location context on the receipt (e.g., Japanese text implies JPY, Thai text implies THB).
3.  **Identify the FINAL TOTAL:** This is the most important step. Find the final, total amount due from the receipt. This is often labeled "Total", "Grand Total", or "合計" (Go-kei) in Japanese. This value is what you must use for the \`total\` field.
4.  **Separate Items from Charges:**
    *   First, identify and list all purchased food and drink items in the 'items' array.
    *   Next, scan the receipt for any line items that are NOT food or drink. These are additional charges. This includes, but is not limited to, "Service Charge," "S.C.," "サービス料" (Service Fee), "VAT," "Tax," "消費税" (Consumption Tax), or any other fees.
5.  **Categorize Charges:**
    *   If a charge is for service (e.g., "Service Charge", "サービス料"), place it in the \`serviceCharge\` field.
    *   If a charge is for a value-added tax (e.g., "VAT", "消費税"), place it in the \`vat\` field.
    *   Place any other miscellaneous charges into the \`otherTax\` field.
    *   **IMPORTANT:** Items categorized as \`serviceCharge\`, \`vat\`, or \`otherTax\` MUST NOT appear in the main \`items\` array.
6.  **Extract Discounts:** If a discount is listed, extract the total discount amount.
7.  **Translate:** For all extracted item names, service charges, and taxes that are not in English, you MUST provide an English translation in the corresponding 'translatedName' field.

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
