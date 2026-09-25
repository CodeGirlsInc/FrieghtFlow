import { ExecutionContext } from '@nestjs/common';
import * as fs from 'fs';
import { firstValueFrom, throwError } from 'rxjs';
import { UploadCleanupInterceptor } from './upload-cleanup.interceptor';

function contextFor(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('UploadCleanupInterceptor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('removes the Multer file when validation or the controller fails', async () => {
    const request = {
      file: { path: '/uploads/rejected.pdf' },
    };
    const unlinkSpy = jest
      .spyOn(fs, 'unlinkSync')
      .mockImplementation(() => undefined);
    const interceptor = new UploadCleanupInterceptor();
    const error = new Error('validation failed');

    await expect(
      firstValueFrom(
        interceptor.intercept(contextFor(request), {
          handle: () => throwError(() => error),
        }),
      ),
    ).rejects.toBe(error);

    expect(unlinkSpy).toHaveBeenCalledWith('/uploads/rejected.pdf');
  });

  it('cleans all files once and preserves ENOENT as success', async () => {
    const request = {
      file: { path: '/uploads/rejected.pdf' },
      files: {
        file: [{ path: '/uploads/rejected.pdf' }],
        attachment: [{ path: '/uploads/also-rejected.pdf' }],
      },
    };
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {
      const error = Object.assign(new Error('not found'), { code: 'ENOENT' });
      throw error;
    });
    const interceptor = new UploadCleanupInterceptor();
    const error = new Error('service failed');

    await expect(
      firstValueFrom(
        interceptor.intercept(contextFor(request), {
          handle: () => throwError(() => error),
        }),
      ),
    ).rejects.toBe(error);

    expect(unlinkSpy).toHaveBeenCalledTimes(2);
    expect(unlinkSpy).toHaveBeenCalledWith('/uploads/rejected.pdf');
    expect(unlinkSpy).toHaveBeenCalledWith('/uploads/also-rejected.pdf');
  });
});
