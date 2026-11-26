export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface AuthState {
  user: { id: string; email?: string } | null;
  session: import('@supabase/supabase-js').Session | null;
  loading: boolean;
}
