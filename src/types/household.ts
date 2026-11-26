import { UserRole } from './auth';

export interface Household {
  id: string;
  name: string;
  base_currency: string;
  locale: string;
  timezone: string;
  created_by: string;
  created_at: string;
}

export interface HouseholdMember {
  household_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
}

export interface HouseholdWithMembers extends Household {
  members: HouseholdMember[];
}
