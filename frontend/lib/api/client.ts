export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6000/api/v1';

export function getApiUrl(path: string): string {
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

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
  const url = getApiUrl(path);

  // A FormData body must be encoded as multipart/form-data *by the fetch
  // implementation*, which also generates the part boundary — forcing
  // application/json here would label a multipart body as JSON and the
  // server could not parse it. Callers that send FormData (e.g. DisputeForm)
  // therefore get no default Content-Type at all.
  const isFormData = fetchOptions.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

/**
 * XHR upload counterpart to apiClient. Keeps upload progress while sharing
 * the API base URL, auth token, and single refresh-and-retry behavior.
 */
export async function uploadWithProgress<T>(
  path: string,
  body: FormData,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<T> {
  const url = getApiUrl(path);

  const send = (token: string | null): Promise<XMLHttpRequest> =>
    new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('Upload aborted', 'AbortError'));
        return;
      }

      const xhr = new XMLHttpRequest();
      const cleanup = () => signal?.removeEventListener('abort', abort);
      const abort = () => xhr.abort();

      xhr.open('POST', url);
      if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.withCredentials = true;
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        cleanup();
        resolve(xhr);
      };
      xhr.onerror = () => {
        cleanup();
        reject(new Error('Upload failed'));
      };
      xhr.onabort = () => {
        cleanup();
        reject(new DOMException('Upload aborted', 'AbortError'));
      };
      signal?.addEventListener('abort', abort, { once: true });
      xhr.send(body);
    });

  let response = await send(_accessToken);
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      hardLogout();
    } else {
      if (signal?.aborted) throw new DOMException('Upload aborted', 'AbortError');
      response = await send(newToken);
    }
  }

  let data: unknown;
  try {
    data = response.responseText ? JSON.parse(response.responseText) : {};
  } catch {
    if (response.status >= 200 && response.status < 300) {
      throw new Error('Invalid response from server');
    }
    data = {
      message: response.statusText || 'Request failed',
      statusCode: response.status,
    };
  }

  if (response.status < 200 || response.status >= 300) {
    if (data === null || typeof data !== 'object') {
      data = {
        message: response.statusText || 'Request failed',
        statusCode: response.status,
      };
    }
    throw data;
  }

  return data as T;
}

/**
 * Pulls the human-readable message out of an error thrown by `apiClient`,
 * which rejects with the parsed response body rather than an `Error`
 * (see the throws above). The backend sends `message` as either a single
 * string or — for class-validator failures — an array of strings, so both
 * shapes are unwrapped to their first usable entry.
 *
 * Returns `null` when there is no server message to show, so callers can
 * fall back to their own generic text:
 *
 *   toast.error(getErrorMessage(err) ?? 'Action failed. Please try again.');
 *
 * `Error` instances are deliberately not unwrapped: they come from transport
 * and local failures (network errors, the XHR upload path), and their raw
 * text — "TypeError: Failed to fetch" and friends — is noise for the user,
 * not a server-supplied explanation.
 */
export function getErrorMessage(err: unknown): string | null {
  if (typeof err === 'string') {
    return err.trim() ? err : null;
  }
  if (err instanceof Error || err === null || typeof err !== 'object') {
    return null;
  }

  const { message } = err as { message?: unknown };
  if (typeof message === 'string') {
    return message.trim() ? message : null;
  }
  if (Array.isArray(message)) {
    const first = message.find(
      (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0,
    );
    return first ?? null;
  }
  return null;
}
