
'use server';

import { ai } from '@/ai/genkit';
import type { Transaction } from '@/lib/types';
import { z } from 'zod';
import { fromUnixTime, format } from 'date-fns';

const toDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp && typeof timestamp.seconds === 'number') {
    return fromUnixTime(timestamp.seconds);
  }
  const d = new Date(timestamp);
  return d;
};

const TransactionSchemaForAI = z.object({
  type: z.enum(['deposit', 'withdrawal']),
  amount: z.number(),
  category: z.string(),
  // We simplify the timestamp to a string for the AI model
  date: z.string().describe("The date of the transaction in 'yyyy-MM-dd' format."),
});

type TransactionForAI = z.infer<typeof TransactionSchemaForAI>;

const SummarizeTransactionsInputSchema = z.array(TransactionSchemaForAI);

const SummarizeTransactionsOutputSchema = z.object({
  summary: z.string().describe('A concise, 2-3 sentence summary of the user\'s financial activity.'),
});

export async function summarizeTransactions(transactions: Transaction[]): Promise<z.infer<typeof SummarizeTransactionsOutputSchema>> {
  // Preprocess the data to be more AI-friendly
  const preparedTransactions: TransactionForAI[] = transactions
    .map(t => {
      const date = toDate(t.timestamp);
      return date ? {
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: format(date, 'yyyy-MM-dd'),
      } : null;
    })
    .filter((t): t is TransactionForAI => t !== null);
  
  if (preparedTransactions.length === 0) {
    return { summary: "There are no transactions available to analyze." };
  }

  return summarizeTransactionsFlow(preparedTransactions);
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
