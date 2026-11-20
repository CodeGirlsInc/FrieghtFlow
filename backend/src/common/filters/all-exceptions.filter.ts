import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * One error contract for the whole API:
 * `{ statusCode, code, message, details?, path, timestamp }`
 *
 * Database constraint errors are mapped to safe HTTP responses:
 * - 23505 (unique violation)  → 409 CONFLICT
 * - 23503 (FK violation)      → 409 CONFLICT
 * - 22P02 (invalid uuid input) → 400 BAD_REQUEST
 *
 * No SQL text or table names are included in the response body.
 * Unexpected errors are logged and returned as a generic 500.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: unknown;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      code = HttpStatus[statusCode] ?? 'ERROR';
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else {
        const parsed = body as Record<string, unknown>;
        message = (parsed.message as string | string[]) ?? exception.message;
        if (typeof parsed.code === 'string') code = parsed.code;
        if (parsed.details !== undefined) details = parsed.details;
      }
    } else {
      // Map well-known Postgres error codes to safe HTTP responses.
      const pgCode = this.extractPgCode(exception);
      if (pgCode === '23505') {
        // Unique constraint violation
        statusCode = HttpStatus.CONFLICT;
        code = 'CONFLICT';
        message = 'Resource already exists';
        this.logger.warn(`Unique violation at ${request.url}`);
      } else if (pgCode === '23503') {
        // Foreign key constraint violation
        statusCode = HttpStatus.CONFLICT;
        code = 'CONFLICT';
        message = 'Referenced resource not found or constraint violated';
        this.logger.warn(`FK violation at ${request.url}`);
      } else if (pgCode === '22P02') {
        // Invalid input syntax (e.g. malformed UUID)
        statusCode = HttpStatus.BAD_REQUEST;
        code = 'BAD_REQUEST';
        message = 'Invalid input format';
        this.logger.warn(`Invalid input syntax at ${request.url}`);
      } else {
        this.logger.error(
          exception instanceof Error ? exception.stack : String(exception),
        );
      }
    }

    if (response.headersSent) return;

    response.status(statusCode).json({
      statusCode,
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private extractPgCode(exception: unknown): string | undefined {
    if (typeof exception !== 'object' || exception === null) return undefined;
    const e = exception as {
      code?: unknown;
      driverError?: { code?: unknown };
    };
    const raw = e.code ?? e.driverError?.code;
    return typeof raw === 'string' ? raw : undefined;
  }
}
