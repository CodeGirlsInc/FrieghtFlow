import { useAuthStore } from './auth.store';
import { setAccessToken } from '../lib/api/client';
import type { User } from '../types/auth.types';

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'shipper',
  isEmailVerified: true,
  isActive: true,
  walletAddress: null,
  verificationToken: null,
  verificationTokenExpiry: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('auth store — synced with API client hard logout (FE-110)', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    setAccessToken(null);
  });

  it('clears the store when the API client hard-logs-out (token cleared to null)', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true, isLoading: false });

    // Simulates client.ts's hardLogout() after a failed refresh — the store
    // never called its own logout() action, so without this sync it would
    // otherwise keep reporting the user as logged in.
    setAccessToken(null);

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('does not touch the store when the token is set to a real value', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true, isLoading: false });

    setAccessToken('a-real-token');

    expect(useAuthStore.getState().user).toBe(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('is a no-op when the store already has no user', () => {
    setAccessToken(null);

    expect(useAuthStore.getState().user).toBeNull();
  });
});
