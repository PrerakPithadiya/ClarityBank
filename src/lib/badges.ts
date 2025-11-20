
'use client';

import { Award, TrendingUp, Gem, ShieldCheck, HandCoins, CalendarCheck, Clock, Milestone, CalendarPlus, Search } from 'lucide-react';
import type { BadgeDefinition, Transaction, BankAccount, User } from './types';
import { subDays, differenceInDays, isWithinInterval, getMonth, getYear } from 'date-fns';

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
    id: 'gold-saver',
    name: 'Gold Saver',
    description: 'Reach a balance of ₹10,000.',
    icon: Gem,
    check: (transactions: Transaction[], account: BankAccount) => {
      return account.balance >= 10000;
    },
  },
  {
    id: 'milestone-100',
    name: 'Milestone 100',
    description: 'Make 100 total transactions.',
    icon: Milestone,
    check: (transactions: Transaction[]) => {
      return transactions.length >= 100;
    },
  },
  {
    id: 'zero-debt',
    name: 'Zero Debt',
    description: 'Have no withdrawals for 30 consecutive days.',
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
    id: 'consistency-champ',
    name: 'Consistency Champ',
    description: 'Make 5 deposits on 5 consecutive days.',
    icon: TrendingUp,
    check: (transactions: Transaction[]) => {
      const deposits = transactions
        .filter(t => t.type === 'deposit')
        .map(t => toDate(t.timestamp))
        .filter((d): d is Date => d !== null)
        .sort((a, b) => a.getTime() - b.getTime());

      if (deposits.length < 5) return false;

      let consecutiveDays = 1;
      let uniqueDays = new Set([deposits[0].toDateString()]);
      
      for (let i = 1; i < deposits.length; i++) {
        if(uniqueDays.has(deposits[i].toDateString())) continue;

        const dayDiff = differenceInDays(deposits[i], deposits[i - 1]);
        if (dayDiff === 1) {
          consecutiveDays++;
          uniqueDays.add(deposits[i].toDateString());
        } else if (dayDiff > 1) {
          consecutiveDays = 1; // Reset
          uniqueDays = new Set([deposits[i].toDateString()]);
        }
        if (consecutiveDays >= 5) {
          return true;
        }
      }
      return false;
    },
  },
  {
    id: 'smart-spender',
    name: 'Smart Spender',
    description: 'Make 10+ transactions categorized as "Bills" or "Groceries".',
    icon: HandCoins,
    check: (transactions: Transaction[]) => {
      const essentialSpend = transactions.filter(t => t.category === 'Bills' || t.category === 'Groceries');
      return essentialSpend.length >= 10;
    },
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Make your first deposit within 24 hours of signing up.',
    icon: CalendarCheck,
    check: (transactions: Transaction[], account: BankAccount, user?: User | null) => {
        const firstDeposit = transactions.find(t => t.type === 'deposit');
        const userCreationDate = user ? toDate(user.createdAt) : null;
        const firstDepositDate = firstDeposit ? toDate(firstDeposit.timestamp) : null;

        if (!userCreationDate || !firstDepositDate) return false;
        
        const oneDayAfterCreation = new Date(userCreationDate.getTime() + (24 * 60 * 60 * 1000));
        return isWithinInterval(firstDepositDate, { start: userCreationDate, end: oneDayAfterCreation });
    }
  },
   {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Make a transaction between 12 AM and 5 AM.',
    icon: Clock,
    check: (transactions: Transaction[]) => {
      return transactions.some(t => {
        const transDate = toDate(t.timestamp);
        if (!transDate) return false;
        const hour = transDate.getHours();
        return hour >= 0 && hour < 5;
      });
    }
  },
  {
    id: 'active-user',
    name: 'Active User',
    description: 'Awarded for making your first 10 transactions.',
    icon: Award,
    check: (transactions: Transaction[]) => {
      return transactions.length >= 10;
    },
  },
  {
    id: 'savings-streak',
    name: 'Savings Streak',
    description: 'Save consistently for 3 consecutive months.',
    icon: CalendarPlus,
    check: (transactions: Transaction[]) => {
        const deposits = transactions.filter(t => t.type === 'deposit');
        if (deposits.length === 0) return false;
        
        const monthsWithDeposits = new Set();
        deposits.forEach(d => {
            const date = toDate(d.timestamp);
            if(date) {
                monthsWithDeposits.add(`${getYear(date)}-${getMonth(date)}`);
            }
        });

        const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
        const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);

        return monthsWithDeposits.size >= 3 && totalDeposits > totalWithdrawals;
    }
  },
  {
    id: 'financial-explorer',
    name: 'Financial Explorer',
    description: 'Explore the features of your dashboard by downloading a receipt.',
    icon: Search,
    check: (transactions: Transaction[], account: BankAccount, user: User | null, hasDownloadedReceipt: boolean) => {
        return hasDownloadedReceipt;
    }
  }
];
