import {
  validateFileType,
  handleFileUpload,
  handleMultipleFileUploads,
  handleDragDrop,
  handleDragOver,
  formatFileSize,
  getFileExtension,
  isImageFile,
  FileUploadResult,
  FileValidationResult,
} from './fileUpload';

describe('fileUpload utility', () => {
  describe('validateFileType', () => {
    it('should accept PDF files', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = validateFileType(file);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept image files (JPEG, PNG, GIF, WebP, SVG)', () => {
      const imageTypes = [
        { name: 'test.jpg', type: 'image/jpeg' },
        { name: 'test.jpeg', type: 'image/jpeg' },
        { name: 'test.png', type: 'image/png' },
        { name: 'test.gif', type: 'image/gif' },
        { name: 'test.webp', type: 'image/webp' },
        { name: 'test.svg', type: 'image/svg+xml' },
      ];

      imageTypes.forEach(({ name, type }) => {
        const file = new File(['test'], name, { type });
        const result = validateFileType(file);

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should accept DOC and DOCX files', () => {
      const docFile = new File(['test'], 'test.doc', {
        type: 'application/msword',
      });
      const docxFile = new File(['test'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      expect(validateFileType(docFile).isValid).toBe(true);
      expect(validateFileType(docxFile).isValid).toBe(true);
    });

    it('should reject unsupported file types', () => {
      const file = new File(['test'], 'test.exe', {
        type: 'application/x-msdownload',
      });
      const result = validateFileType(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File type not supported');
    });

    it('should reject files larger than 10MB', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.pdf', {
        type: 'application/pdf',
      });
      const result = validateFileType(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size exceeds 10MB');
    });

    it('should accept files under 10MB', () => {
      const smallContent = new Array(1024).fill('a').join('');
      const file = new File([smallContent], 'small.pdf', {
        type: 'application/pdf',
      });
      const result = validateFileType(file);

      expect(result.isValid).toBe(true);
    });
  });

  describe('handleFileUpload', () => {
    it('should successfully upload a valid file and return signed URL', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = await handleFileUpload(file);

      expect(result.success).toBe(true);
      expect(result.signedUrl).toBeDefined();
      expect(result.signedUrl).toContain('storage.example.com');
      expect(result.signedUrl).toContain('test.pdf');
      expect(result.file).toBe(file);
      expect(result.error).toBeUndefined();
    });

    it('should fail to upload an invalid file type', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = await handleFileUpload(file);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.signedUrl).toBeUndefined();
    });

    it('should fail to upload a file that is too large', async () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.pdf', {
        type: 'application/pdf',
      });
      const result = await handleFileUpload(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File size exceeds');
    });
  });

  describe('handleMultipleFileUploads', () => {
    it('should upload multiple valid files', async () => {
      const files = [
        new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['test3'], 'test3.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
      ];

      const results = await handleMultipleFileUploads(files);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.signedUrl).toBeDefined();
      });
    });

    it('should handle mix of valid and invalid files', async () => {
      const files = [
        new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'test2.txt', { type: 'text/plain' }),
      ];

      const results = await handleMultipleFileUploads(files);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('handleDragDrop', () => {
    it('should extract files from drag event', () => {
      const file1 = new File(['test1'], 'test1.pdf', {
        type: 'application/pdf',
      });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });

      const mockDataTransfer = {
        files: [file1, file2],
      } as unknown as DataTransfer;

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: mockDataTransfer,
      } as unknown as DragEvent;

      const files = handleDragDrop(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(files).toHaveLength(2);
      expect(files[0]).toBe(file1);
      expect(files[1]).toBe(file2);
    });

    it('should return empty array if no files in drag event', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: null,
      } as unknown as DragEvent;

      const files = handleDragDrop(mockEvent);

      expect(files).toHaveLength(0);
    });
  });

  describe('handleDragOver', () => {
    it('should prevent default behavior', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as DragEvent;

      handleDragOver(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('test.pdf')).toBe('.pdf');
      expect(getFileExtension('test.doc')).toBe('.doc');
      expect(getFileExtension('test.JPEG')).toBe('.jpeg');
      expect(getFileExtension('document.name.with.dots.docx')).toBe('.docx');
    });

    it('should return empty string for files without extension', () => {
      expect(getFileExtension('noextension')).toBe('');
    });
  });

  describe('isImageFile', () => {
    it('should identify image files', () => {
      const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const pdfFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });

      expect(isImageFile(imageFile)).toBe(true);
      expect(isImageFile(pdfFile)).toBe(false);
    });
  });
});
