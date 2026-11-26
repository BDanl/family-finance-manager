import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HouseholdProvider } from '../contexts/HouseholdContext';
import { AuthProvider } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/useHousehold';
import { householdService } from '../services/householdService';
import { supabase } from '../lib/supabase';
import type { Household, HouseholdWithMembers } from '../types/household';

vi.mock('../services/householdService', () => ({
  householdService: {
    createHousehold: vi.fn(),
    getUserHouseholds: vi.fn(),
    getHouseholdById: vi.fn(),
    getHouseholdMembers: vi.fn(),
    updateHousehold: vi.fn(),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
  },
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

const mockGetSession = supabase.auth.getSession as ReturnType<typeof vi.fn>;
const mockGetUserHouseholds = householdService.getUserHouseholds as ReturnType<typeof vi.fn>;
const mockGetHouseholdById = householdService.getHouseholdById as ReturnType<typeof vi.fn>;
const mockCreateHousehold = householdService.createHousehold as ReturnType<typeof vi.fn>;

const household: Household = {
  id: 'household-1',
  name: 'Test Household',
  base_currency: 'COP',
  locale: 'es-CO',
  timezone: 'America/Bogota',
  created_by: 'user-1',
  created_at: '2024-01-01T00:00:00Z',
};

const householdWithMembers: HouseholdWithMembers = {
  ...household,
  members: [
    {
      household_id: 'household-1',
      user_id: 'user-1',
      role: 'owner',
      joined_at: '2024-01-01T00:00:00Z',
    },
  ],
};

function mockAuthenticatedUser() {
  mockGetSession.mockResolvedValue({
    data: {
      session: {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        user: { id: 'user-1', email: 'test@example.com' },
      },
    },
    error: null,
  });
}

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <HouseholdProvider>{ui}</HouseholdProvider>
    </AuthProvider>
  );
}

describe('HouseholdContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockGetUserHouseholds.mockResolvedValue([]);
    mockGetHouseholdById.mockResolvedValue(null);
  });

  it('loads households for the authenticated user', async () => {
    mockAuthenticatedUser();
    mockGetUserHouseholds.mockResolvedValue([household]);
    mockGetHouseholdById.mockResolvedValue(householdWithMembers);

    const TestComponent = () => {
      const { currentHousehold, loading, error } = useHousehold();
      if (loading) return <div>Loading</div>;
      if (error) return <div>Error: {error}</div>;
      return <div>{currentHousehold ? currentHousehold.name : 'No household'}</div>;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('Test Household')).toBeInTheDocument();
    });
    expect(mockGetUserHouseholds).toHaveBeenCalled();
    expect(mockGetHouseholdById).toHaveBeenCalledWith('household-1');
  });

  it('exposes an error when household fetching fails', async () => {
    mockAuthenticatedUser();
    mockGetUserHouseholds.mockRejectedValue(new Error('fetch failed'));

    const TestComponent = () => {
      const { error, loading } = useHousehold();
      if (loading) return <div>Loading</div>;
      return <div>{error ?? 'No error'}</div>;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('fetch failed')).toBeInTheDocument();
    });
  });

  it('resets household state when there is no authenticated user', async () => {
    const TestComponent = () => {
      const { households, loading } = useHousehold();
      if (loading) return <div>Loading</div>;
      return <div>{households.length === 0 ? 'Empty' : 'Has households'}</div>;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('Empty')).toBeInTheDocument();
    });
    expect(mockGetUserHouseholds).not.toHaveBeenCalled();
  });

  it('loads household details when selecting a household', async () => {
    mockAuthenticatedUser();
    const otherHousehold: Household = { ...household, id: 'household-2', name: 'Other' };
    mockGetUserHouseholds.mockResolvedValue([household, otherHousehold]);
    mockGetHouseholdById.mockImplementation((id: string) =>
      Promise.resolve(
        id === 'household-2' ? { ...otherHousehold, members: [] } : householdWithMembers
      )
    );

    const TestComponent = () => {
      const { currentHousehold, selectHousehold, loading } = useHousehold();
      if (loading) return <div>Loading</div>;
      return (
        <div>
          <div>{currentHousehold?.name ?? 'No household'}</div>
          <button onClick={() => selectHousehold('household-2')}>Switch</button>
        </div>
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('Test Household')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Switch'));

    await waitFor(() => {
      expect(screen.getByText('Other')).toBeInTheDocument();
    });
    expect(mockGetHouseholdById).toHaveBeenCalledWith('household-2');
  });

  it('creates a household and selects it', async () => {
    mockAuthenticatedUser();
    mockCreateHousehold.mockResolvedValue('new-household-id');
    const newHousehold: Household = { ...household, id: 'new-household-id', name: 'New' };
    mockGetUserHouseholds.mockResolvedValue([newHousehold]);
    mockGetHouseholdById.mockResolvedValue({ ...newHousehold, members: [] });

    const TestComponent = () => {
      const { createHousehold, currentHousehold } = useHousehold();
      return (
        <div>
          <div>{currentHousehold?.name ?? 'No household'}</div>
          <button onClick={() => createHousehold({ name: 'New' })}>Create</button>
        </div>
      );
    };

    renderWithProviders(<TestComponent />);

    await userEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockCreateHousehold).toHaveBeenCalledWith({ name: 'New' });
    });
    await waitFor(() => {
      expect(mockGetHouseholdById).toHaveBeenCalledWith('new-household-id');
    });
  });
});
