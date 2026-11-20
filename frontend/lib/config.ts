/** Default local backend API URL. Keep aligned with the backend PORT default. */
export const DEFAULT_API_BASE = 'http://localhost:6006/api/v1';

function getApiBase(value: string | undefined): string {
  const configured = value ?? DEFAULT_API_BASE;
  let url: URL;

  try {
    url = new URL(configured);
  } catch {
    throw new Error('NEXT_PUBLIC_API_URL must be an absolute HTTP(S) URL');
  }

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error('NEXT_PUBLIC_API_URL must be an absolute HTTP(S) URL without credentials or query');
  }

  return url.toString().replace(/\/$/, '');
}

export const API_BASE = getApiBase(process.env.NEXT_PUBLIC_API_URL);
export const SOCKET_ORIGIN = new URL(API_BASE).origin;
