import { ExecutionContext } from '@nestjs/common';

/**
 * Tracker for shipment creation — keys by authenticated user ID, falling
 * back to IP for unauthenticated requests.
 */
export const shipmentCreateTracker = (context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<{
    ip?: string;
    user?: { id?: string };
  }>();

  return request.user?.id ?? request.ip ?? 'anonymous';
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
