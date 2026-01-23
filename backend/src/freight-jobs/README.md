# Freight Job Management System - Backend Implementation

## Overview

This module implements a complete Freight Job Management system for the FreightFlow application. It handles the complete lifecycle of freight jobs from creation to completion, including job posting, bidding, carrier assignment, and status tracking.

## Features Implemented

✅ **Full CRUD Operations** - Create, read, update, delete freight jobs  
✅ **Job Status Workflow** - Enforce state transitions: draft → posted → assigned → in_transit → delivered  
✅ **Authorization & Access Control** - Role-based access with shipper/carrier/admin distinctions  
✅ **Filtering & Pagination** - Filter by status, date range, location; offset-based pagination  
✅ **Search Functionality** - Full-text search by job title and description  
✅ **Cost Calculation** - Dynamic cost estimation based on distance, weight, and cargo type  
✅ **Soft Deletes** - Non-destructive deletion of draft jobs  
✅ **Comprehensive Testing** - Unit tests for all services and controllers  
✅ **OpenAPI Documentation** - Full Swagger documentation with examples  

## API Endpoints

### Job Management
- `POST /api/v1/freight-jobs` - Create a new freight job (shippers only)
- `GET /api/v1/freight-jobs` - Get all freight jobs with filtering
- `GET /api/v1/freight-jobs/:id` - Get a specific freight job
- `PATCH /api/v1/freight-jobs/:id` - Update a freight job
- `DELETE /api/v1/freight-jobs/:id` - Delete a draft job (soft delete)

### Shipper & Carrier Operations
- `GET /api/v1/freight-jobs/shipper/:shipperId` - Get jobs by shipper
- `GET /api/v1/freight-jobs/carrier/:carrierId` - Get jobs assigned to carrier
- `POST /api/v1/freight-jobs/:id/assign` - Assign carrier to a posted job

## Database Schema

```sql
CREATE TABLE freight_jobs (
  id UUID PRIMARY KEY,
  shipper_id UUID NOT NULL,
  carrier_id UUID,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  origin_address JSONB NOT NULL,
  destination_address JSONB NOT NULL,
  cargo_type VARCHAR NOT NULL,
  cargo_weight DECIMAL(10,2) NOT NULL,
  estimated_cost DECIMAL(12,2) NOT NULL,
  status ENUM ('draft', 'posted', 'assigned', 'in_transit', 'delivered', 'cancelled') DEFAULT 'draft',
  pickup_date TIMESTAMP NOT NULL,
  delivery_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  FOREIGN KEY (shipper_id) REFERENCES users(id),
  FOREIGN KEY (carrier_id) REFERENCES users(id)
);

CREATE INDEX idx_shipper ON freight_jobs(shipper_id);
CREATE INDEX idx_carrier ON freight_jobs(carrier_id);
CREATE INDEX idx_status ON freight_jobs(status);
CREATE INDEX idx_created ON freight_jobs(created_at);
```

## Job Status Workflow

### Status Transitions

```
DRAFT
  ├─→ POSTED (publish job)
  └─→ CANCELLED (abandon job)

POSTED
  ├─→ ASSIGNED (assign carrier)
  └─→ CANCELLED (withdraw job)

ASSIGNED
  ├─→ IN_TRANSIT (pickup completed)
  └─→ CANCELLED (cancel assigned job)

IN_TRANSIT
  └─→ DELIVERED (delivery completed)

DELIVERED
  └─ (terminal state)

CANCELLED
  └─ (terminal state)
```

### Business Rules

- Only shippers can create jobs
- Jobs start in DRAFT status
- Only DRAFT jobs can be deleted
- Status transitions cannot skip steps
- Only carriers assigned to POSTED jobs can be assigned
- Only assigned carriers can update status to IN_TRANSIT

## Cost Calculation

### Formula

```
EstimatedCost = max(
  (Distance × BaseRate + Weight × WeightMultiplier) × CargoTypeMultiplier,
  MinimumCharge
)
```

### Parameters

- **Base Rate**: $5 per km
- **Weight Multiplier**: $0.1 per kg
- **Minimum Charge**: $50
- **Cargo Type Multipliers**:
  - Electronics: 1.5x
  - Furniture: 1.2x
  - Fragile: 1.8x
  - Hazardous: 2.0x
  - Perishable: 1.6x
  - General: 1.0x

### Distance Estimation

The service uses Haversine formula with GPS coordinates when available. For addresses without coordinates, it estimates distance based on major US cities. In production, integrate with Google Maps API or similar service.

## Data Transfer Objects (DTOs)

### CreateFreightJobDto
```typescript
{
  title: string;
  description: string;
  originAddress: Address;
  destinationAddress: Address;
  cargoType: string;
  cargoWeight: number;
  pickupDate: string; // ISO 8601
  deliveryDate: string; // ISO 8601
}
```

### Address Interface
```typescript
{
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}
```

### Filter Parameters
```typescript
{
  page?: number; // default 1
  limit?: number; // default 10, max 100
  status?: FreightJobStatus;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  search?: string;
  city?: string;
}
```

## Service Architecture

### FreightJobsService
Main service handling all business logic:
- CRUD operations
- Authorization checks
- Status transition validation
- Job filtering and pagination
- Cost calculations

### CostCalculationService
Specialized service for cost estimation:
- Distance calculation using Haversine formula
- Duration estimation
- Cost computation with all multipliers
- City-based distance lookup

## Testing

### Test Coverage
- ✅ Cost calculation with various cargo types
- ✅ Distance and duration estimation
- ✅ Job creation and validation
- ✅ Status transition enforcement
- ✅ Authorization checks
- ✅ Filtering and pagination
- ✅ Carrier assignment
- ✅ Soft deletion

### Running Tests
```bash
# Unit tests
npm run test src/freight-jobs

# With coverage
npm run test:cov src/freight-jobs

# Watch mode
npm run test:watch src/freight-jobs
```

## File Structure

```
src/freight-jobs/
├── controllers/
│   ├── freight-jobs.controller.ts
│   └── freight-jobs.controller.spec.ts
├── services/
│   ├── freight-jobs.service.ts
│   ├── freight-jobs.service.spec.ts
│   ├── cost-calculation.service.ts
│   └── cost-calculation.service.spec.ts
├── entities/
│   └── freight-job.entity.ts
├── dtos/
│   └── freight-job.dto.ts
└── freight-jobs.module.ts
```

## Key Implementation Details

### Authorization
- Methods extract user ID and role from JWT token (request.user)
- Shippers can only manage their own jobs
- Carriers can only be assigned to jobs (no direct job creation)
- Admin role can override authorization checks

### Filtering & Pagination
- Uses QueryBuilder for dynamic filtering
- ILIKE operator for case-insensitive search
- BETWEEN operator for date range filtering
- JSONB operators for address-based filtering
- Offset-limit pagination (not cursor-based)

### Soft Deletes
- Uses TypeORM's `@DeleteDateColumn`
- Jobs marked as deleted but not removed from database
- Queries automatically exclude soft-deleted records

### Error Handling
- Comprehensive validation on input DTOs
- Custom error messages for status transitions
- NotFoundException for missing resources
- ForbiddenException for unauthorized access
- BadRequestException for invalid operations

## Usage Examples

### Create a Job
```bash
POST /api/v1/freight-jobs
{
  "title": "Electronics Shipment NY to CA",
  "description": "Fragile electronics equipment",
  "originAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "latitude": 40.7128,
    "longitude": -74.006
  },
  "destinationAddress": {
    "street": "456 Market St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "USA",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "cargoType": "electronics",
  "cargoWeight": 150,
  "pickupDate": "2026-02-01T08:00:00Z",
  "deliveryDate": "2026-02-05T18:00:00Z"
}
```

### Update Job Status
```bash
PATCH /api/v1/freight-jobs/{jobId}
{
  "status": "posted"
}
```

### Assign Carrier
```bash
POST /api/v1/freight-jobs/{jobId}/assign
{
  "carrierId": "550e8400-e29b-41d4-a716-446655440002"
}
```

### Filter Jobs
```bash
GET /api/v1/freight-jobs?status=posted&city=NewYork&page=1&limit=20
```

## Future Enhancements

1. **Real Map Integration**: Replace city-based distance with Google Maps API
2. **Bidding System**: Allow carriers to bid on posted jobs
3. **Real-time Tracking**: WebSocket integration for live location tracking
4. **Rating System**: Shipper and carrier ratings
5. **Payment Integration**: Stripe/PayPal integration for payments
6. **Document Upload**: Support for shipping documents and photos
7. **Notifications**: Email/SMS notifications for status changes
8. **Analytics**: Dashboard with job statistics and metrics
9. **Caching**: Redis caching for frequently accessed data
10. **Audit Trail**: Complete audit logging of all changes

## Dependencies

- `@nestjs/core` - NestJS framework
- `@nestjs/typeorm` - Database ORM
- `@nestjs/swagger` - API documentation
- `class-validator` - Input validation
- `class-transformer` - DTO transformation
- `typeorm` - Database abstraction
- `pg` - PostgreSQL driver

## Notes

- TypeORM is configured to auto-load entities and auto-synchronize schema
- Timestamps (createdAt, updatedAt) are managed by database
- All dates should be in ISO 8601 format
- Coordinates use standard latitude/longitude (WGS84)
- Cost calculations are deterministic and reproducible
