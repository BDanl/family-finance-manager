export type AccountType = 'cash' | 'checking' | 'savings' | 'credit' | 'other';

export const ACCOUNT_TYPES: AccountType[] = ['cash', 'checking', 'savings', 'credit', 'other'];

export interface Account {
  id: string;
  household_id: string;
  name: string;
  account_type: AccountType;
  description: string | null;
  icon: string | null;
  color: string | null;
  currency: string;
  opening_balance: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountInput {
  name: string;
  account_type: AccountType;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  currency?: string;
  opening_balance?: number | string;
}
