export const UPLOAD_CONFIG = {
  // File size limits (in bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB

  // Allowed file types
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/tiff',
    'image/tif',
  ],

  // Allowed file extensions
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif'],

  // Upload directories
  LOCAL_UPLOAD_DIR: './uploads/shipping-documents',
  TEMP_UPLOAD_DIR: './uploads/temp',

  // S3 Configuration
  S3_BUCKET: process.env.AWS_S3_BUCKET || 'shipping-documents-bucket',
  S3_REGION: process.env.AWS_REGION || 'us-east-1',
  S3_PREFIX: 'shipping-documents/',

  // File naming
  GENERATE_UNIQUE_FILENAME: true,
  PRESERVE_ORIGINAL_NAME: true,
};

export const DOCUMENT_TYPE_VALIDATION = {
  BILL_OF_LADING: {
    requiredFields: ['shipmentId'],
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  COMMERCIAL_INVOICE: {
    requiredFields: ['shipmentId'],
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 5 * 1024 * 1024,
  },
  PACKING_LIST: {
    requiredFields: [],
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 3 * 1024 * 1024,
  },
};
