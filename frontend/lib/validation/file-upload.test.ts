import {
  validateFile,
  partitionValidFiles,
  buildFileAcceptAttribute,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from './file-upload';

function makeFile(name: string, sizeBytes: number): File {
  const file = new File(['x'.repeat(Math.min(sizeBytes, 1024))], name);
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

describe('validateFile', () => {
  it('accepts every allowed extension', () => {
    for (const ext of ALLOWED_FILE_EXTENSIONS) {
      expect(validateFile(makeFile(`file${ext}`, 1024))).toBeNull();
    }
  });

  it('is case-insensitive on extension', () => {
    expect(validateFile(makeFile('Document.PDF', 1024))).toBeNull();
  });

  it('rejects a disallowed extension', () => {
    expect(validateFile(makeFile('script.exe', 1024))).toMatch(/unsupported file type/);
  });

  it('rejects a file with no extension', () => {
    expect(validateFile(makeFile('README', 1024))).toMatch(/unsupported file type/);
  });

  it('accepts a file exactly at the size limit', () => {
    expect(validateFile(makeFile('big.pdf', MAX_FILE_SIZE_BYTES))).toBeNull();
  });

  it('rejects a file over the size limit', () => {
    expect(validateFile(makeFile('big.pdf', MAX_FILE_SIZE_BYTES + 1))).toMatch(/too large/);
  });
});

describe('partitionValidFiles', () => {
  it('splits a mixed FileList into valid files and error messages', () => {
    const ok = makeFile('ok.pdf', 1024);
    const badType = makeFile('bad.exe', 1024);
    const badSize = makeFile('huge.png', MAX_FILE_SIZE_BYTES + 1);

    const { valid, errors } = partitionValidFiles([ok, badType, badSize]);

    expect(valid).toEqual([ok]);
    expect(errors).toHaveLength(2);
  });

  it('returns everything as valid when there are no problems', () => {
    const files = [makeFile('a.pdf', 1024), makeFile('b.png', 1024)];
    const { valid, errors } = partitionValidFiles(files);

    expect(valid).toEqual(files);
    expect(errors).toEqual([]);
  });
});

describe('buildFileAcceptAttribute', () => {
  const accept = buildFileAcceptAttribute();
  const tokens = accept.split(',');

  it('contains every allowed extension as its own token', () => {
    for (const ext of ALLOWED_FILE_EXTENSIONS) {
      expect(tokens).toContain(ext);
    }
  });

  it('contains no extension the validator would reject', () => {
    // Anything the picker offers must survive validateFile, otherwise the user
    // can select a file in the OS dialog and only be told no on submit.
    for (const token of tokens) {
      if (token.startsWith('.')) {
        expect(ALLOWED_FILE_EXTENSIONS).toContain(token);
      }
    }
    for (const rejected of ['.gif', '.bmp', '.tiff', '.exe', '.zip', '.svg']) {
      expect(tokens).not.toContain(rejected);
    }
  });

  it('contains no wildcard MIME type that would admit a rejected type', () => {
    expect(accept).not.toContain('*');
    for (const wildcard of ['image/*', 'application/*', '*/*']) {
      expect(tokens).not.toContain(wildcard);
    }
  });

  it('lists the extension set first, then the MIME types, comma separated', () => {
    expect(tokens.slice(0, ALLOWED_FILE_EXTENSIONS.length)).toEqual(
      ALLOWED_FILE_EXTENSIONS,
    );
    expect(accept).toBe(tokens.join(','));
  });

  it('includes useful MIME types for the allowed extensions', () => {
    expect(tokens).toContain('application/pdf');
    expect(tokens).toContain('image/png');
    expect(tokens).toContain('image/jpeg');
    expect(tokens).toContain('image/webp');
  });

  it('emits each token once, so .jpg and .jpeg do not duplicate image/jpeg', () => {
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it('is stable across calls', () => {
    expect(buildFileAcceptAttribute()).toBe(accept);
  });
});
