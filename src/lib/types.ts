export interface Transaction {
  id: string;
  bankAccountId: string;
  transactionType: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  transactionDate: any; 
}

export interface BankAccount {
    id: string;
    accountNumber: string;
    balance: number;
    userId: string;
    bankId: string;
    bankName: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}
