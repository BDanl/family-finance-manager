import { describe, it, expect, beforeEach, vi } from 'vitest';
import { householdService } from '../services/householdService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })),
    },
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

const mockRpc = supabase.rpc as ReturnType<typeof vi.fn>;

describe('householdService.createHousehold', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the atomic RPC with default preferences', async () => {
    mockRpc.mockResolvedValue({ data: 'household-id', error: null });

    const id = await householdService.createHousehold({ name: 'Test Household' });

    expect(id).toBe('household-id');
    expect(mockRpc).toHaveBeenCalledWith('create_household_with_owner', {
      p_name: 'Test Household',
      p_base_currency: 'COP',
      p_locale: 'es-CO',
      p_timezone: 'America/Bogota',
    });
  });

  it('passes custom preferences to the RPC', async () => {
    mockRpc.mockResolvedValue({ data: 'household-id', error: null });

    await householdService.createHousehold({
      name: 'Test',
      base_currency: 'USD',
      locale: 'en-US',
      timezone: 'America/New_York',
    });

    expect(mockRpc).toHaveBeenCalledWith('create_household_with_owner', {
      p_name: 'Test',
      p_base_currency: 'USD',
      p_locale: 'en-US',
      p_timezone: 'America/New_York',
    });
  });

  it('throws when the RPC fails', async () => {
    mockRpc.mockResolvedValue({ data: null, error: new Error('rpc failed') });

    await expect(householdService.createHousehold({ name: 'Test' })).rejects.toThrow('rpc failed');
  });
});
