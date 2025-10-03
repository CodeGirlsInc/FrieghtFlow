/**
 * File Upload Utility
 * Supports drag-and-drop uploads and validates file types before submission
 */

// Allowed MIME types for file uploads
const ALLOWED_MIME_TYPES = [
  // PDF files
  'application/pdf',
  // Image files
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // DOC/DOCX files
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.doc',
  '.docx',
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface FileUploadResult {
  success: boolean;
  signedUrl?: string;
  error?: string;
  file?: File;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates if a file type is allowed
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateFileType(file: File): FileValidationResult {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    // Fallback to extension check if MIME type is not recognized
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        isValid: false,
        error: `File type not supported. Please upload PDF, image (JPG, PNG, GIF, WebP, SVG), or DOC/DOCX files only.`,
      };
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds 10MB limit. Please upload a smaller file.`,
    };
  }

  return { isValid: true };
}

/**
 * Generates a mock signed URL for file upload
 * @param file - The file to generate a URL for
 * @returns Mock signed URL (to be replaced with backend integration)
 */
function generateMockSignedUrl(file: File): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const fileName = encodeURIComponent(file.name);

  return `https://storage.example.com/uploads/${randomId}/${timestamp}/${fileName}?signature=mock_signature_${randomId}`;
}

/**
 * Handles file upload with validation
 * @param file - The file to upload
 * @returns Upload result with signed URL or error
 */
export async function handleFileUpload(file: File): Promise<FileUploadResult> {
  // Validate file type
  const validation = validateFileType(file);

  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  try {
    // Simulate async upload delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate mock signed URL
    const signedUrl = generateMockSignedUrl(file);

    return {
      success: true,
      signedUrl,
      file,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}

/**
 * Handles multiple file uploads with validation
 * @param files - The files to upload
 * @returns Array of upload results
 */
export async function handleMultipleFileUploads(
  files: File[]
): Promise<FileUploadResult[]> {
  const uploadPromises = files.map((file) => handleFileUpload(file));
  return Promise.all(uploadPromises);
}

/**
 * Handles drag-and-drop events
 * @param event - The drag event
 * @returns Array of files from the drop event
 */
export function handleDragDrop(event: DragEvent): File[] {
  event.preventDefault();
  event.stopPropagation();

  const files: File[] = [];

  if (event.dataTransfer?.files) {
    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      const file = event.dataTransfer.files[i];
      if (file) {
        files.push(file);
      }
    }
  }

  return files;
}

/**
 * Handles drag over event (required for drag-and-drop)
 * @param event - The drag event
 */
export function handleDragOver(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * Handles file input change event
 * @param event - The input change event
 * @returns Array of files from the input
 */
export function handleFileInputChange(
  event: React.ChangeEvent<HTMLInputElement>
): File[] {
  const files: File[] = [];

  if (event.target.files) {
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (file) {
        files.push(file);
      }
    }
  }

  return files;
}

/**
 * Gets a human-readable file size string
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Gets file extension from filename
 * @param filename - The filename
 * @returns File extension including the dot
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : '';
}

/**
 * Checks if a file type is an image
 * @param file - The file to check
 * @returns True if the file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
