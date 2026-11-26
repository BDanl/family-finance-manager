import { useCallback, useEffect, useState, ReactNode } from 'react';
import { HouseholdContext } from './household.context';
import { householdService } from '../services/householdService';
import { useAuth } from './useAuth';
import type { Household, HouseholdWithMembers } from '../types/household';
import type { UserRole } from '../types/auth';

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);
  const [currentHousehold, setCurrentHousehold] = useState<HouseholdWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshHouseholds = useCallback(async () => {
    if (!user) {
      setHouseholds([]);
      setCurrentHouseholdId(null);
      setCurrentHousehold(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const userHouseholds = await householdService.getUserHouseholds();
      setHouseholds(userHouseholds);
      setCurrentHouseholdId((prev) =>
        prev && userHouseholds.some((h) => h.id === prev) ? prev : (userHouseholds[0]?.id ?? null)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load households');
      console.error('Failed to fetch households:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    refreshHouseholds();
  }, [refreshHouseholds]);

  useEffect(() => {
    if (!currentHouseholdId) {
      setCurrentHousehold(null);
      return;
    }

    let cancelled = false;
    householdService
      .getHouseholdById(currentHouseholdId)
      .then((household) => {
        if (!cancelled) {
          setCurrentHousehold(household);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load household');
          console.error('Failed to fetch household:', err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentHouseholdId]);

  const refreshCurrentHousehold = useCallback(async () => {
    if (!currentHouseholdId) return;
    const household = await householdService.getHouseholdById(currentHouseholdId);
    setCurrentHousehold(household);
  }, [currentHouseholdId]);

  const createHousehold = async (params: {
    name: string;
    base_currency?: string;
    locale?: string;
    timezone?: string;
  }) => {
    const householdId = await householdService.createHousehold(params);
    await refreshHouseholds();
    setCurrentHouseholdId(householdId);
    return householdId;
  };

  const selectHousehold = (householdId: string) => {
    setCurrentHouseholdId(householdId);
  };

  const updateMemberRole = async (userId: string, role: UserRole) => {
    if (!currentHouseholdId) {
      throw new Error('No household selected');
    }
    await householdService.updateMemberRole(currentHouseholdId, userId, role);
    await refreshCurrentHousehold();
  };

  const removeMember = async (userId: string) => {
    if (!currentHouseholdId) {
      throw new Error('No household selected');
    }
    await householdService.removeMember(currentHouseholdId, userId);
    await refreshCurrentHousehold();
  };

  return (
    <HouseholdContext.Provider
      value={{
        households,
        currentHousehold,
        loading,
        error,
        createHousehold,
        selectHousehold,
        refreshHouseholds,
        updateMemberRole,
        removeMember,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}
