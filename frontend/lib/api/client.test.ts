import {
  apiClient,
  setAccessToken,
  getAccessToken,
  onTokenChange,
  uploadWithProgress,
} from './client';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: 'Error',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response;
}

class MockXMLHttpRequest {
  static instances: MockXMLHttpRequest[] = [];
  status = 0;
  statusText = '';
  responseText = '';
  withCredentials = false;
  upload: { onprogress: ((event: ProgressEvent) => void) | null } = { onprogress: null };
  onload: ((event: ProgressEvent) => void) | null = null;
  onerror: ((event: ProgressEvent) => void) | null = null;
  onabort: ((event: ProgressEvent) => void) | null = null;
  headers: Record<string, string> = {};
  open = jest.fn();
  send = jest.fn();

  constructor() {
    MockXMLHttpRequest.instances.push(this);
  }

  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }

  abort() {
    this.onabort?.(new ProgressEvent('abort'));
  }

  respond(status: number, body: unknown, statusText = 'Error') {
    this.status = status;
    this.statusText = statusText;
    this.responseText = JSON.stringify(body);
    this.onload?.(new ProgressEvent('load'));
  }
}

describe('client.ts', () => {
  beforeEach(() => {
    setAccessToken(null);
    sessionStorage.clear();
    jest.restoreAllMocks();
    MockXMLHttpRequest.instances = [];
    global.XMLHttpRequest = MockXMLHttpRequest as unknown as typeof XMLHttpRequest;
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

    describe('uploadWithProgress', () => {
      it('refreshes an expired token once and retries the XHR upload', async () => {
        setAccessToken('expired-token');
        sessionStorage.setItem('userId', 'u1');
        sessionStorage.setItem('refreshToken', 'r1');
        global.fetch = jest.fn().mockResolvedValue(
          jsonResponse({ accessToken: 'new-token' }),
        ) as unknown as typeof fetch;

        const formData = new FormData();
        const onProgress = jest.fn();
        const result = uploadWithProgress<{ id: string }>(
          '/documents/upload',
          formData,
          onProgress,
        );
        const firstRequest = MockXMLHttpRequest.instances[0];
        expect(firstRequest.headers.Authorization).toBe('Bearer expired-token');
        expect(firstRequest.withCredentials).toBe(true);
        firstRequest.respond(401, { message: 'Unauthorized' });

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(MockXMLHttpRequest.instances).toHaveLength(2);
        const retry = MockXMLHttpRequest.instances[1];
        expect(retry.headers.Authorization).toBe('Bearer new-token');
        retry.upload.onprogress?.({
          lengthComputable: true,
          loaded: 50,
          total: 100,
        } as ProgressEvent);
        retry.respond(201, { id: 'doc-1' });

        await expect(result).resolves.toEqual({ id: 'doc-1' });
        expect(onProgress).toHaveBeenCalledWith(50);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(getAccessToken()).toBe('new-token');
      });

      it('rejects with the parsed server validation body', async () => {
        const result = uploadWithProgress('/documents/upload', new FormData());
        MockXMLHttpRequest.instances[0].respond(400, {
          statusCode: 400,
          message: 'Unsupported file type',
        });

        await expect(result).rejects.toEqual({
          statusCode: 400,
          message: 'Unsupported file type',
        });
      });

      it('aborts the active XHR when its signal is cancelled', async () => {
        const controller = new AbortController();
        const result = uploadWithProgress(
          '/documents/upload',
          new FormData(),
          undefined,
          controller.signal,
        );
        controller.abort();

        await expect(result).rejects.toMatchObject({ name: 'AbortError' });
      });
    });
  });
});
