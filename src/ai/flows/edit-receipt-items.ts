
'use server';

/**
 * @fileOverview A flow for editing receipt items after AI processing.
 *
 * - editReceiptItems - A function that allows users to edit receipt items.
 */

import {ai} from '@/ai/init';
import {EditReceiptItemsInputSchema, EditReceiptItemsOutputSchema} from './edit-receipt-items.types';
import type { EditReceiptItemsInput, EditReceiptItemsOutput } from './edit-receipt-items.types';


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
