
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { BankAccount, Transaction, User } from '@/lib/types';
import { getEarnedBadgesFromActivity } from '@/services/badge-service';
import { BADGES } from '@/lib/badges';
import { Header } from '@/components/clarity-bank/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Lock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AchievementsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useMemo(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const bankAccountsQuery = useMemoFirebase(
    () => user ? collection(firestore, 'users', user.uid, 'bankAccounts') : null,
    [firestore, user]
  );
  const { data: bankAccounts, isLoading: isLoadingBankAccounts } = useCollection<BankAccount>(bankAccountsQuery);
  
  const transactionsQuery = useMemoFirebase(
    () => (user && bankAccounts && bankAccounts.length > 0) 
            ? query(
                collection(firestore, 'users', user.uid, 'bankAccounts', bankAccounts[0].id, 'transactions'),
                orderBy('timestamp', 'desc'),
                limit(500) // Fetch more transactions for accurate badge calculation
              ) 
            : null,
    [firestore, user, bankAccounts]
  );
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);

  const primaryBankAccount = useMemo(() => (bankAccounts && bankAccounts.length > 0 ? bankAccounts[0] : null), [bankAccounts]);
  
  const { earnedBadges, earnedBadgeIds } = useMemo(() => {
    if (!primaryBankAccount || !user || !transactions) {
      return { earnedBadges: [], earnedBadgeIds: new Set() };
    }

    // Map the Firebase Auth user to the app's User type
    const appUser: User = {
      id: user.uid,
      email: user.email || '',
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ')[1] || '',
      createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).toISOString() : new Date().toISOString(),
      updatedAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toISOString() : new Date().toISOString(),
    };

    const earned = getEarnedBadgesFromActivity(transactions, primaryBankAccount, appUser);
    const earnedIds = new Set(earned.map(b => b.id));
    return { earnedBadges: earned, earnedBadgeIds: earnedIds };
  }, [transactions, primaryBankAccount, user]);

  const isLoading = isUserLoading || isLoadingBankAccounts || isLoadingTransactions;
  const totalBadges = BADGES.length;
  const progressValue = totalBadges > 0 ? (earnedBadges.length / totalBadges) * 100 : 0;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Header />
        <main className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Trophy className="h-8 w-8 text-yellow-500" />
                My Achievements
              </CardTitle>
              <CardDescription>Track your financial milestones and unlock new badges.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-1/2" />
              ) : (
                 <p className="text-lg text-muted-foreground">
                    You've unlocked <span className="font-bold text-primary">{earnedBadges.length}</span> out of <span className="font-bold">{totalBadges}</span> badges. Keep up the great work!
                </p>
              )}
            </CardContent>
            <CardFooter>
                 {isLoading ? (
                    <Skeleton className="h-4 w-full" />
                 ) : (
                    <Progress value={progressValue} aria-label={`${progressValue.toFixed(0)}% of badges earned`} />
                 )}
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="items-center text-center">
                     <Skeleton className="h-16 w-16 rounded-full" />
                  </CardHeader>
                  <CardContent className="text-center">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full mx-auto mt-2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <TooltipProvider>
                {BADGES.map((badge) => {
                  const isEarned = earnedBadgeIds.has(badge.id);
                  return (
                    <Tooltip key={badge.id}>
                        <Card 
                          key={badge.id} 
                          className={cn(
                            'flex flex-col items-center justify-start text-center p-4 transition-all duration-300',
                            isEarned 
                              ? 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20' 
                              : 'bg-muted/50'
                          )}
                        >
                          <div
                            className={cn(
                              'relative flex h-20 w-20 items-center justify-center rounded-full mb-4 transition-all duration-300',
                              isEarned 
                                ? 'bg-yellow-100 text-yellow-600 animate-in fade-in-0 zoom-in-95 dark:bg-yellow-900/50 dark:text-yellow-400' 
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            <badge.icon className="h-10 w-10" />
                            {!isEarned && <Lock className="absolute h-4 w-4 bottom-1 right-1 text-foreground/50" />}
                          </div>
                            <CardTitle className="text-lg">{badge.name}</CardTitle>
                            <CardDescription className="mt-1 flex-grow">
                              {badge.description}
                            </CardDescription>
                            {isEarned && (
                                <div className="mt-4 w-full text-xs text-green-600 dark:text-green-400 font-semibold border-t pt-2 flex items-center justify-center gap-2">
                                    <Trophy className="h-4 w-4" />
                                    <span>Unlocked!</span>
                                </div>
                            )}
                        </Card>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
