
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { BankAccount, Transaction, EarnedBadge } from '@/lib/types';
import { getEarnedBadgesFromActivity } from '@/services/badge-service';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgesCardProps {
  transactions: Transaction[];
  bankAccount: BankAccount | null;
  isLoading: boolean;
}

export function BadgesCard({ transactions, bankAccount, isLoading }: BadgesCardProps) {
  const earnedBadges = useMemo(() => {
    if (!bankAccount || transactions.length === 0) {
      return [];
    }
    // This function checks the conditions on the client-side for immediate UI feedback.
    return getEarnedBadgesFromActivity(transactions, bankAccount);
  }, [transactions, bankAccount]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      );
    }

    if (earnedBadges.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-4">
          <Trophy className="h-8 w-8 mb-2" />
          <p className="text-sm font-medium">No Badges Yet</p>
          <p className="text-xs">Keep using your account to earn achievements!</p>
        </div>
      );
    }

    return (
      <TooltipProvider>
        <div className="flex items-center gap-4">
          {earnedBadges.map((badge) => (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 transition-transform hover:scale-110 dark:bg-yellow-900/50 dark:text-yellow-400',
                    'animate-in fade-in-0 zoom-in-95'
                  )}
                >
                  <badge.icon className="h-6 w-6" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">{badge.name}</p>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>My Achievements</CardTitle>
        <CardDescription>Badges you've earned.</CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
