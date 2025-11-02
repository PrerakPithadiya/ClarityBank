export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
}
