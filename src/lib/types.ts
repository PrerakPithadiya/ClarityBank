export interface Transaction {
  id: string;
  bankAccountId: string;
  transactionType: 'deposit' | 'withdrawal';
  amount: number;
  description?: string;
  transactionDate: string; // Changed to string to match Firestore server timestamp
}

export interface BankAccount {
    id: string;
    accountNumber: string;
    balance: number;
    userId: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}
