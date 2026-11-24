import { API_BASE, DEFAULT_API_BASE, SOCKET_ORIGIN } from './config';

describe('frontend URL config', () => {
  it('uses the backend local default and derives the socket origin', () => {
    expect(DEFAULT_API_BASE).toBe('http://localhost:6006/api/v1');
    expect(API_BASE).toBe(DEFAULT_API_BASE);
    expect(SOCKET_ORIGIN).toBe('http://localhost:6006');
  });

  it('derives the socket origin from a configured API URL using URL parsing', async () => {
    const previousValue = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.test/proxy/api/v1/';

    try {
      await jest.isolateModulesAsync(async () => {
        const config = await import('./config');
        expect(config.API_BASE).toBe('https://api.example.test/proxy/api/v1');
        expect(config.SOCKET_ORIGIN).toBe('https://api.example.test');
      });
    } finally {
      if (previousValue === undefined) delete process.env.NEXT_PUBLIC_API_URL;
      else process.env.NEXT_PUBLIC_API_URL = previousValue;
    }
  });

  it('fails fast when the configured API URL is not an absolute HTTP(S) URL', async () => {
    const previousValue = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = '/api/v1';

    try {
      await expect(
        jest.isolateModulesAsync(async () => import('./config')),
      ).rejects.toThrow('NEXT_PUBLIC_API_URL must be an absolute HTTP(S) URL');
    } finally {
      if (previousValue === undefined) delete process.env.NEXT_PUBLIC_API_URL;
      else process.env.NEXT_PUBLIC_API_URL = previousValue;
    }
  });
});
