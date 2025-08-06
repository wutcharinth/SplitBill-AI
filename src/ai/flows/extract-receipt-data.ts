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
  date: z.string().optional().describe('The date of the receipt (e.g., YYYY-MM-DD).'),
  discount: z.number().optional().describe('The total discount amount on the receipt. This should be a positive number.'),
  currency: z.string().optional().describe('The currency of the receipt (e.g., USD, EUR, THB).'),
  serviceCharge: taxSchema.optional().describe('The service charge, if present.'),
  vat: taxSchema.optional().describe('The Value Added Tax (VAT), if present.'),
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
  prompt: `You are an expert financial assistant specializing in extracting and translating data from receipts.

You will use this information to extract the items, their prices, and the total amount due on the receipt. Also extract the restaurant name, the date of the transaction, and the currency.

If there is a discount, extract the total discount amount.
If there are service charges, VAT, or other taxes, extract their names and amounts.

For all extracted item names, service charges, and taxes that are not in English, you MUST provide an English translation in the corresponding 'translatedName' field.

Use the following as the primary source of information about the receipt.

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
