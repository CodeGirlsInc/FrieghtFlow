import { Request } from 'express';
import { extractJwtFromRequest } from './jwt.strategy';

describe('extractJwtFromRequest', () => {
  it('prefers a Bearer token when the request also has an auth_token cookie', () => {
    const request = {
      headers: {
        authorization: 'Bearer token-for-user-b',
        cookie: 'auth_token=token-for-user-a',
      },
    } as Request;

    expect(extractJwtFromRequest(request)).toBe('token-for-user-b');
  });

  it('falls back to the auth_token cookie when there is no Bearer token', () => {
    const request = {
      headers: { cookie: 'auth_token=cookie-token' },
    } as Request;

    expect(extractJwtFromRequest(request)).toBe('cookie-token');
  });
});
