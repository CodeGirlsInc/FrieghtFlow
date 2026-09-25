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
