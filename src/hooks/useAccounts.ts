import { useCallback, useEffect, useState } from 'react';
import { accountService } from '../services/accountService';
import type { Account, AccountInput } from '../types/account';

export function useAccounts(householdId: string | undefined) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!householdId) {
      setAccounts([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      // Management page shows archived accounts too (with badges) so they can be restored
      const data = await accountService.listAccounts(householdId, true);
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  const createAccount = async (input: AccountInput) => {
    if (!householdId) throw new Error('No household selected');
    await accountService.createAccount(householdId, input);
    await reload();
  };

  const updateAccount = async (
    accountId: string,
    updates: Parameters<typeof accountService.updateAccount>[1]
  ) => {
    await accountService.updateAccount(accountId, updates);
    await reload();
  };

  const setAccountArchived = async (accountId: string, archived: boolean) => {
    await accountService.setAccountArchived(accountId, archived);
    await reload();
  };

  return { accounts, loading, error, createAccount, updateAccount, setAccountArchived, reload };
}
