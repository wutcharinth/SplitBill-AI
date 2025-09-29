/**
 * @fileOverview Types for the receipt data extraction AI agent.
 *
 * - ExtractReceiptDataInput - The input type for the extractReceiptData function.
 * - ExtractReceiptDataOutput - The return type for the extractReceiptData function.
 */

import {z} from 'genkit';

export const ExtractReceiptDataInputSchema = z.object({
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


export const ExtractReceiptDataOutputSchema = z.object({
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
