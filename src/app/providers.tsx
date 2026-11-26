import { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { HouseholdProvider } from '../contexts/HouseholdContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <HouseholdProvider>
        {children}
      </HouseholdProvider>
    </AuthProvider>
  );
}
