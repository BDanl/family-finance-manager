export type CategoryType = 'income' | 'expense';

export const CATEGORY_TYPES: CategoryType[] = ['income', 'expense'];

export interface Category {
  id: string;
  household_id: string;
  name: string;
  category_type: CategoryType;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  archived_at: string | null;
  created_at: string;
}

export interface CategoryInput {
  name: string;
  category_type: CategoryType;
  icon?: string | null;
  color?: string | null;
}
