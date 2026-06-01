import { Injectable, Inject, NestMiddleware } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private limiter: any;

  constructor(@Inject('RATE_LIMIT_OPTIONS') private options: any) {
    const windowMs = options?.windowMs ?? 60_000;
    const max = options?.max ?? 60;

    this.limiter = rateLimit({
      windowMs,
      max,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        const retryAfter = Math.ceil((res.getHeader('Retry-After') as any) || windowMs / 1000);
        res.setHeader('Retry-After', retryAfter.toString());
        res.status(429).json({ message: 'Too Many Requests' });
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    return this.limiter(req, res, next);
  }
}
