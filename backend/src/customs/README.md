# Customs Compliance Module

This module manages customs requirements, compliance checks, and document validation for international shipments. It ensures that shipments meet all regulatory requirements before allowing progression.

## Features

- **Customs Requirements Management**: Store and manage country-specific customs requirements
- **Document Validation**: Automated validation of customs documents with business rules
- **Compliance Checks**: Track and manage compliance verification processes
- **Shipment Integration**: Block shipment progression until compliance is satisfied
- **Route-Specific Rules**: Apply different requirements based on origin/destination countries

## Entities

### CustomsRequirement
- `id`: Unique identifier (UUID)
- `requirementCode`: Unique requirement code
- `name`: Requirement name
- `description`: Detailed description
- `type`: Type of requirement (document, compliance_check, declaration, permit, license)
- `originCountry`: Origin country code (ISO 3166-1 alpha-3)
- `destinationCountry`: Destination country code (ISO 3166-1 alpha-3)
- `shipmentType`: Shipment type (air, sea, road, rail)
- `cargoType`: Cargo type (general, hazardous, perishable, etc.)
- `isMandatory`: Whether this requirement is mandatory
- `isConditional`: Whether this requirement has conditions
- `conditions`: JSON string of conditions
- `validityDays`: Document validity period in days
- `validationRules`: JSON string of validation rules
- `documentFormat`: Required document format
- `minValue`/`maxValue`: Shipment value thresholds
- `status`: Requirement status (active, inactive, deprecated)
- `authority`: Customs authority that enforces this requirement
- `referenceUrl`: Link to official documentation

### CustomsDocument
- `id`: Unique identifier (UUID)
- `shipmentId`: Associated shipment ID
- `requirementId`: Associated requirement ID (optional)
- `documentType`: Type of document (commercial_invoice, packing_list, etc.)
- `fileName`: Original file name
- `fileUrl`: File URL or path
- `fileSize`: File size
- `mimeType`: MIME type of the file
- `status`: Document status (pending, under_review, approved, rejected, expired)
- `expiryDate`: Document expiry date
- `validationNotes`: Validation notes
- `rejectionReason`: Reason for rejection
- `uploadedBy`: User who uploaded the document
- `reviewedBy`: User who reviewed the document
- `reviewedAt`: Review timestamp
- `metadata`: Additional document metadata (JSON string)

### ComplianceCheck
- `id`: Unique identifier (UUID)
- `shipmentId`: Associated shipment ID
- `requirementId`: Associated requirement ID (optional)
- `checkType`: Type of check (document_validation, content_verification, etc.)
- `checkName`: Name of the check
- `description`: Check description
- `status`: Check status (pending, in_progress, passed, failed, waived, expired)
- `priority`: Check priority (low, medium, high, critical)
- `isAutomated`: Whether this check is automated
- `isMandatory`: Whether this check is mandatory
- `validationRules`: JSON string of validation rules
- `result`: JSON string of check results
- `notes`: Check notes
- `failureReason`: Reason for failure
- `performedBy`: User who performed the check
- `performedAt`: Performance timestamp
- `scheduledAt`: Scheduled execution time
- `completedAt`: Completion timestamp
- `retryCount`: Number of retries
- `maxRetries`: Maximum number of retries

## API Endpoints

### Requirements Management
- `POST /api/v1/customs-compliance/requirements` - Create requirement
- `GET /api/v1/customs-compliance/requirements` - Get all requirements (with filtering)
- `GET /api/v1/customs-compliance/requirements/:id` - Get requirement by ID
- `PATCH /api/v1/customs-compliance/requirements/:id` - Update requirement
- `DELETE /api/v1/customs-compliance/requirements/:id` - Delete requirement
- `GET /api/v1/customs-compliance/requirements/applicable` - Get applicable requirements for route

### Document Management
- `POST /api/v1/customs-compliance/documents` - Upload document
- `GET /api/v1/customs-compliance/documents` - Get all documents (with filtering)
- `GET /api/v1/customs-compliance/documents/:id` - Get document by ID
- `PATCH /api/v1/customs-compliance/documents/:id` - Update document
- `DELETE /api/v1/customs-compliance/documents/:id` - Delete document
- `POST /api/v1/customs-compliance/documents/:id/validate` - Validate document

### Compliance Check Management
- `POST /api/v1/customs-compliance/checks` - Create compliance check
- `GET /api/v1/customs-compliance/checks` - Get all checks (with filtering)
- `GET /api/v1/customs-compliance/checks/:id` - Get check by ID
- `PATCH /api/v1/customs-compliance/checks/:id` - Update check
- `DELETE /api/v1/customs-compliance/checks/:id` - Delete check
- `GET /api/v1/customs-compliance/history/:shipmentId` - Get compliance history
- `POST /api/v1/customs-compliance/checks/generate/:shipmentId` - Generate compliance checks

### Compliance Validation
- `GET /api/v1/customs-compliance/compliance/:shipmentId` - Check shipment compliance status

## Document Validation Features

### Automated Validation
- **File Format Validation**: Checks file size, MIME type, and extensions
- **Content Verification**: Validates document-specific content (invoice values, packing details, etc.)
- **Expiry Date Checks**: Ensures documents haven't expired
- **Requirement Compliance**: Validates against specific customs requirements

### Document Type Support
- **Commercial Invoice**: Validates invoice number, dates, parties, goods description, values
- **Packing List**: Validates item counts, weights, dimensions
- **Certificate of Origin**: Validates country of origin information
- **Transport Documents**: Validates BOL/AWB numbers, carrier information
- **Custom Requirements**: Supports custom validation rules per requirement

### Validation Rules
- **File Size Limits**: Configurable maximum file sizes
- **MIME Type Restrictions**: Allowed file types per requirement
- **Required Fields**: Mandatory fields for each document type
- **Format Validation**: Document format requirements
- **Expiry Checks**: Document validity period validation

## Compliance Workflow

1. **Requirement Setup**: Define customs requirements for specific routes
2. **Document Upload**: Upload required documents with metadata
3. **Automatic Validation**: Documents are automatically validated against requirements
4. **Compliance Checks**: Generate and execute compliance verification checks
5. **Status Tracking**: Monitor compliance status and resolve issues
6. **Shipment Progression**: Block shipment status updates until compliance is satisfied

## Integration with Shipment Module

The customs module integrates with the shipment module to enforce compliance:

- **Status Blocking**: Shipments cannot progress to `IN_TRANSIT`, `OUT_FOR_DELIVERY`, or `DELIVERED` without compliance
- **Compliance Validation**: `isShipmentCompliant()` method checks all requirements
- **Error Reporting**: Clear error messages when compliance fails
- **Automatic Checks**: Compliance checks are generated automatically for new shipments

## Usage Examples

### Create Customs Requirement
```typescript
const requirement = await customsService.createRequirement({
  requirementCode: 'US-CA-INV-001',
  name: 'Commercial Invoice Required',
  type: RequirementType.DOCUMENT,
  originCountry: 'US',
  destinationCountry: 'CA',
  isMandatory: true,
  documentFormat: 'PDF',
  validationRules: JSON.stringify({
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeTypes: ['application/pdf'],
  }),
});
```

### Upload and Validate Document
```typescript
const document = await customsService.uploadDocument({
  shipmentId: 'shipment-uuid',
  requirementId: 'requirement-uuid',
  documentType: DocumentType.COMMERCIAL_INVOICE,
  fileName: 'invoice.pdf',
  fileUrl: '/uploads/invoice.pdf',
  mimeType: 'application/pdf',
  metadata: JSON.stringify({
    invoice_number: 'INV-001',
    value: '1000.00',
  }),
});

// Document is automatically validated
const validation = await customsService.validateDocument(document.id);
```

### Check Shipment Compliance
```typescript
const compliance = await customsService.isShipmentCompliant('shipment-uuid');
if (!compliance.compliant) {
  console.log('Compliance issues:', compliance.reasons);
}
```

## Database Relationships

- `CustomsRequirement` → `CustomsDocument` (One-to-Many)
- `CustomsRequirement` → `ComplianceCheck` (One-to-Many)
- `CustomsDocument` → `Shipment` (Many-to-One)
- `ComplianceCheck` → `Shipment` (Many-to-One)

## Error Handling

- `NotFoundException`: When entity is not found
- `BadRequestException`: When validation fails or business rules are violated
- `ConflictException`: When unique constraints are violated

## Testing

The module includes comprehensive tests:
- **Unit Tests**: Document validation service with various scenarios
- **E2E Tests**: Full API workflow testing with in-memory database
- **Integration Tests**: Customs compliance with shipment progression

Run tests with:
```bash
npm run test:unit -- customs
npm run test:e2e -- customs-compliance
```
