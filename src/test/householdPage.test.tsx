import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HouseholdPage } from '../pages/HouseholdPage';
import { useAuth } from '../contexts/useAuth';
import { useHousehold } from '../contexts/useHousehold';
import type { HouseholdContextType } from '../contexts/household.context';
import type { HouseholdWithMembers } from '../types/household';

vi.mock('../contexts/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../contexts/useHousehold', () => ({
  useHousehold: vi.fn(),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseHousehold = useHousehold as ReturnType<typeof vi.fn>;

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
      role: 'member',
      joined_at: '2024-01-02T00:00:00Z',
    },
  ],
};

function setupContext(userId: string, userRole: 'owner' | 'member' | 'viewer') {
  const members = household.members.map((m) =>
    m.user_id === userId ? { ...m, role: userRole } : m
  );

  mockUseAuth.mockReturnValue({
    user: { id: userId, email: 'test@example.com' },
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
  });

  const householdContext: HouseholdContextType = {
    households: [household],
    currentHousehold: { ...household, members },
    loading: false,
    error: null,
    createHousehold: vi.fn(),
    selectHousehold: vi.fn(),
    refreshHouseholds: vi.fn(),
    updateMemberRole: vi.fn(() => Promise.resolve()),
    removeMember: vi.fn(() => Promise.resolve()),
  };
  mockUseHousehold.mockReturnValue(householdContext);
  return householdContext;
}

describe('HouseholdPage member management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('lets an owner change another member role', async () => {
    const ctx = setupContext('user-1', 'owner');

    render(<HouseholdPage />);

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'admin');

    await waitFor(() => {
      expect(ctx.updateMemberRole).toHaveBeenCalledWith('user-2', 'admin');
    });
  });

  it('lets an owner remove another member', async () => {
    const ctx = setupContext('user-1', 'owner');

    render(<HouseholdPage />);

    await userEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(ctx.removeMember).toHaveBeenCalledWith('user-2');
    });
    expect(window.confirm).toHaveBeenCalled();
  });

  it('does not remove a member when confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const ctx = setupContext('user-1', 'owner');

    render(<HouseholdPage />);

    await userEvent.click(screen.getByText('Remove'));

    expect(ctx.removeMember).not.toHaveBeenCalled();
  });

  it('does not show member controls to a non-owner', () => {
    setupContext('user-2', 'member');

    render(<HouseholdPage />);

    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
  });

  it('does not allow managing the owner row', () => {
    setupContext('user-1', 'owner');

    render(<HouseholdPage />);

    // Only the non-owner member row should have controls
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    expect(screen.getAllByText('Remove')).toHaveLength(1);
  });
});
