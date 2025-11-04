
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';


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
  // If there are no transactions, we can return a default message without calling the AI.
  if (!transactions || transactions.length === 0) {
    return { summary: "There are no transactions available to analyze for this period." };
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

If there are no transactions, simply state: "Once you start making transactions, your personalized financial summary will appear here."

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
