import { createContext } from 'react';
import type { Household, HouseholdWithMembers } from '../types/household';
import type { UserRole } from '../types/auth';

export interface HouseholdContextType {
  households: Household[];
  currentHousehold: HouseholdWithMembers | null;
  loading: boolean;
  error: string | null;
  createHousehold: (params: {
    name: string;
    base_currency?: string;
    locale?: string;
    timezone?: string;
  }) => Promise<string>;
  selectHousehold: (householdId: string) => void;
  refreshHouseholds: () => Promise<void>;
  updateMemberRole: (userId: string, role: UserRole) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
}

export const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);
