/**
 * Where to send a user when no (or an unusable) callback URL was supplied.
 */
export const DEFAULT_CALLBACK_URL = '/dashboard';

/**
 * Resolve a `?callbackUrl=` value to a path this app is willing to navigate
 * to after a successful login.
 *
 * `middleware.ts` writes `callbackUrl` when it redirects an anonymous
 * visitor to `/login`, but the query string is attacker-controlled too: a
 * link such as `/login?callbackUrl=https://evil.example` would otherwise
 * send a freshly authenticated user to an attacker site — a convincing
 * phishing step, because it follows a real login. `//evil.example` is
 * protocol-relative and equally unsafe.
 *
 * Only same-origin relative paths are accepted:
 * - it must start with a single `/` (so no scheme, no host, no `//`),
 * - it must not contain a backslash (browsers normalise `/\<host>` into a
 *   protocol-relative URL),
 * - it must not contain control characters.
 *
 * Anything else falls back to {@link DEFAULT_CALLBACK_URL}.
 */
export function safeCallbackUrl(raw: string | null | undefined): string {
  if (typeof raw !== 'string' || raw.length === 0) {
    return DEFAULT_CALLBACK_URL;
  }

  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return DEFAULT_CALLBACK_URL;
  }

  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    // Control characters (C0 range and DEL) have no place in a path and can
    // smuggle a redirect past a naive prefix check.
    if (code < 0x20 || code === 0x7f) {
      return DEFAULT_CALLBACK_URL;
    }
  }

  return raw;
}
