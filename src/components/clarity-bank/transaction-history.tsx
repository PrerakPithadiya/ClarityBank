
"use client";

import React, { useMemo, useState } from 'react';
import { format, subDays, fromUnixTime, isValid } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { getCategoryInfo } from '@/lib/transaction-categories';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import { ClarityBankLogo } from './clarity-bank-logo';


type TransactionHistoryProps = {
  transactions: Transaction[];
  isLoading: boolean;
};

const toDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp && typeof timestamp.seconds === 'number') {
    return fromUnixTime(timestamp.seconds);
  }
  const d = new Date(timestamp);
  return isValid(d) ? d : null;
};

const handleDownloadReceipt = (transaction: Transaction) => {
  const doc = new jsPDF();
  const date = toDate(transaction.timestamp);
  const formattedDate = date ? format(date, 'MMM d, yyyy, h:mm a') : 'N/A';
  const categoryLabel = getCategoryInfo(transaction.category)?.label || transaction.category || 'N/A';

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ClarityBank', 20, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Transaction Receipt', 20, 40);

  // Details
  doc.setFontSize(10);
  doc.text(`Transaction ID: ${transaction.id || 'N/A'}`, 20, 60);
  doc.text(`Date: ${formattedDate}`, 20, 67);
  doc.text(`Bank Account ID: ${transaction.bankAccountId || 'N/A'}`, 20, 74);
  
  // Amount
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount:', 20, 90);
  doc.text(`${transaction.type === 'deposit' ? '+' : '-'} ₹${transaction.amount?.toFixed(2) || '0.00'}`, 60, 90);
  
  // Other details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Description:', 20, 100);
  doc.text(transaction.description || 'N/A', 60, 100);
  
  doc.text('Category:', 20, 107);
  doc.text(categoryLabel, 60, 107);
  
  doc.text('Type:', 20, 114);
  doc.text(transaction.type || 'N/A', 60, 114);

  // Footer
  doc.setLineCap(2);
  doc.line(20, doc.internal.pageSize.height - 40, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 40);
  doc.setFontSize(8);
  doc.text('Thank you for banking with ClarityBank.', 20, doc.internal.pageSize.height - 30);


  doc.save(`receipt-${transaction.id}.pdf`);
};


export function TransactionHistory({ transactions, isLoading }: TransactionHistoryProps) {
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | '7' | '30' | '90'>('all');
  
  const filteredTransactions = useMemo(() => {
    let items = transactions
      .map(t => ({...t, date: toDate(t.timestamp)}))
      .filter(t => t.date !== null);

    if (filterType !== 'all') {
      items = items.filter(t => t.type === filterType);
    }
    
    if (filterPeriod !== 'all') {
      const days = parseInt(filterPeriod, 10);
      const cutoffDate = subDays(new Date(), days);
      items = items.filter(t => t.date! >= cutoffDate);
    }
    
    return items.sort((a, b) => b.date!.getTime() - a.date!.getTime());
  }, [transactions, filterType, filterPeriod]);

  const renderCategory = (categoryValue: Transaction['category']) => {
    const categoryInfo = getCategoryInfo(categoryValue);
    if (!categoryInfo) {
      return <Badge variant="outline">{categoryValue}</Badge>;
    }
    const Icon = categoryInfo.icon;
    return (
      <Badge variant="outline" className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" />
        {categoryInfo.label}
      </Badge>
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Review your recent account activity.</CardDescription>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px] text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell className="hidden sm:table-cell text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="transition-colors animate-in fade-in-0">
                    <TableCell>
                      <div className="font-medium">{transaction.description}</div>
                      {transaction.date && <div className="text-sm text-muted-foreground sm:hidden">{format(transaction.date, 'MMM d, yyyy, h:mm a')}</div>}
                    </TableCell>
                     <TableCell className="text-center hidden sm:table-cell">
                      {renderCategory(transaction.category)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'} className={cn(
                        'w-fit',
                         transaction.type === 'deposit' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                      )}>
                        {transaction.type === 'deposit' ? 
                          <ArrowUpCircle className="mr-1 h-4 w-4" /> : 
                          <ArrowDownCircle className="mr-1 h-4 w-4" />
                        }
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{transaction.date && format(transaction.date, 'MMM d, yyyy, h:mm a')}</TableCell>
                    <TableCell className={cn(
                      'text-right font-medium',
                      transaction.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    )}>
                      {transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadReceipt(transaction)}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download Receipt</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No transactions found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
