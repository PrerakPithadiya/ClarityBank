"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

type BalanceCardProps = {
  balance: number;
  bankName?: string;
};

export function BalanceCard({ balance, bankName }: BalanceCardProps) {
  const [formattedBalance, setFormattedBalance] = useState<string>('');

  useEffect(() => {
    setFormattedBalance(
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(balance)
    );
  }, [balance]);

  return (
    <Card className="h-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-muted-foreground font-medium">{bankName || 'Current Balance'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold tracking-tighter text-primary">
          {formattedBalance || <span className="opacity-50">$...</span>}
        </div>
        <CardDescription className="mt-2">Available for use</CardDescription>
      </CardContent>
    </Card>
  );
}
