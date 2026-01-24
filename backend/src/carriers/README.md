# Carrier Management Module

## Overview
The Carrier Management Module handles carrier profiles, vehicle fleets, driver information, and carrier performance metrics.

## Features
- Carrier profile management (CRUD operations)
- Fleet management (vehicle CRUD operations)
- Driver assignment tracking
- Rating and performance calculation
- Service area management
- Verification workflow

## Entities

### Carrier
- `id` (UUID) - Unique identifier
- `userId` (UUID) - Associated user ID
- `companyName` (string) - Carrier company name
- `licenseNumber` (string) - Unique license number
- `insurancePolicy` (string) - Insurance policy information
- `serviceAreas` (JSONB array) - Geographic service areas
- `averageRating` (decimal) - Average rating score
- `totalDeliveries` (integer) - Total completed deliveries
- `onTimePercentage` (decimal) - Percentage of on-time deliveries
- `isVerified` (boolean) - Verification status
- `isActive` (boolean) - Active status

### Vehicle
- `id` (UUID) - Unique identifier
- `carrierId` (UUID) - Associated carrier ID
- `vehicleType` (enum) - Type of vehicle (truck, van, cargo_ship, car, motorcycle, trailer)
- `licensePlate` (string) - License plate number
- `capacityWeight` (decimal) - Maximum weight capacity
- `capacityVolume` (decimal) - Maximum volume capacity
- `year` (integer) - Manufacturing year
- `make` (string) - Vehicle make
- `model` (string) - Vehicle model
- `isActive` (boolean) - Active status

### Carrier Rating
- `id` (UUID) - Unique identifier
- `carrierId` (UUID) - Associated carrier ID
- `ratedBy` (UUID) - ID of the rater
- `freightJobId` (UUID) - Associated freight job (optional)
- `rating` (integer) - Rating score (1-5)
- `review` (text) - Review text (optional)

## API Endpoints

### Carriers
- `POST /api/v1/carriers` - Create a new carrier
- `GET /api/v1/carriers` - Get all carriers (with optional filters)
- `GET /api/v1/carriers/:id` - Get a specific carrier
- `PATCH /api/v1/carriers/:id` - Update a carrier
- `DELETE /api/v1/carriers/:id` - Delete a carrier

### Vehicles
- `POST /api/v1/carriers/:id/vehicles` - Add a vehicle to a carrier
- `GET /api/v1/carriers/:id/vehicles` - Get all vehicles for a carrier
- `PATCH /api/v1/carriers/vehicles/:vehicleId` - Update a vehicle
- `DELETE /api/v1/carriers/vehicles/:vehicleId` - Delete a vehicle

### Performance & Ratings
- `GET /api/v1/carriers/:id/performance` - Get carrier performance metrics
- `POST /api/v1/carriers/:id/rate` - Rate a carrier

## Business Logic

### Average Rating Calculation
- The average rating is automatically recalculated after each new rating
- Formula: Sum of all ratings / Total number of ratings

### On-Time Percentage Updates
- On-time percentage is updated after job completion
- Formula: (Total on-time deliveries / Total deliveries) * 100

### Verification Requirements
- Only verified carriers can accept freight jobs
- Carriers must have at least one active vehicle

### Search and Filtering
- Filter by service area
- Filter by minimum rating
- Filter by verification status
- Search by company name or license number

## Authorization
- Carriers can only edit their own profiles
- Admins have full access to all carrier data

## Usage Examples

### Create a Carrier
```bash
curl -X POST http://localhost:3000/carriers \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-123",
    "companyName": "ABC Logistics",
    "licenseNumber": "LIC123456",
    "insurancePolicy": "POL123",
    "serviceAreas": ["New York", "New Jersey"]
  }'
```

### Add a Vehicle to a Carrier
```bash
curl -X POST http://localhost:3000/carriers/123/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "truck",
    "licensePlate": "ABC123",
    "capacityWeight": 10000,
    "capacityVolume": 500
  }'
```

### Rate a Carrier
```bash
curl -X POST http://localhost:3000/carriers/123/rate \
  -H "Content-Type: application/json" \
  -d '{
    "ratedBy": "customer-id-456",
    "freightJobId": "job-id-789",
    "rating": 5,
    "review": "Excellent service!"
  }'
```

## Error Handling
- `404 Not Found` - Resource does not exist
- `409 Conflict` - Duplicate license number or rating already exists
- `400 Bad Request` - Cannot delete carrier with active vehicles