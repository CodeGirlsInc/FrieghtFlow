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
