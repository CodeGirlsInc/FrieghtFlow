# Insurance Module

This module manages insurance policies for shipments and their associated claim history.

## Features

- **Insurance Policy Management**: Create, read, update, and delete insurance policies
- **Claim History Tracking**: Manage claims associated with insurance policies
- **Comprehensive Filtering**: Advanced query capabilities for both policies and claims
- **Analytics & Reporting**: Statistics and insights on insurance data
- **Shipment Integration**: Link insurance policies to specific shipments

## Entities

### InsurancePolicy
- `id`: Unique identifier (UUID)
- `policyNumber`: Unique policy number
- `provider`: Insurance provider name
- `coverageType`: Type of coverage (all_risk, general_average, etc.)
- `coverageAmount`: Maximum coverage amount
- `premiumAmount`: Premium paid for the policy
- `currency`: Currency code (default: USD)
- `deductible`: Deductible amount (optional)
- `effectiveDate`: Policy start date
- `expiryDate`: Policy end date
- `status`: Policy status (active, expired, cancelled, etc.)
- `termsAndConditions`: Policy terms (optional)
- `exclusions`: Policy exclusions (optional)
- `notes`: Additional notes (optional)
- `contactPerson`: Contact person name (optional)
- `contactEmail`: Contact email (optional)
- `contactPhone`: Contact phone (optional)
- `shipmentId`: Associated shipment ID

### ClaimHistory
- `id`: Unique identifier (UUID)
- `claimNumber`: Unique claim number
- `claimType`: Type of claim (damage, loss, theft, etc.)
- `status`: Claim status (submitted, under_review, approved, etc.)
- `claimedAmount`: Amount claimed
- `approvedAmount`: Amount approved (optional)
- `paidAmount`: Amount paid (optional)
- `currency`: Currency code (default: USD)
- `incidentDate`: Date of incident
- `claimDate`: Date claim was filed
- `settlementDate`: Date of settlement (optional)
- `description`: Detailed description of the claim
- `investigationNotes`: Investigation notes (optional)
- `supportingDocuments`: Supporting documents (JSON string)
- `adjusterNotes`: Adjuster notes (optional)
- `adjusterName`: Adjuster name (optional)
- `adjusterContact`: Adjuster contact (optional)
- `rejectionReason`: Reason for rejection (optional)
- `settlementNotes`: Settlement notes (optional)
- `insurancePolicyId`: Associated insurance policy ID

## API Endpoints

### Insurance Policies
- `POST /api/v1/insurance/policies` - Create insurance policy
- `GET /api/v1/insurance/policies` - Get all policies (with filtering)
- `GET /api/v1/insurance/policies/:id` - Get policy by ID
- `GET /api/v1/insurance/policies/policy-number/:policyNumber` - Get policy by policy number
- `PATCH /api/v1/insurance/policies/:id` - Update policy
- `DELETE /api/v1/insurance/policies/:id` - Delete policy
- `GET /api/v1/insurance/shipments/:shipmentId/policies` - Get policies for shipment

### Claims
- `POST /api/v1/insurance/claims` - Create claim
- `GET /api/v1/insurance/claims` - Get all claims (with filtering)
- `GET /api/v1/insurance/claims/:id` - Get claim by ID
- `GET /api/v1/insurance/claims/claim-number/:claimNumber` - Get claim by claim number
- `PATCH /api/v1/insurance/claims/:id` - Update claim
- `DELETE /api/v1/insurance/claims/:id` - Delete claim
- `GET /api/v1/insurance/policies/:insurancePolicyId/claims` - Get claims for policy

### Analytics
- `GET /api/v1/insurance/statistics` - Get insurance statistics

## Query Parameters

### Insurance Policy Queries
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `policyNumber`: Filter by policy number (partial match)
- `provider`: Filter by provider (partial match)
- `coverageType`: Filter by coverage type
- `status`: Filter by policy status
- `shipmentId`: Filter by shipment ID
- `effectiveDateFrom`: Filter by effective date from
- `effectiveDateTo`: Filter by effective date to
- `expiryDateFrom`: Filter by expiry date from
- `expiryDateTo`: Filter by expiry date to

### Claim Queries
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `claimNumber`: Filter by claim number (partial match)
- `claimType`: Filter by claim type
- `status`: Filter by claim status
- `insurancePolicyId`: Filter by insurance policy ID
- `incidentDateFrom`: Filter by incident date from
- `incidentDateTo`: Filter by incident date to
- `claimDateFrom`: Filter by claim date from
- `claimDateTo`: Filter by claim date to

## Usage Examples

### Create Insurance Policy
```typescript
const policy = await insuranceService.createInsurancePolicy({
  policyNumber: 'POL-2024-001',
  provider: 'Global Insurance Co.',
  coverageType: CoverageType.ALL_RISK,
  coverageAmount: 100000,
  premiumAmount: 1500,
  effectiveDate: '2024-01-01',
  expiryDate: '2024-12-31',
  shipmentId: 'shipment-uuid'
});
```

### Create Claim
```typescript
const claim = await insuranceService.createClaim({
  claimNumber: 'CLM-2024-001',
  claimType: ClaimType.DAMAGE,
  claimedAmount: 5000,
  incidentDate: '2024-06-15',
  claimDate: '2024-06-16',
  description: 'Package damaged during transit',
  insurancePolicyId: 'policy-uuid'
});
```

### Get Statistics
```typescript
const stats = await insuranceService.getInsuranceStatistics();
// Returns: totalPolicies, activePolicies, expiredPolicies, 
//          totalClaims, pendingClaims, approvedClaims,
//          totalClaimAmount, totalPaidAmount
```

## Database Relationships

- `InsurancePolicy` belongs to `Shipment` (many-to-one)
- `ClaimHistory` belongs to `InsurancePolicy` (many-to-one)
- `InsurancePolicy` has many `ClaimHistory` (one-to-many)

## Validation

- Policy numbers and claim numbers must be unique
- Expiry dates must be after effective dates
- All monetary amounts must be non-negative
- Required fields are validated using class-validator decorators
- Date formats must be ISO 8601 strings

## Error Handling

- `NotFoundException`: When entity is not found
- `ConflictException`: When unique constraints are violated
- `BadRequestException`: When validation fails or business rules are violated
