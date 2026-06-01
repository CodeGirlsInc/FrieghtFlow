Rate Limiter

This package exposes `RateLimiterModule` which applies an express-based rate limiter middleware.

When the limit is exceeded, responses return `429 Too Many Requests` and include a `Retry-After` header.
