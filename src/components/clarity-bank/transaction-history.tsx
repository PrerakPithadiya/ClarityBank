
"use client";

import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { format, subDays, fromUnixTime, isValid } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle, FileImage, EllipsisVertical } from 'lucide-react';
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
import { ClarityBankLogo } from './clarity-bank-logo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import html2canvas from 'html2canvas';

type TransactionHistoryProps = {
  transactions: Transaction[];
  isLoading: boolean;
  onReceiptDownload?: () => void;
};

const toDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp && typeof timestamp.seconds === 'number') {
    return fromUnixTime(timestamp.seconds);
  }
  const d = new Date(timestamp);
  return isValid(d) ? d : null;
};

const PrintableReceipt = React.forwardRef<HTMLDivElement, { transaction: Transaction }>(({ transaction }, ref) => {
  const date = toDate(transaction.timestamp);
  const formattedDate = date ? format(date, 'MMM d, yyyy, h:mm a') : 'N/A';
  const categoryLabel = getCategoryInfo(transaction.category)?.label || transaction.category || 'N/A';

  return (
    <div ref={ref} className="bg-white text-black p-8 w-[400px] font-sans">
        <div className="flex items-center gap-3 mb-6">
            <ClarityBankLogo className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">ClarityBank</h1>
        </div>
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Transaction Receipt</h2>
        <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Transaction ID:</span> <span>{transaction.id || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span>{formattedDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Bank Account ID:</span> <span>{transaction.bankAccountId || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Description:</span> <span>{transaction.description || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Category:</span> <span>{categoryLabel}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span>{transaction.type || 'N/A'}</span></div>
        </div>
        <div className="mt-6 pt-4 border-t-2 border-dashed">
            <div className="flex justify-between items-center font-bold text-lg">
                <span>Amount:</span>
                <span>{transaction.type === 'deposit' ? '+' : '-'} INR {transaction.amount?.toFixed(2) || '0.00'}</span>
            </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-8">
            <p>Thank you for banking with ClarityBank.</p>
        </div>
    </div>
  );
});
PrintableReceipt.displayName = 'PrintableReceipt';


export function TransactionHistory({ transactions, isLoading, onReceiptDownload }: TransactionHistoryProps) {
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | '7' | '30' | '90'>('all');
  const [targetTransaction, setTargetTransaction] = useState<Transaction | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = useCallback(async (format: 'png' | 'jpeg') => {
    if (!receiptRef.current) return;
    
    if(onReceiptDownload) {
      onReceiptDownload();
    }

    const canvas = await html2canvas(receiptRef.current, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
    });
    const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `receipt-${targetTransaction?.id}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTargetTransaction(null); // Clean up
  }, [targetTransaction, onReceiptDownload]);

  useEffect(() => {
    if (targetTransaction) {
        // This is a bit of a hack. We need to wait for the state to update and the hidden component to render.
        // A more robust solution might use a callback from the hidden component.
        setTimeout(() => {
            // This logic is now triggered by the DropdownMenuItem's onClick directly.
            // We keep the effect in case we need to trigger it programmatically.
        }, 100);
    }
  }, [targetTransaction, handleDownloadImage]);

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
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <EllipsisVertical className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => { setTargetTransaction(transaction); setTimeout(() => handleDownloadImage('png'), 0); }}>
                              <FileImage className="mr-2 h-4 w-4" />
                              Download PNG
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => { setTargetTransaction(transaction); setTimeout(() => handleDownloadImage('jpeg'), 0); }}>
                              <FileImage className="mr-2 h-4 w-4" />
                              Download JPG
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
       {/* Hidden component for rendering the receipt for image capture */}
       {targetTransaction && (
          <div style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}>
              <PrintableReceipt transaction={targetTransaction} ref={receiptRef} />
          </div>
        )}
    </Card>
  );
}
