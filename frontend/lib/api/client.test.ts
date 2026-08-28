import { apiClient, setAccessToken, getAccessToken, onTokenChange } from './client';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: 'Error',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response;
}

describe('client.ts', () => {
  beforeEach(() => {
    setAccessToken(null);
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  describe('onTokenChange', () => {
    it('notifies subscribers on every setAccessToken call', () => {
      const listener = jest.fn();
      onTokenChange(listener);

      setAccessToken('abc');
      setAccessToken(null);

      expect(listener).toHaveBeenNthCalledWith(1, 'abc');
      expect(listener).toHaveBeenNthCalledWith(2, null);
    });

    it('stops notifying after unsubscribe', () => {
      const listener = jest.fn();
      const unsubscribe = onTokenChange(listener);

      setAccessToken('abc');
      unsubscribe();
      setAccessToken('xyz');

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshAccessToken single-flight guard (FE-110)', () => {
    it('shares one in-flight refresh across concurrent 401s instead of racing', async () => {
      sessionStorage.setItem('userId', 'u1');
      sessionStorage.setItem('refreshToken', 'r1');

      let refreshCallCount = 0;
      const fetchMock = jest.fn((url: string) => {
        if (url.includes('/auth/refresh')) {
          refreshCallCount++;
          return Promise.resolve(jsonResponse({ accessToken: 'new-token' }));
        }
        return Promise.resolve(jsonResponse({}, false, 401));
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      // Two API calls 401 "at the same time" (a realistic scenario when
      // several widgets fetch in parallel right as a token expires).
      await Promise.allSettled([apiClient('/a'), apiClient('/b')]);

      expect(refreshCallCount).toBe(1);
    });

    it('allows a fresh refresh call once the previous one has settled', async () => {
      sessionStorage.setItem('userId', 'u1');
      sessionStorage.setItem('refreshToken', 'r1');

      let refreshCallCount = 0;
      const fetchMock = jest.fn((url: string) => {
        if (url.includes('/auth/refresh')) {
          refreshCallCount++;
          return Promise.resolve(jsonResponse({ accessToken: 'new-token' }));
        }
        return Promise.resolve(jsonResponse({}, false, 401));
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      await apiClient('/a').catch(() => undefined);
      await apiClient('/b').catch(() => undefined);

      expect(refreshCallCount).toBe(2);
    });
  });

  describe('hard logout on failed refresh (FE-110)', () => {
    it('clears the token, session storage, and notifies onTokenChange when refresh fails', async () => {
      setAccessToken('stale-token');
      sessionStorage.setItem('userId', 'u1');
      sessionStorage.setItem('refreshToken', 'r1');

      global.fetch = jest.fn().mockResolvedValue(jsonResponse({}, false, 401)) as unknown as typeof fetch;

      const listener = jest.fn();
      onTokenChange(listener);

      await expect(apiClient('/a')).rejects.toBeDefined();

      expect(getAccessToken()).toBeNull();
      expect(sessionStorage.getItem('refreshToken')).toBeNull();
      expect(sessionStorage.getItem('userId')).toBeNull();
      expect(listener).toHaveBeenCalledWith(null);
    });

    it('does not hard-log-out when there is no refresh token to use', async () => {
      // No sessionStorage seeded — refreshAccessToken bails out immediately.
      global.fetch = jest.fn().mockResolvedValue(jsonResponse({}, false, 401)) as unknown as typeof fetch;

      await expect(apiClient('/a')).rejects.toBeDefined();
      // Only the original request was made — refresh short-circuited
      // without hitting the network, since there was nothing to send.
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('successful refresh-and-retry', () => {
    it('retries the original request with the new token and returns its result', async () => {
      sessionStorage.setItem('userId', 'u1');
      sessionStorage.setItem('refreshToken', 'r1');

      let originalCallCount = 0;
      global.fetch = jest.fn((url: string) => {
        if (url.includes('/auth/refresh')) {
          return Promise.resolve(jsonResponse({ accessToken: 'new-token' }));
        }
        originalCallCount++;
        // First hit is unauthorized; the retry (after refresh) succeeds.
        if (originalCallCount === 1) {
          return Promise.resolve(jsonResponse({}, false, 401));
        }
        return Promise.resolve(jsonResponse({ ok: true }));
      }) as unknown as typeof fetch;

      const result = await apiClient('/a');

      expect(result).toEqual({ ok: true });
      expect(getAccessToken()).toBe('new-token');
    });
  });
});
