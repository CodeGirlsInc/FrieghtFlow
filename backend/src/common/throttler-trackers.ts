import { ExecutionContext } from '@nestjs/common';

/**
 * Tracker for shipment creation.
 *
 * Issue BE-252: the previous implementation decoded the JWT payload without
 * verifying the signature, allowing a forged token to select any user's
 * rate-limit bucket.
 *
 * Fix: only use `request.user.id` which is set by JwtAuthGuard after
 * signature verification.  Fall back to IP for unauthenticated requests.
 * JwtAuthGuard must run before ThrottlerGuard for this to be effective.
 */
export const shipmentCreateTracker = (context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<{
    ip?: string;
    user?: { id?: string };
  }>();

  // request.user is populated only after JwtAuthGuard has verified the token.
  // Never read from raw headers here — that path is unverified.
  if (typeof request.user?.id === 'string' && request.user.id.length > 0) {
    return request.user.id;
  }

  return request.ip ?? 'anonymous';
};

/**
 * Tracker for forgot-password — keys by the target email only.
 *
 * This ensures that repeated password-reset requests for the same email
 * address are throttled regardless of source IP diversity.
 */
export const forgotPasswordTracker = (context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<{
    body?: { email?: string };
  }>();

  const email = (request.body?.email ?? '').toLowerCase().trim();

  return `fp:${email}`;
};
