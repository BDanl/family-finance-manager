import { supabase } from '../lib/supabase';
import type { Account, AccountInput, AccountType } from '../types/account';

const ACCOUNT_FIELDS =
  'id, household_id, name, account_type, description, icon, color, currency, opening_balance, archived_at, created_at, updated_at';

export const accountService = {
  /**
   * List accounts for a household. Archived accounts are excluded unless
   * includeArchived is true.
   */
  async listAccounts(householdId: string, includeArchived = false): Promise<Account[]> {
    let query = supabase
      .from('accounts')
      .select(ACCOUNT_FIELDS)
      .eq('household_id', householdId)
      .order('name', { ascending: true });

    if (!includeArchived) {
      query = query.is('archived_at', null);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data || []) as Account[];
  },

  /**
   * Create an account. RLS enforces owner/admin role and household membership.
   */
  async createAccount(householdId: string, input: AccountInput): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        household_id: householdId,
        name: input.name,
        account_type: input.account_type as AccountType,
        description: input.description || null,
        icon: input.icon || null,
        color: input.color || null,
        currency: input.currency || 'COP',
        opening_balance: input.opening_balance ?? 0,
      })
      .select(ACCOUNT_FIELDS)
      .single();

    if (error) {
      throw error;
    }

    return data as Account;
  },

  /**
   * Update account details. household_id is intentionally not updatable
   * through this service (tenant boundary).
   */
  async updateAccount(
    accountId: string,
    updates: Partial<
      Pick<Account, 'name' | 'account_type' | 'description' | 'icon' | 'color' | 'currency'> & {
        opening_balance?: number | string;
      }
    >
  ): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', accountId);

    if (error) {
      throw error;
    }
  },

  /**
   * Archive or restore an account. Archiving preserves historical records.
   */
  async setAccountArchived(accountId: string, archived: boolean): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({
        archived_at: archived ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId);

    if (error) {
      throw error;
    }
  },
};
