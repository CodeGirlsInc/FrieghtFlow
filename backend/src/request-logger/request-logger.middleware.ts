import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const SENSITIVE_HEADERS = ['authorization', 'cookie', 'x-api-key'];

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = uuidv4();
    (req as any).correlationId = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);

    const redactedHeaders = { ...req.headers };
    for (const h of SENSITIVE_HEADERS) {
      if (redactedHeaders[h]) redactedHeaders[h] = '[REDACTED]';
    }

    const start = Date.now();
    this.logger.log(`--> ${req.method} ${req.path} [${correlationId}]`);

    res.on('finish', () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'log';
      this.logger[level](`<-- ${res.statusCode} ${req.method} ${req.path} ${duration}ms [${correlationId}]`);
    });

    next();
  }
}
