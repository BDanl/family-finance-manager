import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

const mockGetSession = supabase.auth.getSession as ReturnType<typeof vi.fn>;
const mockUpdateUser = supabase.auth.updateUser as ReturnType<typeof vi.fn>;
const mockSignOut = supabase.auth.signOut as ReturnType<typeof vi.fn>;

const recoverySession = {
  access_token: 'token',
  refresh_token: 'refresh',
  expires_in: 3600,
  user: { id: 'user-1', email: 'test@example.com' },
};

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ResetPasswordPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the password form when a recovery session exists', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: recoverySession },
      error: null,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Set a new password')).toBeInTheDocument();
    });
  });

  it('shows an invalid-link message when there is no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Invalid reset link')).toBeInTheDocument();
    });
  });

  it('updates the password and signs out on submit', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: recoverySession },
      error: null,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Set a new password')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText('New password'), 'newpassword1');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'newpassword1');
    await userEvent.click(screen.getByText('Update password'));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpassword1' });
    });
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText(/password has been updated/i)).toBeInTheDocument();
    });
  });

  it('rejects mismatched passwords without calling the service', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: recoverySession },
      error: null,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Set a new password')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText('New password'), 'newpassword1');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'different');
    await userEvent.click(screen.getByText('Update password'));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });
});
