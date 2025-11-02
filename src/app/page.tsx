"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Header } from '@/components/clarity-bank/header';
import { BalanceCard } from '@/components/clarity-bank/balance-card';
import { ActionsCard } from '@/components/clarity-bank/actions-card';
import { TransactionHistory } from '@/components/clarity-bank/transaction-history';
import type { BankAccount, Transaction } from '@/lib/types';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);

  const bankAccountsQuery = useMemoFirebase(
    () => user ? collection(firestore, 'users', user.uid, 'bankAccounts') : null,
    [firestore, user]
  );
  const { data: bankAccounts, isLoading: isLoadingBankAccounts } = useCollection<BankAccount>(bankAccountsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (bankAccounts && bankAccounts.length > 0) {
      setBankAccount(bankAccounts[0]);
    } else if (bankAccounts && bankAccounts.length === 0) {
      setBankAccount(null);
    }
  }, [bankAccounts]);

  const transactionsQuery = useMemoFirebase(
    () => bankAccount ? collection(firestore, 'users', user.uid, 'bankAccounts', bankAccount.id, 'transactions') : null,
    [firestore, user, bankAccount]
  );
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);

  const handleDeposit = (amount: number, description: string) => {
    if (!user || !bankAccount) return;

    const batch = writeBatch(firestore);
    const bankAccountRef = doc(firestore, 'users', user.uid, 'bankAccounts', bankAccount.id);
    batch.update(bankAccountRef, { balance: bankAccount.balance + amount });

    const transactionRef = doc(collection(firestore, 'users', user.uid, 'bankAccounts', bankAccount.id, 'transactions'));
    batch.set(transactionRef, {
      id: transactionRef.id,
      bankAccountId: bankAccount.id,
      transactionType: 'deposit',
      amount,
      description,
      transactionDate: serverTimestamp(),
    });

    batch.commit();
  };

  const handleWithdrawal = (amount: number, description: string) => {
    if (!user || !bankAccount) return;

    const batch = writeBatch(firestore);
    const bankAccountRef = doc(firestore, 'users', user.uid, 'bankAccounts', bankAccount.id);
    batch.update(bankAccountRef, { balance: bankAccount.balance - amount });

    const transactionRef = doc(collection(firestore, 'users', user.uid, 'bankAccounts', bankAccount.id, 'transactions'));
    batch.set(transactionRef, {
      id: transactionRef.id,
      bankAccountId: bankAccount.id,
      transactionType: 'withdrawal',
      amount,
      description,
      transactionDate: serverTimestamp(),
    });
    
    batch.commit();
  };

  const handleCreateAccount = async (accountNumber: string) => {
    if (!user) return;
    const newAccount: Omit<BankAccount, 'id'> = {
      accountNumber,
      balance: 0,
      userId: user.uid,
    };
    await addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'bankAccounts'), newAccount);
  };
  
  if (isUserLoading || isLoadingBankAccounts) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Header />
          <main className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <Skeleton className="h-[158px] w-full" />
            </div>
            <div className="md:col-span-5">
              <Skeleton className="h-[158px] w-full" />
            </div>
            <div className="col-span-12">
              <Skeleton className="h-[530px] w-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (!bankAccount) {
    return <CreateAccountFlow onCreateAccount={handleCreateAccount} />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Header />
        <main className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7 animate-in fade-in-0 zoom-in-95 duration-500">
            <BalanceCard balance={bankAccount.balance} />
          </div>
          <div className="md:col-span-5 animate-in fade-in-0 zoom-in-95 duration-500 delay-100">
            <ActionsCard
              balance={bankAccount.balance}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdrawal}
            />
          </div>
          <div className="col-span-12 animate-in fade-in-0 zoom-in-95 duration-500 delay-200">
            <TransactionHistory transactions={transactions || []} isLoading={isLoadingTransactions} />
          </div>
        </main>
      </div>
    </div>
  );
}

function CreateAccountFlow({ onCreateAccount }: { onCreateAccount: (accountNumber: string) => void }) {
  const [accountNumber, setAccountNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAccount(accountNumber);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Your Bank Account</h1>
          <p className="text-muted-foreground">
            Enter an account number to get started.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accountNumber" className="mb-2 block text-sm font-medium">
              Account Number
            </label>
            <input
              id="accountNumber"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g., 123456789"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
