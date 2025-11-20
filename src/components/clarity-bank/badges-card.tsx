
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { BankAccount, Transaction, User as AppUser } from '@/lib/types';
import { getEarnedBadgesFromActivity } from '@/services/badge-service';
import { BADGES } from '@/lib/badges';
import { Trophy, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { type User as FirebaseUser } from 'firebase/auth';
import { Button } from '../ui/button';
import Link from 'next/link';

interface BadgesCardProps {
  transactions: Transaction[];
  bankAccount: BankAccount | null;
  user: FirebaseUser | null;
  isLoading: boolean;
  hasDownloadedReceipt?: boolean;
}

export function BadgesCard({ transactions, bankAccount, user, isLoading, hasDownloadedReceipt }: BadgesCardProps) {

  const allEarnedBadges = useMemo(() => {
    if (!bankAccount || !user) {
      return [];
    }
    
    // Map the Firebase Auth user to the app's User type
    const appUser: AppUser = {
      id: user.uid,
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).toISOString() : new Date().toISOString(),
      updatedAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toISOString() : new Date().toISOString(),
    };

    return getEarnedBadgesFromActivity(transactions, bankAccount, appUser, hasDownloadedReceipt);
  }, [transactions, bankAccount, user, hasDownloadedReceipt]);


  const earnedBadgesForDisplay = useMemo(() => {
    return allEarnedBadges.slice(0, 4);
  }, [allEarnedBadges]);

  const earnedBadgeIds = useMemo(() => new Set(allEarnedBadges.map(b => b.id)), [allEarnedBadges]);
  const totalBadges = BADGES.length;
  const progressValue = (allEarnedBadges.length / totalBadges) * 100;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      );
    }
    
    const displayBadges = BADGES.slice(0, 4);

    return (
      <TooltipProvider>
        <div className="grid grid-cols-4 gap-4">
          {displayBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            return (
              <Tooltip key={badge.id} delayDuration={0}>
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>My Achievements</CardTitle>
        <CardDescription>A glimpse of your earned badges.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">{renderContent()}</CardContent>
      <CardFooter className="flex-col items-start gap-2">
         <p className="text-sm text-muted-foreground">
            You've unlocked {allEarnedBadges.length} out of {totalBadges} badges.
        </p>
        <Progress value={progressValue} aria-label={`${progressValue}% of badges earned`} />
         <Button asChild variant="link" className="px-0 mt-2">
          <Link href="/achievements">
            View All Achievements <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
