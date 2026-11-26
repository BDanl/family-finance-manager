import { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useHousehold } from '../contexts/useHousehold';
import { AccountsTab } from '../features/accounts/AccountsTab';
import { CategoriesTab } from '../features/accounts/CategoriesTab';
import type { UserRole } from '../types/auth';

const MANAGER_ROLES: UserRole[] = ['owner', 'admin'];

export function AccountsPage() {
  const { user } = useAuth();
  const { currentHousehold, loading: householdLoading, error: householdError } = useHousehold();
  const [tab, setTab] = useState<'accounts' | 'categories'>('accounts');

  if (householdLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Accounts & Categories</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (householdError) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Accounts & Categories</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {householdError}
        </div>
      </div>
    );
  }

  if (!currentHousehold) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Accounts & Categories</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">No household found.</p>
        </div>
      </div>
    );
  }

  const currentUserRole = currentHousehold.members?.find(
    (member) => member.user_id === user?.id
  )?.role;
  const canManage = currentUserRole ? MANAGER_ROLES.includes(currentUserRole) : false;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Accounts & Categories</h2>
        {!canManage && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            Read-only ({currentUserRole})
          </span>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setTab('accounts')}
            className={`py-2 px-1 border-b-2 text-sm font-medium ${
              tab === 'accounts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Accounts
          </button>
          <button
            onClick={() => setTab('categories')}
            className={`py-2 px-1 border-b-2 text-sm font-medium ${
              tab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categories
          </button>
        </nav>
      </div>

      {tab === 'accounts' ? (
        <AccountsTab
          householdId={currentHousehold.id}
          canManage={canManage}
          defaultCurrency={currentHousehold.base_currency}
        />
      ) : (
        <CategoriesTab householdId={currentHousehold.id} canManage={canManage} />
      )}
    </div>
  );
}
