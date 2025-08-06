'use server';

/**
 * @fileOverview A flow for editing receipt items after AI processing.
 *
 * - editReceiptItems - A function that allows users to edit receipt items.
 * - EditReceiptItemsInput - The input type for the editReceiptItems function.
 * - EditReceiptItemsOutput - The return type for the editReceiptItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditReceiptItemsInputSchema = z.object({
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

const EditReceiptItemsOutputSchema = z.object({
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

export async function editReceiptItems(input: EditReceiptItemsInput): Promise<EditReceiptItemsOutput> {
  return editReceiptItemsFlow(input);
}

const editReceiptItemsFlow = ai.defineFlow(
  {
    name: 'editReceiptItemsFlow',
    inputSchema: EditReceiptItemsInputSchema,
    outputSchema: EditReceiptItemsOutputSchema,
  },
  async input => {
    // This flow currently just returns the input.  In the future, this flow could
    // call an LLM to validate and/or correct the receipt items.
    return {receiptItems: input.receiptItems};
  }
);
