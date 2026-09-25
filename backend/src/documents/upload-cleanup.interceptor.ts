import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, Observable, throwError } from 'rxjs';
import { unlinkFileIfPresent } from './document-file.util';

type UploadedRequest = Request & {
  file?: Express.Multer.File | Express.Multer.File[];
  files?: Express.Multer.File[] | Record<string, Express.Multer.File[]>;
};

/**
 * Removes files produced by the document Multer interceptor when the request
 * fails after multipart parsing (validation, controller, or service errors).
 * The interceptor is deliberately placed outside FileInterceptor so it also
 * observes errors raised while Multer is handing control to Nest.
 */
@Injectable()
export class UploadCleanupInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UploadCleanupInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<UploadedRequest>();

    return next.handle().pipe(
      catchError((error: unknown) => {
        this.cleanup(request);
        return throwError(() => error);
      }),
    );
  }

  private cleanup(request: UploadedRequest): void {
    const paths = new Set<string>();

    this.addFilePaths(request.file, paths);
    this.addFilePaths(request.files, paths);

    for (const filePath of paths) {
      try {
        unlinkFileIfPresent(filePath);
      } catch (error) {
        this.logger.error(
          `Failed to clean up rejected document upload ${filePath}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  private addFilePaths(
    files: UploadedRequest['file'] | UploadedRequest['files'],
    paths: Set<string>,
  ): void {
    if (!files) return;

    if (Array.isArray(files)) {
      for (const file of files) {
        if (file.path) paths.add(file.path);
      }
      return;
    }

    const directFile = files as unknown as { path?: unknown };
    if (typeof directFile.path === 'string') {
      paths.add(directFile.path);
      return;
    }

    const fieldMap = files as unknown as Record<string, Express.Multer.File[]>;
    for (const fieldFiles of Object.values(fieldMap)) {
      if (!Array.isArray(fieldFiles)) continue;
      for (const file of fieldFiles) {
        if (typeof file.path === 'string') paths.add(file.path);
      }
    }
  }
}
