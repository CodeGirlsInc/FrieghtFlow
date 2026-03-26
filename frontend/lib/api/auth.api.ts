import { apiClient, setAccessToken } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../../types/auth.types';

function persistTokens(data: AuthResponse) {
  setAccessToken(data.accessToken);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('refreshToken', data.refreshToken);
    sessionStorage.setItem('userId', data.user.id);
  }
}

function clearTokens() {
  setAccessToken(null);
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userId');
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const data = await apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  persistTokens(data);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  persistTokens(data);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient('/auth/logout', { method: 'POST' });
  } finally {
    clearTokens();
  }
}

export async function refreshToken(): Promise<AuthResponse> {
  const userId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
  const refresh = typeof window !== 'undefined' ? sessionStorage.getItem('refreshToken') : null;

  const data = await apiClient<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ userId, refreshToken: refresh }),
    skipAuth: true,
  });
  persistTokens(data);
  return data;
}

export async function getCurrentUser(): Promise<User> {
  return apiClient<User>('/auth/me');
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
    skipAuth: true,
  });
}

export async function updateProfile(dto: {
  firstName?: string;
  lastName?: string;
  walletAddress?: string;
}): Promise<User> {
  return apiClient<User>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>('/auth/change-password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}