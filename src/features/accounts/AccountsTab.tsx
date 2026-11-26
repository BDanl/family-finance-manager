import { useState } from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { accountSchema } from '../../validation/account';
import { formatCurrency } from '../../lib/format';
import { ACCOUNT_TYPES } from '../../types/account';
import type { Account, AccountInput } from '../../types/account';

const inputClass =
  'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700';

interface AccountsTabProps {
  householdId: string;
  canManage: boolean;
  defaultCurrency: string;
}

interface FormState {
  name: string;
  account_type: string;
  currency: string;
  opening_balance: string;
  description: string;
  icon: string;
  color: string;
}

const emptyForm = (currency: string): FormState => ({
  name: '',
  account_type: 'checking',
  currency,
  opening_balance: '0',
  description: '',
  icon: '',
  color: '',
});

export function AccountsTab({ householdId, canManage, defaultCurrency }: AccountsTabProps) {
  const { accounts, loading, error, createAccount, updateAccount, setAccountArchived } =
    useAccounts(householdId);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(defaultCurrency));
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(defaultCurrency));
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (account: Account) => {
    setEditing(account);
    setForm({
      name: account.name,
      account_type: account.account_type,
      currency: account.currency,
      opening_balance: String(account.opening_balance),
      description: account.description ?? '',
      icon: account.icon ?? '',
      color: account.color ?? '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const result = accountSchema.safeParse(form);
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? 'Invalid account data');
      return;
    }

    setSubmitting(true);
    try {
      const input: AccountInput = {
        name: result.data.name,
        account_type: result.data.account_type,
        currency: result.data.currency,
        opening_balance: result.data.opening_balance,
        description: result.data.description || null,
        icon: result.data.icon || null,
        color: result.data.color || null,
      };

      if (editing) {
        await updateAccount(editing.id, input);
      } else {
        await createAccount(input);
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (account: Account) => {
    setActionError('');
    try {
      await setAccountArchived(account.id, !account.archived_at);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update account');
    }
  };

  const sortedAccounts = [...accounts].sort(
    (a, b) => Number(!!a.archived_at) - Number(!!b.archived_at) || a.name.localeCompare(b.name)
  );

  if (loading) {
    return <p className="text-gray-600">Loading accounts...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {accounts.length} account{accounts.length === 1 ? '' : 's'}
        </p>
        {canManage && !showForm && (
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            New account
          </button>
        )}
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {actionError}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-lg p-6 space-y-4 border border-gray-200"
        >
          <h3 className="text-lg font-medium text-gray-900">
            {editing ? 'Edit account' : 'New account'}
          </h3>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="account-name" className={labelClass}>
                Name
              </label>
              <input
                id="account-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="e.g., Bancolombia Checking"
              />
            </div>
            <div>
              <label htmlFor="account-type" className={labelClass}>
                Type
              </label>
              <select
                id="account-type"
                value={form.account_type}
                onChange={(e) => setForm({ ...form, account_type: e.target.value })}
                className={inputClass}
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="account-currency" className={labelClass}>
                Currency
              </label>
              <input
                id="account-currency"
                type="text"
                required
                maxLength={3}
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="account-balance" className={labelClass}>
                Opening balance
              </label>
              <input
                id="account-balance"
                type="text"
                inputMode="decimal"
                value={form.opening_balance}
                onChange={(e) => setForm({ ...form, opening_balance: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="account-description" className={labelClass}>
                Description (optional)
              </label>
              <input
                id="account-description"
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="account-icon" className={labelClass}>
                Icon (optional)
              </label>
              <input
                id="account-icon"
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="account-color" className={labelClass}>
                Color (optional)
              </label>
              <input
                id="account-color"
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className={inputClass}
                placeholder="#3b82f6"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Create account'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {accounts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">
            No accounts yet.{canManage ? ' Create your first account to start tracking.' : ''}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y">
          {sortedAccounts.map((account) => (
            <div key={account.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{account.name}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {account.account_type}
                  </span>
                  {account.archived_at && (
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                      archived
                    </span>
                  )}
                </div>
                {account.description && (
                  <p className="text-sm text-gray-500 mt-1">{account.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{account.currency}</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(account.opening_balance, account.currency)}
                </span>
                {canManage && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEdit(account)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(account)}
                      className="text-sm text-yellow-600 hover:text-yellow-800"
                    >
                      {account.archived_at ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
