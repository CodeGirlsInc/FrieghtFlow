# Shipment Tracking Module

A standalone module for managing shipment tracking and status updates in the FreightFlow system.

## Features

- **Shipment Management**: Create, read, update, and delete shipments
- **Tracking IDs**: Unique tracking identifiers (format: FF-YYYYMMDD-XXXXX)
- **Status Tracking**: Comprehensive status history with timestamps and locations
- **Search Functionality**: Search shipments by tracking ID, origin, destination, or carrier
- **Real-time Updates**: Update shipment status with location and description
- **Status Validation**: Prevents status updates for delivered or cancelled shipments

## Entities

### Shipment
- `id`: Unique UUID identifier
- `trackingId`: Unique tracking number (format: FF-YYYYMMDD-XXXXX)
- `origin`: Shipment origin location
- `destination`: Shipment destination location
- `carrier`: Shipping carrier (FedEx, UPS, etc.)
- `status`: Current shipment status
- `estimatedDelivery`: Expected delivery date
- `freightDetails`: Description of shipped items
- `weight` & `weightUnit`: Package weight and unit
- `dimensions` & `dimensionUnit`: Package dimensions and unit
- `notes`: Additional shipment notes
- `createdAt` & `updatedAt`: Timestamps
- `statusHistory`: Relationship to status history entries

### ShipmentStatusHistory
- `id`: Unique UUID identifier
- `shipmentId`: Reference to parent shipment
- `status`: Status at this point in time
- `location`: Location where status was recorded
- `description`: Description of the status update
- `timestamp`: When the status was recorded

## Shipment Statuses

- `PENDING`: Shipment created, awaiting pickup
- `PICKED_UP`: Package picked up from sender
- `IN_TRANSIT`: Package in transit to destination
- `OUT_FOR_DELIVERY`: Package out for final delivery
- `DELIVERED`: Package delivered successfully
- `CANCELLED`: Shipment cancelled
- `EXCEPTION`: Delivery exception occurred

## API Endpoints

### Create Shipment
```http
POST /shipments
Content-Type: application/json

{
  "origin": "New York, NY",
  "destination": "Los Angeles, CA",
  "carrier": "FedEx",
  "estimatedDelivery": "2024-12-25T00:00:00.000Z",
  "freightDetails": "Electronics package",
  "weight": 15.5,
  "weightUnit": "kg",
  "notes": "Handle with care"
}
```

### Get All Shipments
```http
GET /shipments
```

### Get Shipment by ID
```http
GET /shipments/:id
```

### Get Shipment by Tracking ID
```http
GET /shipments/tracking/:trackingId
```

### Search Shipments
```http
GET /shipments/search?q=FedEx
```

### Get Status History
```http
GET /shipments/:id/status-history
```

### Update Shipment Details
```http
PATCH /shipments/:id
Content-Type: application/json

{
  "notes": "Updated notes",
  "weight": 16.2
}
```

### Update Shipment Status
```http
PATCH /shipments/:id/status
Content-Type: application/json

{
  "status": "IN_TRANSIT",
  "location": "Chicago Hub",
  "description": "Package in transit to destination"
}
```

### Delete Shipment
```http
DELETE /shipments/:id
```

## Usage Examples

### Creating a New Shipment
```typescript
import { ShipmentService } from './shipment/shipment.service';

@Injectable()
export class OrderService {
  constructor(private shipmentService: ShipmentService) {}

  async createShipmentForOrder(order: Order) {
    const shipment = await this.shipmentService.create({
      origin: order.shippingAddress.origin,
      destination: order.shippingAddress.destination,
      carrier: order.preferredCarrier,
      estimatedDelivery: order.expectedDeliveryDate,
      freightDetails: order.items.map(item => item.name).join(', '),
      weight: order.totalWeight,
      weightUnit: 'kg',
      notes: order.specialInstructions
    });

    return shipment;
  }
}
```

### Updating Shipment Status
```typescript
async updateShipmentStatus(trackingId: string, status: ShipmentStatus) {
  const shipment = await this.shipmentService.findByTrackingId(trackingId);
  
  await this.shipmentService.updateStatus(shipment.id, {
    status: status,
    location: 'Current Location',
    description: 'Status update description'
  });
}
```

### Tracking a Shipment
```typescript
async trackShipment(trackingId: string) {
  try {
    const shipment = await this.shipmentService.findByTrackingId(trackingId);
    const statusHistory = await this.shipmentService.getStatusHistory(shipment.id);
    
    return {
      shipment,
      statusHistory: statusHistory.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    };
  } catch (error) {
    throw new NotFoundException('Shipment not found');
  }
}
```

## Business Rules

1. **Status Updates**: Cannot update status for delivered or cancelled shipments
2. **Tracking ID Generation**: Automatically generated with format FF-YYYYMMDD-XXXXX
3. **Status History**: Every status change creates a history entry
4. **Required Fields**: Origin, destination, and carrier are mandatory
5. **Data Validation**: All inputs validated using class-validator decorators

## Integration

The module is designed to be standalone but can easily integrate with other modules:

- **Orders Module**: Create shipments when orders are placed
- **Notifications Module**: Send status update notifications
- **Analytics Module**: Track delivery performance metrics
- **Customer Module**: Link shipments to customer accounts

## Testing

Run the test suite:

```bash
# Unit tests
npm run test src/shipment

# E2E tests
npm run test:e2e shipment.e2e-spec.ts

# Coverage
npm run test:cov
```

## Database Schema

The module creates two tables:
- `shipments`: Main shipment information
- `shipment_status_history`: Status update history

Both tables use UUID primary keys and include proper indexing for performance.

## Error Handling

The module provides comprehensive error handling:
- `NotFoundException`: When shipment not found
- `BadRequestException`: When status update is invalid
- Validation errors for invalid input data
- Proper HTTP status codes for all responses
