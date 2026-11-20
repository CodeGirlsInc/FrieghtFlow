export const ALLOWED_DOCUMENT_MIMETYPES: ReadonlySet<string> = new Set([
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

export function isAllowedDocumentMimeType(mimetype: string): boolean {
  return ALLOWED_DOCUMENT_MIMETYPES.has(mimetype);
}

export function unsupportedDocumentMimeTypeMessage(mimetype: string): string {
  return `Unsupported file type: ${mimetype}. Allowed: PDF, images, Word, Excel`;
}

const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];

const startsWith = (buffer: Buffer, signature: number[], offset = 0): boolean =>
  buffer.length >= offset + signature.length &&
  signature.every((byte, i) => buffer[offset + i] === byte);

/**
 * Checks that the file's leading bytes match the declared MIME type. The
 * `Content-Type` of a multipart part is client-controlled, so the allow-list
 * alone does not prove what was uploaded.
 */
export function contentMatchesMimeType(buffer: Buffer, mimetype: string): boolean {
  switch (mimetype) {
    case 'application/pdf':
      return startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
    case 'image/png':
      return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/jpeg':
      return startsWith(buffer, [0xff, 0xd8, 0xff]);
    case 'image/gif':
      return (
        startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
        startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
      );
    case 'image/webp':
      return (
        startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
        startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)
      );
    case 'application/msword':
    case 'application/vnd.ms-excel':
      return startsWith(buffer, OLE_SIGNATURE);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return startsWith(buffer, ZIP_SIGNATURE);
    default:
      return false;
  }
}
