
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getBankInfo } from '@/lib/banks';


type BalanceCardProps = {
  balance: number;
  bankId: string;
  bankName?: string;
};

export function BalanceCard({ balance, bankId, bankName }: BalanceCardProps) {
  const [formattedBalance, setFormattedBalance] = useState<string>('');
  const bankInfo = getBankInfo(bankId);

  useEffect(() => {
    setFormattedBalance(
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(balance)
    );
  }, [balance]);
  
  const themeStyle = bankInfo?.themeColor ? {
      backgroundColor: bankInfo.themeColor,
      color: '#FFFFFF' // Assuming white text for contrast on colored backgrounds
  } : {};

  const titleColor = bankInfo?.themeColor ? 'text-white/80' : 'text-muted-foreground';
  const balanceColor = bankInfo?.themeColor ? 'text-white' : 'text-primary';
  const descriptionColor = bankInfo?.themeColor ? 'text-white/90' : '';


  return (
    <Card className="h-full shadow-lg transition-colors" style={themeStyle}>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle className={cn("font-medium", titleColor)}>{bankName || 'Current Balance'}</CardTitle>
          <CardDescription className={cn("mt-2", descriptionColor)}>Available for use</CardDescription>
        </div>
        {bankInfo?.logo && (
           <div className="bg-white/90 rounded-md p-1.5 w-12 h-12 flex justify-center items-center">
             <Image src={bankInfo.logo} alt={`${bankName} logo`} width={32} height={32} />
           </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn("text-5xl font-bold tracking-tighter", balanceColor)}>
          {formattedBalance || <span className="opacity-50">₹...</span>}
        </div>
      </CardContent>
    </Card>
  );
}

