import {
  isSupportedDocumentMimeType,
  verifyDocumentFileType,
} from './document-file.util';

const signatures = {
  pdf: Buffer.from('%PDF-1.7\ncontent'),
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  jpeg: Buffer.from([0xff, 0xd8, 0xff, 0xdb]),
  gif: Buffer.from('GIF89a-content'),
  webp: Buffer.concat([
    Buffer.from('RIFF'),
    Buffer.from([0, 0, 0, 0]),
    Buffer.from('WEBPcontent'),
  ]),
  zip: Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]),
    Buffer.from('[Content_Types].xmlword/document.xml'),
  ]),
  xlsxZip: Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]),
    Buffer.from('[Content_Types].xmlxl/workbook.xml'),
  ]),
  ole: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
};

describe('document file provenance', () => {
  it.each([
    ['application/pdf', signatures.pdf, '.pdf'],
    ['image/png', signatures.png, '.png'],
    ['image/jpeg', signatures.jpeg, '.jpg'],
    ['image/gif', signatures.gif, '.gif'],
    ['image/webp', signatures.webp, '.webp'],
    [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      signatures.zip,
      '.docx',
    ],
    [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      signatures.xlsxZip,
      '.xlsx',
    ],
    ['application/msword', signatures.ole, '.doc'],
    ['application/vnd.ms-excel', signatures.ole, '.xls'],
  ])(
    'verifies %s signatures and returns a canonical extension',
    (mimetype, buffer, extension) => {
      expect(verifyDocumentFileType(buffer, mimetype)).toEqual({
        mimetype,
        extension,
      });
    },
  );

  it('rejects unsupported MIME types', () => {
    expect(isSupportedDocumentMimeType('application/x-msdownload')).toBe(false);
  });

  it('rejects a generic ZIP masquerading as an OOXML document', () => {
    expect(() =>
      verifyDocumentFileType(
        Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]),
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ),
    ).toThrow('does not match');
  });

  it('rejects content that does not match the claimed MIME type', () => {
    expect(() => verifyDocumentFileType(signatures.pdf, 'image/png')).toThrow(
      'does not match',
    );
    expect(() =>
      verifyDocumentFileType(Buffer.from('plain text'), 'application/pdf'),
    ).toThrow('does not match');
  });
});
