/**
 * @fileOverview Types for the receipt item editing flow.
 *
 * - EditReceiptItemsInput - The input type for the editReceiptItems function.
 * - EditReceiptItemsOutput - The return type for the editReceiptItems function.
 */

import {z} from 'genkit';

export const EditReceiptItemsInputSchema = z.object({
  receiptItems: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      price: z.number(),
      assignedTo: z.string().optional(),
    })
  ).describe('The list of receipt items to edit. Includes name, price and assigned person'),
});
export type EditReceiptItemsInput = z.infer<typeof EditReceiptItemsInputSchema>;

export const EditReceiptItemsOutputSchema = z.object({
  receiptItems: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      price: z.number(),
      assignedTo: z.string().optional(),
    })
  ).describe('The updated list of receipt items after editing.'),
});
export type EditReceiptItemsOutput = z.infer<typeof EditReceiptItemsOutputSchema>;
