"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc, serverTimestamp, runTransaction, Transaction as FirestoreTransaction } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Header } from '@/components/clarity-bank/header';
import { BalanceCard } from '@/components/clarity-bank/balance-card';
import { ActionsCard } from '@/components/clarity-bank/actions-card';
import { TransactionHistory } from '@/components/clarity-bank/transaction-history';
import type { BankAccount, Transaction } from '@/lib/types';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import banksData from '@/lib/banks.json';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

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
      const currentAccount = bankAccounts.find(acc => acc.id === bankAccount?.id) || bankAccounts[0];
      setBankAccount(currentAccount);
    } else if (bankAccounts && bankAccounts.length === 0) {
      setBankAccount(null);
    }
  }, [bankAccounts, bankAccount?.id]);

  const transactionsQuery = useMemoFirebase(
    () => (user && bankAccount) ? collection(firestore, 'users', user.uid, 'bankAccounts', bankAccount.id, 'transactions') : null,
    [firestore, user, bankAccount]
  );
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);

  const handleDeposit = async (amount: number, description: string) => {
    if (!user || !bankAccount) return;
  
    const bankAccountRef = doc(firestore, 'users', user.uid, 'bankAccounts', bankAccount.id);
    const transactionCollectionRef = collection(firestore, 'users', user.uid, 'bankAccounts', bankAccount.id, 'transactions');
  
    try {
      await runTransaction(firestore, async (transaction: FirestoreTransaction) => {
        const accountDoc = await transaction.get(bankAccountRef);
        if (!accountDoc.exists()) {
          throw "Bank account does not exist!";
        }
  
        const newBalance = accountDoc.data().balance + amount;
        transaction.update(bankAccountRef, { balance: newBalance });
  
        const newTransactionRef = doc(transactionCollectionRef);
        transaction.set(newTransactionRef, {
          id: newTransactionRef.id,
          bankAccountId: bankAccount.id,
          transactionType: 'deposit',
          amount,
          description,
          transactionDate: serverTimestamp(),
        });
      });
      toast({
        title: "Deposit Successful",
        description: `You have deposited ₹${amount.toFixed(2)}.`,
      });
    } catch (error) {
      console.error("Deposit failed: ", error);
      toast({
        title: "Deposit Failed",
        description: "An error occurred during the deposit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWithdrawal = async (amount: number, description: string) => {
    if (!user || !bankAccount) return;
  
    const bankAccountRef = doc(firestore, 'users', user.uid, 'bankAccounts', bankAccount.id);
    const transactionCollectionRef = collection(firestore, 'users', user.uid, 'bankAccounts', bankAccount.id, 'transactions');
  
    try {
      await runTransaction(firestore, async (transaction: FirestoreTransaction) => {
        const accountDoc = await transaction.get(bankAccountRef);
        if (!accountDoc.exists()) {
          throw "Bank account does not exist!";
        }
  
        const currentBalance = accountDoc.data().balance;
        if (currentBalance < amount) {
          throw "Insufficient funds.";
        }
  
        const newBalance = currentBalance - amount;
        transaction.update(bankAccountRef, { balance: newBalance });
  
        const newTransactionRef = doc(transactionCollectionRef);
        transaction.set(newTransactionRef, {
          id: newTransactionRef.id,
          bankAccountId: bankAccount.id,
          transactionType: 'withdrawal',
          amount,
          description,
          transactionDate: serverTimestamp(),
        });
      });
      toast({
        title: "Withdrawal Successful",
        description: `You have withdrawn ₹${amount.toFixed(2)}.`,
      });
    } catch (error) {
      console.error("Withdrawal failed: ", error);
      toast({
        title: "Withdrawal Failed",
        description: typeof error === 'string' ? error : "An error occurred during withdrawal.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAccount = async (accountNumber: string, bankId: string) => {
    if (!user) return;
    const selectedBank = banksData.flatMap(group => group.banks).find(b => b.id === bankId);
    if (!selectedBank) return;

    const newAccount: Omit<BankAccount, 'id'> = {
      accountNumber,
      balance: 1000, // Start with some initial balance for demo
      userId: user.uid,
      bankId: selectedBank.id,
      bankName: selectedBank.name,
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
            <BalanceCard balance={bankAccount.balance} bankName={bankAccount.bankName} />
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

function CreateAccountFlow({ onCreateAccount }: { onCreateAccount: (accountNumber: string, bankId: string) => void }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [bankId, setBankId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankId) {
        alert('Please select a bank.');
        return;
    }
    onCreateAccount(accountNumber, bankId);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Your Bank Account</h1>
          <p className="text-muted-foreground">
            Select your bank and enter an account number to get started.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label htmlFor="bank" className="mb-2 block text-sm font-medium">
                Bank
              </label>
              <Select onValueChange={setBankId} value={bankId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banksData.map((group) => (
                    <SelectGroup key={group.category}>
                      <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{group.category}</p>
                      {group.banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
          </div>
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
