import type { NextFunction, Request, Response } from 'express';

/**
 * Baseline security headers for the API (Helmet-style, dependency free).
 * The strict CSP is skipped for the Swagger UI under /docs, which needs
 * inline scripts and styles.
 */
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  if (!req.path.startsWith('/docs')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none'",
    );
  }
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=15552000; includeSubDomains',
    );
  }
  next();
}
