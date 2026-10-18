import { ExecutionContext } from '@nestjs/common';

function getRequestUserId(request: {
  ip?: string;
  user?: { id?: string };
  headers?: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string>;
}): string | undefined {
  if (request.user?.id) {
    return request.user.id;
  }

  const authorizationHeader = request.headers?.authorization;
  const headerToken =
    typeof authorizationHeader === 'string'
      ? authorizationHeader.startsWith('Bearer ')
        ? authorizationHeader.slice(7)
        : authorizationHeader
      : Array.isArray(authorizationHeader)
        ? authorizationHeader[0]?.startsWith('Bearer ')
          ? authorizationHeader[0].slice(7)
          : authorizationHeader[0]
        : undefined;

  const cookieToken = request.cookies?.auth_token;
  const token = headerToken ?? cookieToken;

  if (!token) {
    return undefined;
  }

  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) {
      return undefined;
    }

    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(
      Buffer.from(normalized, 'base64').toString('utf8'),
    ) as { sub?: string };

    return typeof payload.sub === 'string' ? payload.sub : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Tracker for shipment creation — keys by authenticated user ID, falling
 * back to IP for unauthenticated requests.
 */
export const shipmentCreateTracker = (context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<{
    ip?: string;
    user?: { id?: string };
    headers?: Record<string, string | string[] | undefined>;
    cookies?: Record<string, string>;
  }>();

  return getRequestUserId(request) ?? request.ip ?? 'anonymous';
};

/**
 * Tracker for forgot-password — keys by the target email only.
 *
 * This ensures that repeated password-reset requests for the same email
 * address are throttled **regardless of source IP diversity**: an attacker
 * rotating IPs to spam a single victim still hits the per-email ceiling.
 * Different target emails each get their own independent budget, so
 * enumerating many emails is not blocked (the endpoint returns a generic
 * message anyway, preventing enumeration).
 */
export const forgotPasswordTracker = (context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<{
    body?: { email?: string };
  }>();

  const email = (request.body?.email ?? '').toLowerCase().trim();

  return `fp:${email}`;
};
