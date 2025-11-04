

import type { LucideIcon } from 'lucide-react';

export type TransactionCategory = 
  // Daily Expenses
  "Food" | 
  "Groceries" | 
  "Transport" | 
  "Bills" |
  "Rent" |
  "Utilities" |
  // Lifestyle
  "Shopping" | 
  "Entertainment" | 
  "Dining Out" |
  "Personal Care" |
  "Gifts & Celebrations" |
  "Health & Fitness" |
  "Subscriptions" |
  "Travel" |
  "Fuel" |
  // Finance
  "Salary / Income" |
  "Investments" |
  "Loan Payments" |
  "Insurance" |
  "Business Expenses" |
  "Donations / Charity" |
  "Taxes" |
  // Savings
  "Savings" |
  "Emergency Fund" |
  "Credit Card Payment" |
  "EMI / Installments" |
  // Miscellaneous
  "Kids / Family Expenses" |
  "Online Services" |
  "Maintenance / Repairs" |
  "Pets" |
  "Other" |
  "Miscellaneous";


export interface Transaction {
  id: string;
  bankAccountId: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  category: TransactionCategory;
  timestamp: any; 
}

export interface BankAccount {
    id: string;
    accountNumber: string;
    balance: number;
    userId: string;
    bankId: string;
    bankName: string;
    createdAt: any;
    updatedAt: any;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: any;
    updatedAt: any;
}

export interface CategoryInfo {
  value: TransactionCategory;
  label: string;
  icon: LucideIcon;
}

export interface CategoryGroup {
  label: string;
  categories: CategoryInfo[];
}

export interface Bank {
  id: string;
  name: string;
  logo: string;
  themeColor: string;
}
