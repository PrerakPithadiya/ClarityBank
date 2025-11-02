
export type TransactionCategory = "Food" | "Shopping" | "Transport" | "Bills" | "Entertainment" | "Other";

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
