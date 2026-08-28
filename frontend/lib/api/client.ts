const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6000/api/v1';

let _accessToken: string | null = null;

type TokenListener = (token: string | null) => void;
const tokenListeners = new Set<TokenListener>();

export function setAccessToken(token: string | null) {
  _accessToken = token;
  tokenListeners.forEach((listener) => listener(token));
}

export function getAccessToken(): string | null {
  return _accessToken;
}

/**
 * Subscribes to every access-token change (login, refresh, and the hard
 * logout below all go through setAccessToken). Used by useShipmentSocket
 * to reconnect with a rotated token instead of only reading it once at
 * mount (FE-110), and by anything else that needs to react to auth state
 * changing outside of React's render cycle. Returns an unsubscribe fn.
 */
export function onTokenChange(listener: TokenListener): () => void {
  tokenListeners.add(listener);
  return () => tokenListeners.delete(listener);
}

/**
 * Clears the session everywhere the API client knows about: the in-memory
 * token, sessionStorage, and (via the token-change notification above)
 * anything subscribed to auth state. This is the single "hard logout"
 * path so a failed refresh can't leave useAuthStore reporting a logged-in
 * user after the API client has already dropped the session (FE-110).
 */
function hardLogout() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userId');
  }
  setAccessToken(null);
}

let refreshInFlight: Promise<string | null> | null = null;

/**
 * Refreshes the access token. Concurrent callers (e.g. several dashboard
 * widgets 401-ing around the same time) share a single in-flight request
 * instead of each independently calling POST /auth/refresh with the same
 * refresh token — important once the backend rotates refresh tokens on
 * use, since only the first of several racing calls would succeed (FE-110).
 */
async function doRefresh(): Promise<string | null> {
  const userId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
  const refreshToken =
    typeof window !== 'undefined' ? sessionStorage.getItem('refreshToken') : null;
  if (!userId || !refreshToken) return null;

  try {
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
}

function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  // Chaining .finally() onto the promise (rather than resetting the flag
  // inside doRefresh's own try/finally) matters: when doRefresh bails out
  // synchronously (no stored refresh token), a finally *inside* the async
  // function would run before this assignment completes, and get clobbered
  // right back to non-null — wedging refreshInFlight forever and silently
  // skipping every future refresh attempt (FE-110).
  refreshInFlight = doRefresh().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
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
        const error = await retryResponse.json().catch(() => ({ message: 'Request failed' }));
        throw error;
      }
      return retryResponse.json() as Promise<T>;
    }
    hardLogout();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
      statusCode: response.status,
    }));
    throw error;
  }

  // Handle empty responses (204 No Content)
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}
