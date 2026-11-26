import { useEffect, useState, ReactNode } from 'react';
import { AuthContext } from './auth.context';
import { authService } from '../services/authService';
import type { AuthState } from '../types/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    authService
      .getSession()
      .then((session) => {
        setAuthState({
          user: session?.user || null,
          session: session || null,
          loading: false,
        });
      })
      .catch(() => {
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
      });

    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (_event, session) => {
      setAuthState({
        user: session?.user || null,
        session: session || null,
        loading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { session, user } = await authService.signIn(email, password);
    setAuthState({
      user: user || null,
      session: session || null,
      loading: false,
    });
  };

  const signUp = async (email: string, password: string) => {
    const { session, user } = await authService.signUp(email, password);
    setAuthState({
      user: user || null,
      session: session || null,
      loading: false,
    });
  };

  const signOut = async () => {
    await authService.signOut();
    setAuthState({
      user: null,
      session: null,
      loading: false,
    });
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    await authService.updatePassword(newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
