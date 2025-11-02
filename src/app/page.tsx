"use client";

import { useState } from 'react';
import { Header } from '@/components/clarity-bank/header';
import { BalanceCard } from '@/components/clarity-bank/balance-card';
import { ActionsCard } from '@/components/clarity-bank/actions-card';
import { TransactionHistory } from '@/components/clarity-bank/transaction-history';
import type { Transaction } from '@/lib/types';
import { subDays } from 'date-fns';

const initialTransactions: Transaction[] = [
  { id: '1', date: subDays(new Date(), 1), description: 'Online Store Purchase', amount: 78.50, type: 'withdrawal' },
  { id: '2', date: subDays(new Date(), 2), description: 'Paycheck Deposit', amount: 2200.00, type: 'deposit' },
  { id: '3', date: subDays(new Date(), 2), description: 'Coffee Shop', amount: 5.25, type: 'withdrawal' },
  { id: '4', date: subDays(new Date(), 4), description: 'Gas Station', amount: 45.30, type: 'withdrawal' },
  { id: '5', date: subDays(new Date(), 10), description: 'Restaurant', amount: 112.80, type: 'withdrawal' },
  { id: '6', date: subDays(new Date(), 15), description: 'Refund from Amazon', amount: 32.00, type: 'deposit' },
  { id: '7', date: subDays(new Date(), 32), description: 'Gym Membership', amount: 50.00, type: 'withdrawal' },
];

export default function Home() {
  const [balance, setBalance] = useState(5420.55);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const handleDeposit = (amount: number, description: string) => {
    setBalance((prev) => prev + amount);
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date: new Date(),
      description,
      amount,
      type: 'deposit',
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleWithdrawal = (amount: number, description: string) => {
    setBalance((prev) => prev - amount);
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date: new Date(),
      description,
      amount,
      type: 'withdrawal',
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Header />
        <main className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7 animate-in fade-in-0 zoom-in-95 duration-500">
            <BalanceCard balance={balance} />
          </div>
          <div className="md:col-span-5 animate-in fade-in-0 zoom-in-95 duration-500 delay-100">
            <ActionsCard
              balance={balance}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdrawal}
            />
          </div>
          <div className="col-span-12 animate-in fade-in-0 zoom-in-95 duration-500 delay-200">
            <TransactionHistory transactions={transactions} />
          </div>
        </main>
      </div>
    </div>
  );
}
