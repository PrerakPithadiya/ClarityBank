
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { Header } from '@/components/clarity-bank/header';
import type { BankAccount, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { IndianRupee, ArrowDown, ArrowUp, Wallet } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { SmartSummaryCard } from '@/components/clarity-bank/smart-summary-card';
import { BadgesCard } from '@/components/clarity-bank/badges-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';


const toDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000);
  }
  const d = new Date(timestamp);
  return d;
};

const chartColors = {
  dark: {
    deposits: "#4F9DFF",
    withdrawals: "#FF5C5C",
    bills: "#22C55E",
    food: "#FACC15",
    other: "#8B5CF6",
    text: "#E2E8F0",
    background: "#0F172A",
    card: "#1E293B",
    grid: "#334155",
  },
  light: {
    deposits: "#2563EB",
    withdrawals: "#DC2626",
    bills: "#16A34A",
    food: "#CA8A04",
    other: "#7C3AED",
    text: "#0F172A",
    background: "#F8FAFC",
    card: "#FFFFFF",
    grid: "#CBD5E1",
  },
};


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [hasDownloadedReceipt, setHasDownloadedReceipt] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<'30' | '90' | 'all'>('30');
  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    // The theme from useTheme can be 'system'. We resolve it to 'dark' or 'light'.
    // We also handle the case where theme is undefined on initial render.
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setCurrentTheme(systemTheme);
    } else if (theme) {
      setCurrentTheme(theme as 'dark' | 'light');
    }
  }, [theme]);


  useEffect(() => {
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
                limit(500) // Fetch a larger number for better filtering
              ) 
            : null,
    [firestore, user, bankAccounts]
  );
  const { data: allTransactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);

  const transactions = useMemo(() => {
    if (!allTransactions) return [];
    if (filterPeriod === 'all') return allTransactions;

    const days = parseInt(filterPeriod);
    const cutoffDate = subDays(new Date(), days);
    
    return allTransactions.filter(t => {
        const transactionDate = toDate(t.timestamp);
        return transactionDate && transactionDate >= cutoffDate;
    });

  }, [allTransactions, filterPeriod]);


  const { 
    monthlyData, 
    categoryData, 
    totalDeposits, 
    totalWithdrawals, 
    totalTransactions,
    netWorth
  } = useMemo(() => {
    const defaultData = { monthlyData: [], categoryData: [], totalDeposits: 0, totalWithdrawals: 0, totalTransactions: 0, netWorth: 0 };
    if (!transactions) {
      return defaultData;
    }
    
    const netWorth = bankAccounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;

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

    const categorySummary = transactions
        .filter(t => t.type === 'withdrawal')
        .reduce((acc, t) => {
            const category = t.category || 'Other';
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += t.amount;
            return acc;
        }, {} as Record<string, number>);

    const categoryData = Object.entries(categorySummary)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    
    return { netWorth, monthlyData, categoryData, totalDeposits, totalWithdrawals, totalTransactions: transactions.length };
  }, [transactions, bankAccounts]);
  
  const colors = chartColors[currentTheme];
  const pieColors = [
    colors.bills,
    colors.food,
    colors.other,
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const isLoading = isUserLoading || isLoadingTransactions || isLoadingBankAccounts;
  const primaryBankAccount = useMemo(() => (bankAccounts && bankAccounts.length > 0 ? bankAccounts[0] : null), [bankAccounts]);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Header />
        <main className="grid gap-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">An overview of your financial activity.</p>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <SmartSummaryCard transactions={transactions || []} isLoading={isLoading} />
            </div>
            <div>
                <BadgesCard 
                  transactions={allTransactions || []} // Pass all transactions for accurate badge calculation
                  bankAccount={primaryBankAccount}
                  isLoading={isLoading}
                  hasDownloadedReceipt={hasDownloadedReceipt}
                />
            </div>
          </div>
          
          <Tabs value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as any)}>
            <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="30">Last 30 Days</TabsTrigger>
                  <TabsTrigger value="90">Last 90 Days</TabsTrigger>
                  <TabsTrigger value="all">All Time</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value={filterPeriod} className="mt-4">
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">₹{netWorth.toLocaleString('en-IN')}</div>}
                        </CardContent>
                    </Card>
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
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Activity</CardTitle>
                            <CardDescription>Deposits and withdrawals over the selected period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="month" stroke={colors.text} opacity={0.8} fontSize={12} tickLine={false} axisLine={false}/>
                                <YAxis stroke={colors.text} opacity={0.8} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: colors.card,
                                        borderColor: colors.grid,
                                        color: colors.text,
                                    }}
                                    labelStyle={{ color: colors.text }}
                                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                                    cursor={{fill: 'hsl(var(--muted))'}}
                                />
                                <Legend wrapperStyle={{ color: colors.text }} />
                                <Bar dataKey="deposits" fill={colors.deposits} name="Deposits" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="withdrawals" fill={colors.withdrawals} name="Withdrawals" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Spending Categories</CardTitle>
                            <CardDescription>A breakdown of your withdrawals by category.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                                categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={100}
                                            innerRadius={60}
                                            paddingAngle={2}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            stroke={colors.background}
                                        >
                                            {categoryData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                          contentStyle={{
                                            backgroundColor: colors.card,
                                            borderColor: colors.grid,
                                            color: colors.text,
                                          }}
                                          labelStyle={{ color: colors.text }}
                                          formatter={(value: number, name: string) => {
                                            const total = categoryData.reduce((sum, item) => sum + item.value, 0);
                                            const percent = (value / total * 100).toFixed(2);
                                            return [`₹${value.toLocaleString('en-IN')} (${percent}%)`, name];
                                          }}
                                        />
                                        <Legend wrapperStyle={{ color: colors.text }} iconSize={10} />
                                    </PieChart>
                                </ResponsiveContainer>
                                ) : (
                                <div className="flex h-[300px] w-full items-center justify-center">
                                    <p className="text-muted-foreground">No withdrawal data for this period.</p>
                                </div>
                                )
                            )}
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
          </Tabs>

        </main>
      </div>
    </div>
  );
}

    

    