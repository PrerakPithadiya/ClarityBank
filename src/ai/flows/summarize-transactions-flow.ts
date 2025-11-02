
'use server';

import { ai } from '@/ai/genkit';
import type { Transaction } from '@/lib/types';
import { z } from 'zod';
import { fromUnixTime, format } from 'date-fns';

const toDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  // Handle Firestore Timestamp object which might not be a Date object on the server
  if (timestamp && typeof timestamp.seconds === 'number') {
    return fromUnixTime(timestamp.seconds);
  }
  // Handle ISO string or other date formats
  const d = new Date(timestamp);
  return d;
};


const TransactionSchemaForAI = z.object({
  type: z.enum(['deposit', 'withdrawal']),
  amount: z.number(),
  category: z.string(),
  // The AI model will receive a simple date string
  date: z.string().describe("The date of the transaction in 'yyyy-MM-dd' format."),
});

// The input for the flow is an array of these simplified transaction objects
const SummarizeTransactionsInputSchema = z.array(TransactionSchemaForAI);

export type TransactionForAI = z.infer<typeof TransactionSchemaForAI>;

const SummarizeTransactionsOutputSchema = z.object({
  summary: z.string().describe('A concise, 2-3 sentence summary of the user\'s financial activity.'),
});

export async function summarizeTransactions(transactions: TransactionForAI[]): Promise<z.infer<typeof SummarizeTransactionsOutputSchema>> {
  if (transactions.length === 0) {
    return { summary: "There are no transactions available to analyze." };
  }

  return summarizeTransactionsFlow(transactions);
}

const prompt = ai.definePrompt({
  name: 'summarizeTransactionsPrompt',
  input: { schema: SummarizeTransactionsInputSchema },
  output: { schema: SummarizeTransactionsOutputSchema },
  prompt: `You are a helpful and friendly financial assistant named Clarity.
Your goal is to provide a concise, 2-3 sentence summary of a user's recent transaction history.
Analyze the provided JSON data to identify key patterns, trends, or notable activities.

Focus on:
- Overall spending vs. saving habits.
- Top spending categories.
- Any significant or unusual transactions (large deposits or withdrawals).
- Consistency in income or spending.

Do not just list the data. Provide a warm, encouraging, and insightful narrative.
Address the user directly (e.g., "You've been...").

Here is the user's recent transaction data:
{{{jsonStringify input}}}
`,
});

const summarizeTransactionsFlow = ai.defineFlow(
  {
    name: 'summarizeTransactionsFlow',
    inputSchema: SummarizeTransactionsInputSchema,
    outputSchema: SummarizeTransactionsOutputSchema,
  },
  async (transactions) => {
    const { output } = await prompt(transactions);
    return output!;
  }
);
