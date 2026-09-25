import * as fs from 'fs';

export function isEnoentError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  );
}

/**
 * Unlink a file without treating an already-missing file as an error.
 * Callers that need to surface other filesystem errors should let them throw.
 */
export function unlinkFileIfPresent(filePath: string): void {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    if (!isEnoentError(error)) {
      throw error;
    }
  }
}
