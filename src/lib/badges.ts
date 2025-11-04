
'use client';

import { Award, TrendingUp, Gem, ShieldCheck } from 'lucide-react';
import type { BadgeDefinition, Transaction, BankAccount } from './types';
import { subDays, differenceInDays } from 'date-fns';

const toDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000);
  }
  const d = new Date(timestamp);
  return d;
};

export const BADGES: BadgeDefinition[] = [
  {
    id: 'smart-saver',
    name: 'Smart Saver',
    description: 'Awarded for having no withdrawals in the last 30 days.',
    icon: ShieldCheck,
    check: (transactions: Transaction[]) => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const recentWithdrawals = transactions.filter(t => {
        const transactionDate = toDate(t.timestamp);
        return t.type === 'withdrawal' && transactionDate && transactionDate > thirtyDaysAgo;
      });
      return recentWithdrawals.length === 0 && transactions.length > 0;
    },
  },
  {
    id: 'active-user-10',
    name: 'Active User',
    description: 'Awarded for making your first 10 transactions.',
    icon: Award,
    check: (transactions: Transaction[]) => {
      return transactions.length >= 10;
    },
  },
  {
    id: 'consistency-king-5',
    name: 'Consistency King',
    description: 'Awarded for 5 consecutive days of deposits.',
    icon: TrendingUp,
    check: (transactions: Transaction[]) => {
      const deposits = transactions
        .filter(t => t.type === 'deposit')
        .map(t => toDate(t.timestamp))
        .filter((d): d is Date => d !== null)
        .sort((a, b) => a.getTime() - b.getTime());

      if (deposits.length < 5) return false;

      let consecutiveDays = 1;
      for (let i = 1; i < deposits.length; i++) {
        const dayDiff = differenceInDays(deposits[i], deposits[i - 1]);
        if (dayDiff === 1) {
          consecutiveDays++;
        } else if (dayDiff > 1) {
          consecutiveDays = 1; // Reset
        }
        if (consecutiveDays >= 5) {
          return true;
        }
      }
      return false;
    },
  },
  {
    id: 'big-saver-10k',
    name: 'Big Saver',
    description: 'Awarded for reaching a balance of ₹10,000.',
    icon: Gem,
    check: (transactions: Transaction[], account: BankAccount) => {
      return account.balance >= 10000;
    },
  },
];
