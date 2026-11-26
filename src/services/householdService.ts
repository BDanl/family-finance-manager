import { supabase } from '../lib/supabase';
import type { Household, HouseholdMember, HouseholdWithMembers } from '../types/household';

export const householdService = {
  /**
   * Create a new household with the current user as owner
   * Uses the atomic database function
   */
  async createHousehold(params: {
    name: string;
    base_currency?: string;
    locale?: string;
    timezone?: string;
  }): Promise<string> {
    const { data, error } = await supabase.rpc('create_household_with_owner', {
      p_name: params.name,
      p_base_currency: params.base_currency || 'COP',
      p_locale: params.locale || 'es-CO',
      p_timezone: params.timezone || 'America/Bogota',
    });

    if (error) {
      throw error;
    }

    return data as string;
  },

  /**
   * Get the current user's households
   */
  async getUserHouseholds(): Promise<Household[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('households')
      .select(`
        *,
        household_members!inner(role)
      `)
      .eq('household_members.user_id', user.id);

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Get a household by ID with members
   */
  async getHouseholdById(householdId: string): Promise<HouseholdWithMembers | null> {
    const { data, error } = await supabase
      .from('households')
      .select(`
        *,
        household_members(user_id, role, joined_at)
      `)
      .eq('id', householdId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }

    return data as HouseholdWithMembers;
  },

  /**
   * Get household members
   */
  async getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
    const { data, error } = await supabase
      .from('household_members')
      .select('*')
      .eq('household_id', householdId);

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Update household settings
   */
  async updateHousehold(
    householdId: string,
    updates: Partial<Pick<Household, 'name' | 'base_currency' | 'locale' | 'timezone'>>
  ): Promise<void> {
    const { error } = await supabase
      .from('households')
      .update(updates)
      .eq('id', householdId);

    if (error) {
      throw error;
    }
  },

  /**
   * Update member role
   */
  async updateMemberRole(
    householdId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member' | 'viewer'
  ): Promise<void> {
    const { error } = await supabase
      .from('household_members')
      .update({ role })
      .eq('household_id', householdId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  },

  /**
   * Remove a member from household
   */
  async removeMember(householdId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('household_members')
      .delete()
      .eq('household_id', householdId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  },
};
