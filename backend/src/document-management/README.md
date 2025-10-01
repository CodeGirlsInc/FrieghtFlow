# Document Management Module

A comprehensive document management system for handling shipping documents including bills of lading, invoices, certificates, and other shipping-related documents.

## Features

- **Document Upload & Storage**: Secure file upload with validation and storage options (local/S3)
- **Document Verification**: Automated and manual document verification with OCR support
- **Access Control**: Role-based access control with audit logging
- **Document Search**: Advanced search and filtering capabilities
- **Document Lifecycle**: Complete document lifecycle management from upload to archival
- **Compliance Tracking**: Track document compliance and expiry dates
- **Analytics**: Document statistics and usage analytics

## Entities

### Document
Main document entity storing metadata and file references.

**Key Fields:**
- `id`: Unique document identifier
- `originalName`: Original filename
- `fileName`: Generated storage filename
- `filePath`: File storage path
- `documentType`: Type of document (BILL_OF_LADING, COMMERCIAL_INVOICE, etc.)
- `status`: Current document status (UPLOADED, PROCESSING, VALIDATED, etc.)
- `priority`: Document priority level
- `shipmentId`: Associated shipment ID
- `uploadedBy`: User who uploaded the document
- `isConfidential`: Confidentiality flag
- `isRequired`: Required document flag
- `expiryDate`: Document expiry date
- `metadata`: Additional document metadata

### DocumentVerification
Tracks document verification processes and results.

**Key Fields:**
- `id`: Verification identifier
- `documentId`: Associated document ID
- `verificationType`: Type of verification (AUTOMATIC, MANUAL, OCR, etc.)
- `status`: Verification status
- `confidenceScore`: Verification confidence score
- `ocrText`: Extracted text from OCR
- `extractedData`: Structured data extracted from document
- `signatureValid`: Digital signature validation result

### DocumentAccessLog
Audit trail for document access and actions.

**Key Fields:**
- `id`: Log entry identifier
- `documentId`: Associated document ID
- `userId`: User who performed the action
- `action`: Action performed (VIEW, DOWNLOAD, EDIT, etc.)
- `ipAddress`: User's IP address
- `userAgent`: User's browser/client information
- `metadata`: Additional log metadata

## API Endpoints

### Document Management

#### Upload Document
```http
POST /documents/upload
Content-Type: multipart/form-data

Fields:
- file: Document file
- documentType: Type of document
- shipmentId: Associated shipment ID
- description: Document description
- priority: Document priority
- isConfidential: Confidentiality flag
- isRequired: Required document flag
- countryOfOrigin: Origin country
- countryOfDestination: Destination country
- customsCode: Customs classification code
- weight: Shipment weight
- value: Shipment value
- currency: Currency code
- expiryDate: Document expiry date
- tags: Document tags
```

#### Get Documents
```http
GET /documents?limit=20&offset=0&documentType=BILL_OF_LADING&status=UPLOADED
```

#### Get Document by ID
```http
GET /documents/{id}
```

#### Download Document
```http
GET /documents/{id}/download
```

#### Update Document
```http
PUT /documents/{id}
Content-Type: application/json

{
  "description": "Updated description",
  "priority": "HIGH",
  "status": "VALIDATED"
}
```

#### Delete Document
```http
DELETE /documents/{id}
```

### Document Verification

#### Create Verification
```http
POST /documents/{id}/verify
Content-Type: application/json

{
  "verificationType": "AUTOMATIC",
  "verificationNotes": "Automated verification"
}
```

### Document Analytics

#### Get Document Statistics
```http
GET /documents/stats
```

#### Get Access Logs
```http
GET /documents/{id}/access-logs?limit=50
```

### Specialized Endpoints

#### Get Documents by Shipment
```http
GET /documents/shipment/{shipmentId}
```

#### Search Documents
```http
GET /documents/search/{query}?limit=20
```

#### Get Expired Documents
```http
GET /documents/expired/documents
```

#### Get Confidential Documents
```http
GET /documents/confidential/documents
```

#### Get Required Documents
```http
GET /documents/required/documents
```

## Document Types

- `BILL_OF_LADING`: Bill of lading
- `COMMERCIAL_INVOICE`: Commercial invoice
- `PACKING_LIST`: Packing list
- `CERTIFICATE_OF_ORIGIN`: Certificate of origin
- `SHIPPING_MANIFEST`: Shipping manifest
- `CUSTOMS_DECLARATION`: Customs declaration
- `INSURANCE_CERTIFICATE`: Insurance certificate
- `PHYTOSANITARY_CERTIFICATE`: Phytosanitary certificate
- `HEALTH_CERTIFICATE`: Health certificate
- `EXPORT_LICENSE`: Export license
- `IMPORT_LICENSE`: Import license
- `OTHER`: Other document types

## Document Status

- `UPLOADED`: Document uploaded
- `PROCESSING`: Document being processed
- `VALIDATED`: Document validated
- `REJECTED`: Document rejected
- `ARCHIVED`: Document archived
- `EXPIRED`: Document expired

## Document Priority

- `LOW`: Low priority
- `MEDIUM`: Medium priority
- `HIGH`: High priority
- `URGENT`: Urgent priority

## Verification Types

- `AUTOMATIC`: Automatic verification
- `MANUAL`: Manual verification
- `OCR`: OCR-based verification
- `SIGNATURE`: Signature verification
- `DIGITAL_SIGNATURE`: Digital signature verification

## Configuration

### Environment Variables

```env
# File Storage
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_MIME_TYPES=application/pdf,image/jpeg,image/png
LOCAL_UPLOAD_DIR=./uploads/documents

# S3 Storage (optional)
USE_S3_STORAGE=false
S3_BUCKET=your-bucket-name
S3_PREFIX=documents/
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### Database Configuration

The module uses PostgreSQL with the following tables:
- `documents`: Main document storage
- `document_verifications`: Verification tracking
- `document_access_logs`: Access audit trail

## Security Features

- **File Validation**: MIME type and size validation
- **Access Control**: User-based access permissions
- **Audit Logging**: Complete access and action logging
- **Confidentiality**: Confidential document protection
- **Checksum Verification**: File integrity checking
- **Secure Storage**: Local and S3 storage options

## Performance Features

- **Pagination**: Efficient pagination for large datasets
- **Indexing**: Database indexes for fast queries
- **Caching**: Optional caching for frequently accessed documents
- **Async Processing**: Background processing for verification
- **File Streaming**: Efficient file download streaming

## Testing

The module includes comprehensive test coverage:

- **Unit Tests**: Service and controller unit tests
- **Integration Tests**: End-to-end API tests
- **E2E Tests**: Complete workflow testing

Run tests:
```bash
npm run test
npm run test:e2e
```

## Usage Examples

### Upload a Bill of Lading

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('documentType', 'BILL_OF_LADING');
formData.append('shipmentId', 'shipment-123');
formData.append('description', 'Bill of lading for shipment #12345');
formData.append('priority', 'HIGH');
formData.append('isRequired', 'true');
formData.append('countryOfOrigin', 'US');
formData.append('countryOfDestination', 'CA');

const response = await fetch('/documents/upload', {
  method: 'POST',
  body: formData,
});
```

### Search Documents

```typescript
const response = await fetch('/documents/search/invoice?limit=10');
const { documents, total } = await response.json();
```

### Create Verification

```typescript
const verification = await fetch(`/documents/${documentId}/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    verificationType: 'AUTOMATIC',
    verificationNotes: 'Automated verification process',
  }),
});
```

## Error Handling

The module provides comprehensive error handling:

- **Validation Errors**: Input validation with detailed error messages
- **File Errors**: File upload and processing errors
- **Permission Errors**: Access control violations
- **Storage Errors**: File storage and retrieval errors
- **Verification Errors**: Document verification failures

## Monitoring and Analytics

- **Document Statistics**: Count, size, and type statistics
- **Access Analytics**: User access patterns and frequency
- **Verification Metrics**: Verification success rates and processing times
- **Storage Analytics**: Storage usage and optimization insights
- **Compliance Tracking**: Document compliance and expiry monitoring
