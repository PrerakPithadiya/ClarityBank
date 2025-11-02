
import type { CategoryGroup, TransactionCategory } from '@/lib/types';
import {
  UtensilsCrossed,
  ShoppingCart,
  Car,
  Receipt,
  Home,
  Zap,
  ShoppingBag,
  PartyPopper,
  Beef,
  HeartPulse,
  Repeat,
  Plane,
  Fuel,
  Wallet,
  Landmark,
  PiggyBank,
  CreditCard,
  HandCoins,
  ShieldCheck,
  Briefcase,
  HeartHandshake,
  LandmarkIcon,
  Recycle,
  Wrench,
  Dog,
  MoreHorizontal,
  Baby,
  Globe,
  GraduationCap,
  Banknote,
} from 'lucide-react';

export const TRANSACTION_CATEGORIES: CategoryGroup[] = [
  {
    label: 'Daily Expenses',
    categories: [
      { value: 'Food', label: 'Food', icon: UtensilsCrossed },
      { value: 'Groceries', label: 'Groceries', icon: ShoppingCart },
      { value: 'Transport', label: 'Transport', icon: Car },
      { value: 'Bills', label: 'Bills', icon: Receipt },
      { value: 'Rent', label: 'Rent', icon: Home },
      { value: 'Utilities', label: 'Utilities', icon: Zap },
    ],
  },
  {
    label: 'Lifestyle',
    categories: [
      { value: 'Shopping', label: 'Shopping', icon: ShoppingBag },
      { value: 'Entertainment', label: 'Entertainment', icon: PartyPopper },
      { value: 'Dining Out', label: 'Dining Out', icon: Beef },
      { value: 'Personal Care', label: 'Personal Care', icon: HeartPulse },
      { value: 'Gifts & Celebrations', label: 'Gifts & Celebrations', icon: HandCoins },
      { value: 'Health & Fitness', label: 'Health & Fitness', icon: HeartPulse },
      { value: 'Subscriptions', label: 'Subscriptions', icon: Repeat },
      { value: 'Travel', label: 'Travel', icon: Plane },
      { value: 'Fuel', label: 'Fuel', icon: Fuel },
    ],
  },
  {
    label: 'Finance',
    categories: [
      { value: 'Salary / Income', label: 'Salary / Income', icon: Wallet },
      { value: 'Investments', label: 'Investments', icon: Landmark },
      { value: 'Loan Payments', label: 'Loan Payments', icon: LandmarkIcon },
      { value: 'Insurance', label: 'Insurance', icon: ShieldCheck },
      { value: 'Business Expenses', label: 'Business Expenses', icon: Briefcase },
      { value: 'Donations / Charity', label: 'Donations / Charity', icon: HeartHandshake },
      { value: 'Taxes', label: 'Taxes', icon: Banknote },
    ],
  },
  {
    label: 'Savings',
    categories: [
      { value: 'Savings', label: 'Savings', icon: PiggyBank },
      { value: 'Emergency Fund', label: 'Emergency Fund', icon: ShieldCheck },
      { value: 'Credit Card Payment', label: 'Credit Card Payment', icon: CreditCard },
      { value: 'EMI / Installments', label: 'EMI / Installments', icon: Repeat },
    ],
  },
  {
    label: 'Miscellaneous',
    categories: [
      { value: 'Kids / Family Expenses', label: 'Kids / Family Expenses', icon: Baby },
      { value: 'Online Services', label: 'Online Services', icon: Globe },
      { value: 'Maintenance / Repairs', label: 'Maintenance / Repairs', icon: Wrench },
      { value: 'Pets', label: 'Pets', icon: Dog },
      { value: 'Other', label: 'Other', icon: MoreHorizontal },
      { value: 'Miscellaneous', label: 'Miscellaneous', icon: Recycle },
    ],
  },
];


export const ALL_CATEGORIES = TRANSACTION_CATEGORIES.flatMap(group => group.categories);

export const getCategoryInfo = (categoryValue: TransactionCategory) => {
    return ALL_CATEGORIES.find(c => c.value === categoryValue);
}
