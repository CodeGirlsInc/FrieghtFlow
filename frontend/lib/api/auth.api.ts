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

export interface Setup2FAResponse {
  otpauthUrl: string;
  qrCodeDataUrl: string;
  secret: string;
}

export interface Enable2FAResponse {
  recoveryCodes: string[];
}

export interface AuthSuccessResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  // Existing functions (login, logout, etc.) should remain above...

  async setup2FA(): Promise<Setup2FAResponse> {
    const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to generate 2FA initialization parameters.');
    return res.json();
  },

  async enable2FA(otp: string): Promise<Enable2FAResponse> {
    const res = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Invalid verification code. Please try again.');
    }
    return res.json();
  },

  async disable2FA(password: string): Promise<void> {
    const res = await fetch('/api/auth/2fa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Incorrect password verification failed.');
    }
  },

  async verify2FA(otpOrRecoveryCode: string, tempToken: string, isRecovery = false): Promise<AuthSuccessResponse> {
    const payload = isRecovery ? { recoveryCode: otpOrRecoveryCode } : { otp: otpOrRecoveryCode };
    const res = await fetch('/api/auth/2fa/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tempToken}`
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Verification rejected. Check your code and try again.');
    }
    return res.json();
  }
};