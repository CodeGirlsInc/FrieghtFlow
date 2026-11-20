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

export const SUPPORTED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export type VerifiedDocumentType = {
  mimetype: string;
  extension: string;
};

type DocumentTypeDefinition = VerifiedDocumentType & {
  matches: (buffer: Buffer) => boolean;
};

const startsWith = (buffer: Buffer, bytes: number[]): boolean =>
  bytes.every((byte, index) => buffer[index] === byte);

const hasZipSignature = (buffer: Buffer): boolean =>
  startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]) ||
  startsWith(buffer, [0x50, 0x4b, 0x05, 0x06]) ||
  startsWith(buffer, [0x50, 0x4b, 0x07, 0x08]);

const hasZipEntry = (buffer: Buffer, entry: string): boolean =>
  buffer.includes(Buffer.from(entry, 'utf8'));

const definitions: DocumentTypeDefinition[] = [
  {
    mimetype: 'application/pdf',
    extension: '.pdf',
    matches: (buffer) => startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d]),
  },
  {
    mimetype: 'image/png',
    extension: '.png',
    matches: (buffer) =>
      startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  {
    mimetype: 'image/jpeg',
    extension: '.jpg',
    matches: (buffer) => startsWith(buffer, [0xff, 0xd8, 0xff]),
  },
  {
    mimetype: 'image/gif',
    extension: '.gif',
    matches: (buffer) =>
      buffer.subarray(0, 6).toString('ascii') === 'GIF87a' ||
      buffer.subarray(0, 6).toString('ascii') === 'GIF89a',
  },
  {
    mimetype: 'image/webp',
    extension: '.webp',
    matches: (buffer) =>
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  {
    mimetype:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: '.docx',
    matches: (buffer) =>
      hasZipSignature(buffer) &&
      hasZipEntry(buffer, '[Content_Types].xml') &&
      hasZipEntry(buffer, 'word/'),
  },
  {
    mimetype:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: '.xlsx',
    matches: (buffer) =>
      hasZipSignature(buffer) &&
      hasZipEntry(buffer, '[Content_Types].xml') &&
      hasZipEntry(buffer, 'xl/'),
  },
  {
    // Legacy .doc/.xls files use the OLE compound-file signature. The
    // claimed MIME type still distinguishes the two legacy Office formats.
    mimetype: 'application/msword',
    extension: '.doc',
    matches: (buffer) =>
      startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
  },
  {
    mimetype: 'application/vnd.ms-excel',
    extension: '.xls',
    matches: (buffer) =>
      startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
  },
];

export function isSupportedDocumentMimeType(mimetype: string): boolean {
  return SUPPORTED_DOCUMENT_MIME_TYPES.has(mimetype);
}

/**
 * Verifies a claimed MIME type against file magic bytes and returns the
 * canonical extension to use for storage. Client-provided extensions are never
 * trusted for the stored filename.
 */
export function verifyDocumentFileType(
  buffer: Buffer,
  claimedMimetype: string,
): VerifiedDocumentType {
  const definition = definitions.find(
    (candidate) => candidate.mimetype === claimedMimetype,
  );

  if (!definition || !Buffer.isBuffer(buffer) || !definition.matches(buffer)) {
    throw new Error(
      `File content does not match the declared type (${claimedMimetype})`,
    );
  }

  return {
    mimetype: definition.mimetype,
    extension: definition.extension,
  };
}
