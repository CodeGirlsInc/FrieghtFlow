const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6000/api/v1';

let _accessToken: string | null = null;
let _refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

function clearSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userId');
  }
  setAccessToken(null);
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  const currentPath = window.location.pathname + window.location.search;
  const loginUrl = new URL('/login', window.origin);
  loginUrl.searchParams.set('callbackUrl', currentPath);
  window.location.href = loginUrl.toString();
}

async function refreshAccessToken(): Promise<string | null> {
  if (_refreshPromise) {
    return _refreshPromise;
  }

  _refreshPromise = (async () => {
    try {
      const userId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
      const refreshToken =
        typeof window !== 'undefined' ? sessionStorage.getItem('refreshToken') : null;
      if (!userId || !refreshToken) return null;

      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, refreshToken }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        if (data.refreshToken) {
          sessionStorage.setItem('refreshToken', data.refreshToken);
        }
        return data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  })();

  try {
    return await _refreshPromise;
  } finally {
    _refreshPromise = null;
  }
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiClient<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth && _accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include',
    headers,
  });

  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryResponse = await fetch(url, {
        ...fetchOptions,
        credentials: 'include',
        headers,
      });
      if (!retryResponse.ok) {
        const error = await retryResponse.json().catch(() => ({
          message: 'Request failed',
          statusCode: retryResponse.status,
        }));
        throw error;
      }
      return retryResponse.json() as Promise<T>;
    }
    clearSession();
    redirectToLogin();
    throw { message: 'Session expired. Please sign in again.', statusCode: 401 };
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
      statusCode: response.status,
    }));
    throw error;
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}
