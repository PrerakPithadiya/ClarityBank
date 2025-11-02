
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Transaction } from '@/lib/types';
import { summarizeTransactions } from '@/ai/flows/summarize-transactions-flow';
import { Lightbulb } from 'lucide-react';

interface SmartSummaryCardProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function SmartSummaryCard({ transactions, isLoading }: SmartSummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isAiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (transactions && transactions.length > 0 && !isLoading) {
      setAiLoading(true);
      summarizeTransactions(transactions)
        .then(result => setSummary(result.summary))
        .catch(err => {
            console.error("AI summary failed:", err);
            setSummary("Could not generate insights at this time.");
        })
        .finally(() => setAiLoading(false));
    }
  }, [transactions, isLoading]);

  const showSkeleton = isLoading || isAiLoading;

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-primary" />
            <div>
                <CardTitle className="text-primary">Smart Insights</CardTitle>
                <CardDescription>AI-powered summary of your recent activity.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {showSkeleton ? (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        ) : (
          <p className="text-sm text-foreground">
            {summary || 'No insights to display. Start by making some transactions!'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
