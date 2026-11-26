import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountsPage } from '../pages/AccountsPage';
import { useAuth } from '../contexts/useAuth';
import { useHousehold } from '../contexts/useHousehold';
import { useAccounts } from '../hooks/useAccounts';
import { useCategories } from '../hooks/useCategories';
import type { HouseholdWithMembers } from '../types/household';
import type { Account } from '../types/account';
import type { Category } from '../types/category';

vi.mock('../contexts/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../contexts/useHousehold', () => ({ useHousehold: vi.fn() }));
vi.mock('../hooks/useAccounts', () => ({ useAccounts: vi.fn() }));
vi.mock('../hooks/useCategories', () => ({ useCategories: vi.fn() }));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseHousehold = useHousehold as ReturnType<typeof vi.fn>;
const mockUseAccounts = useAccounts as ReturnType<typeof vi.fn>;
const mockUseCategories = useCategories as ReturnType<typeof vi.fn>;

const household: HouseholdWithMembers = {
  id: 'household-1',
  name: 'Test Household',
  base_currency: 'COP',
  locale: 'es-CO',
  timezone: 'America/Bogota',
  created_by: 'user-1',
  created_at: '2024-01-01T00:00:00Z',
  members: [
    {
      household_id: 'household-1',
      user_id: 'user-1',
      role: 'owner',
      joined_at: '2024-01-01T00:00:00Z',
    },
    {
      household_id: 'household-1',
      user_id: 'user-2',
      role: 'viewer',
      joined_at: '2024-01-01T00:00:00Z',
    },
  ],
};

const account: Account = {
  id: 'acc-1',
  household_id: 'household-1',
  name: 'Checking',
  account_type: 'checking',
  description: null,
  icon: null,
  color: null,
  currency: 'COP',
  opening_balance: 1500000,
  archived_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const category: Category = {
  id: 'cat-1',
  household_id: 'household-1',
  name: 'Mercado',
  category_type: 'expense',
  icon: null,
  color: null,
  is_default: true,
  archived_at: null,
  created_at: '2024-01-01T00:00:00Z',
};

function setup(userId: string, role: 'owner' | 'viewer') {
  const members = household.members.map((m) => (m.user_id === userId ? { ...m, role } : m));
  mockUseAuth.mockReturnValue({ user: { id: userId }, loading: false });
  mockUseHousehold.mockReturnValue({
    currentHousehold: { ...household, members },
    loading: false,
    error: null,
  });
  mockUseAccounts.mockReturnValue({
    accounts: [account],
    loading: false,
    error: null,
    createAccount: vi.fn(),
    updateAccount: vi.fn(),
    setAccountArchived: vi.fn(),
    reload: vi.fn(),
  });
  mockUseCategories.mockReturnValue({
    categories: [category],
    loading: false,
    error: null,
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    setCategoryArchived: vi.fn(),
    reload: vi.fn(),
  });
}

describe('AccountsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows accounts to an owner with management controls', () => {
    setup('user-1', 'owner');

    render(<AccountsPage />);

    expect(screen.getByText('Checking')).toBeInTheDocument();
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('New account')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });

  it('shows read-only view to a viewer', () => {
    setup('user-2', 'viewer');

    render(<AccountsPage />);

    expect(screen.getByText('Checking')).toBeInTheDocument();
    expect(screen.getByText(/Read-only/)).toBeInTheDocument();
    expect(screen.queryByText('New account')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('switches to the categories tab', async () => {
    setup('user-1', 'owner');

    render(<AccountsPage />);

    await userEvent.click(screen.getByText('Categories'));

    expect(screen.getByText('Mercado')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
  });

  it('shows a loading state while the household loads', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    mockUseHousehold.mockReturnValue({ currentHousehold: null, loading: true, error: null });

    render(<AccountsPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
