
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { BankAccount, Transaction, User } from '@/lib/types';
import { getEarnedBadgesFromActivity } from '@/services/badge-service';
import { BADGES } from '@/lib/badges';
import { Trophy, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/firebase';

interface BadgesCardProps {
  transactions: Transaction[];
  bankAccount: BankAccount | null;
  isLoading: boolean;
}

export function BadgesCard({ transactions, bankAccount, isLoading }: BadgesCardProps) {
  const { user } = useUser();

  const earnedBadges = useMemo(() => {
    if (!bankAccount || !user) {
      return [];
    }
    return getEarnedBadgesFromActivity(transactions, bankAccount, user);
  }, [transactions, bankAccount, user]);

  const earnedBadgeIds = useMemo(() => new Set(earnedBadges.map(b => b.id)), [earnedBadges]);
  const totalBadges = BADGES.length;
  const progressValue = (earnedBadges.length / totalBadges) * 100;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      );
    }
    
    return (
      <TooltipProvider>
        <div className="grid grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'relative flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300',
                      isEarned 
                        ? 'bg-yellow-100 text-yellow-600 animate-in fade-in-0 zoom-in-95 hover:scale-110 dark:bg-yellow-900/50 dark:text-yellow-400' 
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <badge.icon className="h-6 w-6" />
                    {!isEarned && <Lock className="absolute h-3 w-3 bottom-1 right-1" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">{badge.name}</p>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                  {!isEarned && <p className="text-xs text-blue-500 mt-1">Keep going to unlock!</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>My Achievements</CardTitle>
        <CardDescription>Badges you've earned for your financial habits.</CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
      <CardFooter className="flex-col items-start gap-2">
         <p className="text-sm text-muted-foreground">
            You've unlocked {earnedBadges.length} out of {totalBadges} badges.
        </p>
        <Progress value={progressValue} aria-label={`${progressValue}% of badges earned`} />
      </CardFooter>
    </Card>
  );
}
