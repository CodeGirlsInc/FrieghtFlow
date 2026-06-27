import { useAuthStore } from '../../../stores/auth.store';

jest.mock('../../../lib/api/auth.api', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
}));

import * as authApi from '../../../lib/api/auth.api';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'shipper' as const,
  isEmailVerified: true,
  isActive: true,
  walletAddress: null,
  verificationToken: null,
  verificationTokenExpiry: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  });
  jest.clearAllMocks();
});

describe('useAuthStore', () => {
  describe('initial state', () => {
    it('starts with no user and unauthenticated', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
    });
  });

  describe('setUser', () => {
    it('sets user and marks authenticated when user is provided', () => {
      useAuthStore.getState().setUser(mockUser);
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('clears user and marks unauthenticated when null is passed', () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      useAuthStore.getState().setUser(null);
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('replaces an existing user', () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      const updatedUser = { ...mockUser, firstName: 'Updated' };
      useAuthStore.getState().setUser(updatedUser);
      expect(useAuthStore.getState().user?.firstName).toBe('Updated');
    });
  });

  describe('setRefreshToken', () => {
    it('stores the refresh token', () => {
      useAuthStore.getState().setRefreshToken('refresh-token-abc');
      expect(useAuthStore.getState().refreshToken).toBe('refresh-token-abc');
    });

    it('clears the refresh token when null is passed', () => {
      useAuthStore.setState({ refreshToken: 'old-token' });
      useAuthStore.getState().setRefreshToken(null);
      expect(useAuthStore.getState().refreshToken).toBeNull();
    });

    it('does not affect other state fields', () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      useAuthStore.getState().setRefreshToken('new-refresh-token');
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('isAuthenticated selector', () => {
    it('reflects authentication status correctly', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      useAuthStore.getState().setUser(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('sets user and isAuthenticated on success', async () => {
      (authApi.login as jest.Mock).mockResolvedValueOnce({ user: mockUser });
      await useAuthStore.getState().login({ email: 'test@example.com', password: 'pass' });
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('clears isLoading and rethrows on failure', async () => {
      (authApi.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));
      await expect(
        useAuthStore.getState().login({ email: 'bad@example.com', password: 'wrong' }),
      ).rejects.toThrow('Invalid credentials');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears user, tokens, and isAuthenticated', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true, refreshToken: 'token' });
      (authApi.logout as jest.Mock).mockResolvedValueOnce(undefined);
      await useAuthStore.getState().logout();
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.refreshToken).toBeNull();
      expect(state.token).toBeNull();
    });

    it('clears state even when API call fails', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      (authApi.logout as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      try {
        await useAuthStore.getState().logout();
      } catch {
        // The error propagates but state is cleared in the finally block
      }
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('fetchCurrentUser', () => {
    it('populates user on success', async () => {
      (authApi.getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);
      await useAuthStore.getState().fetchCurrentUser();
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('clears user on failure', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      (authApi.getCurrentUser as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));
      await useAuthStore.getState().fetchCurrentUser();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
