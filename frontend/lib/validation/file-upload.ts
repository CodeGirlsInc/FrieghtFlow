/**
 * Shared client-side file validation for upload components
 * (DocumentUploadModal, DisputeForm evidence attachments).
 *
 * Validating before an upload starts means a user finds out immediately
 * that a file was rejected, instead of after a full upload attempt (or
 * worse, having an unvalidated file reach the backend).
 */

export const ALLOWED_FILE_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
];

/** 10 MB — matches the size limit documented for document/evidence uploads. */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * MIME type for each allowed extension, used to build the `accept` attribute
 * so the OS file picker offers better filtering (by declared type) on top of
 * the extension tokens. Note this is a *supplementary* convenience: no
 * wildcard (`image/*`) ever appears, because a wildcard would offer the user
 * a type that `validateFile` then rejects.
 */
const MIME_BY_EXTENSION: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

/**
 * Builds the value for an `<input type="file" accept="…">` directly from
 * ALLOWED_FILE_EXTENSIONS, so the OS file picker and `validateFile` agree by
 * construction and cannot drift apart.
 */
export function buildFileAcceptAttribute(): string {
  const tokens = new Set(ALLOWED_FILE_EXTENSIONS);
  for (const ext of ALLOWED_FILE_EXTENSIONS) {
    const mime = MIME_BY_EXTENSION[ext];
    // A Set, because several extensions legitimately share one MIME type
    // (.jpg and .jpeg are both image/jpeg) and the picker shouldn't list it twice.
    if (mime) tokens.add(mime);
  }
  return [...tokens].join(',');
}

function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot === -1 ? '' : fileName.slice(dot).toLowerCase();
}

/**
 * Returns an error message if `file` should be rejected, or `null` if it's
 * valid. Checks extension (not MIME type, which is unreliable/spoofable
 * client-side and unavailable in some drag-and-drop cases) and max size.
 */
export function validateFile(file: File): string | null {
  const extension = getExtension(file.name);
  if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
    return `"${file.name}" has an unsupported file type. Allowed: ${ALLOWED_FILE_EXTENSIONS.join(', ')}.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    return `"${file.name}" is too large (max ${maxMb}MB).`;
  }
  return null;
}

/** Splits a FileList/array into files that pass validateFile and error messages for those that don't. */
export function partitionValidFiles(files: FileList | File[]): {
  valid: File[];
  errors: string[];
} {
  const valid: File[] = [];
  const errors: string[] = [];
  for (const file of Array.from(files)) {
    const error = validateFile(file);
    if (error) {
      errors.push(error);
    } else {
      valid.push(file);
    }
  }
  return { valid, errors };
}
