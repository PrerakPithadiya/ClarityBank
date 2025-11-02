
'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Header } from '@/components/clarity-bank/header';
import type { BankAccount, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { IndianRupee, ArrowDown, ArrowUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const toDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000);
  }
  const d = new Date(timestamp);
  return d;
};


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const allTransactionsQuery = useMemoFirebase(
    () => user ? collection(firestore, 'users', user.uid, 'transactions') : null,
    [firestore, user]
  );
  // Note: For a real app with many accounts, you'd query transactions per account.
  // For this dashboard, we'll aggregate across all of the user's accounts.
  // We need to set up a collection group query for this to work in Firestore.
  // Since we are creating transactions under bank accounts, we will query them per bank account
  const bankAccountsQuery = useMemoFirebase(
    () => user ? collection(firestore, 'users', user.uid, 'bankAccounts') : null,
    [firestore, user]
  );
  const { data: bankAccounts, isLoading: isLoadingBankAccounts } = useCollection<BankAccount>(bankAccountsQuery);
  
  // This is a simplified approach. A real-world app would use a collectionGroup query.
  // For now, we'll just fetch from the first bank account.
  const transactionsQuery = useMemoFirebase(
    () => (user && bankAccounts && bankAccounts.length > 0) ? collection(firestore, 'users', user.uid, 'bankAccounts', bankAccounts[0].id, 'transactions') : null,
    [firestore, user, bankAccounts]
  );
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);

  const { monthlyData, depositWithdrawalData, totalDeposits, totalWithdrawals, totalTransactions } = useMemo(() => {
    if (!transactions) {
      return { monthlyData: [], depositWithdrawalData: [], totalDeposits: 0, totalWithdrawals: 0, totalTransactions: 0 };
    }
    
    const monthlySummary = transactions.reduce((acc, t) => {
      const date = toDate(t.timestamp);
      if(!date) return acc;

      const month = format(date, 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = { month, deposits: 0, withdrawals: 0 };
      }
      if (t.type === 'deposit') {
        acc[month].deposits += t.amount;
      } else {
        acc[month].withdrawals += t.amount;
      }
      return acc;
    }, {} as Record<string, { month: string; deposits: number; withdrawals: number }>);

    const monthlyData = Object.values(monthlySummary).sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);

    const depositWithdrawalData = [
      { name: 'Deposits', value: totalDeposits },
      { name: 'Withdrawals', value: totalWithdrawals },
    ];
    
    return { monthlyData, depositWithdrawalData, totalDeposits, totalWithdrawals, totalTransactions: transactions.length };
  }, [transactions]);
  
  const COLORS = ['#16a34a', '#dc2626'];

  const isLoading = isUserLoading || isLoadingTransactions || isLoadingBankAccounts;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Header />
        <main className="grid gap-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">An overview of your financial activity.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                <ArrowUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">₹{totalDeposits.toLocaleString('en-IN')}</div>}
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                <ArrowDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">₹{totalWithdrawals.toLocaleString('en-IN')}</div>}
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{totalTransactions}</div>}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
                <CardDescription>Deposits and withdrawals over the last few months.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                      <Tooltip 
                        formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                        cursor={{fill: 'hsl(var(--muted))'}}
                      />
                      <Legend />
                      <Bar dataKey="deposits" fill="#16a34a" name="Deposits" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="withdrawals" fill="#dc2626" name="Withdrawals" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deposit vs. Withdrawal</CardTitle>
                <CardDescription>A breakdown of your total funds movement.</CardDescription>
              </CardHeader>
              <CardContent>
                 {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={depositWithdrawalData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {depositWithdrawalData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}/>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
