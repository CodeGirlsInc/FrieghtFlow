# BidComparisonTable Component

A comprehensive bid comparison table component for shippers to evaluate and manage carrier bids on shipments.

## Features

- **Sortable Table**: Sort bids by price (ascending/descending) and carrier rating
- **Visual Status Indicators**: 
  - Accepted bids highlighted in green
  - Rejected bids greyed out with reduced opacity
- **Confirmation Modal**: Accept button opens a modal showing full bid details before confirmation
- **Quick Reject**: Reject button immediately calls the rejection API
- **Disabled Actions**: Accept/Reject buttons disabled once any bid on the shipment has been accepted
- **Empty State**: Shows a friendly message when no bids have been submitted
- **Carrier Information**: Displays carrier avatar (initials), name, email, and star rating
- **Relative Time**: Shows bid age in human-readable format (e.g., "2h ago", "3d ago")
- **Price Formatting**: Displays prices with proper currency formatting

## Directory Structure

```
BidComparisonTable/
├── BidComparisonTable.tsx       # Main table component
├── BidConfirmationModal.tsx     # Acceptance confirmation modal
├── EmptyBidsState.tsx           # Empty state component
├── StarRating.tsx               # Star rating display component
├── types.ts                     # TypeScript type definitions
├── utils.ts                     # Utility functions
└── index.ts                     # Export file
```

## Usage

```tsx
import { BidComparisonTable } from '@/package/components/BidComparisonTable';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

function ShipmentBidsPage({ shipmentId }: { shipmentId: string }) {
  const { data: bids = [], isLoading } = useQuery({
    queryKey: ['bids', shipmentId],
    queryFn: () => apiClient(`/shipments/${shipmentId}/bids`),
  });

  const { data: carrierRatings = [] } = useQuery({
    queryKey: ['carrier-ratings'],
    queryFn: () => apiClient('/carriers/ratings'),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <BidComparisonTable
      shipmentId={shipmentId}
      bids={bids}
      carrierRatings={carrierRatings}
      currency="USD"
      onBidAccepted={(bidId) => {
        console.log('Bid accepted:', bidId);
      }}
      onBidRejected={(bidId) => {
        console.log('Bid rejected:', bidId);
      }}
    />
  );
}
```

## Props

### BidComparisonTableProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `shipmentId` | `string` | Yes | - | The ID of the shipment |
| `bids` | `Bid[]` | Yes | - | Array of bid objects |
| `carrierRatings` | `CarrierRating[]` | No | `[]` | Array of carrier ratings |
| `currency` | `string` | No | `'USD'` | Currency code for price formatting |
| `onBidAccepted` | `(bidId: string) => void` | No | - | Callback when a bid is accepted |
| `onBidRejected` | `(bidId: string) => void` | No | - | Callback when a bid is rejected |
| `hasAcceptedBid` | `boolean` | No | Auto-detected | Override for accepted bid state |

## Types

### Bid

```typescript
interface Bid {
  id: string;
  shipmentId: string;
  carrier: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  carrierId: string;
  proposedPrice: number;
  message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}
```

### CarrierRating

```typescript
interface CarrierRating {
  carrierId: string;
  averageRating: number;  // 0-5 scale
  totalReviews: number;
}
```

## API Endpoints

The component expects the following backend endpoints:

### Get Bids
```
GET /api/v1/shipments/:id/bids
Authorization: Bearer <token>
Role: SHIPPER or ADMIN
```

### Accept Bid
```
PATCH /api/v1/shipments/:id/bids/:bidId/accept
Authorization: Bearer <token>
Role: SHIPPER
```

### Reject Bid
```
PATCH /api/v1/shipments/:id/bids/:bidId/reject
Authorization: Bearer <token>
Role: SHIPPER
```

**Note**: The reject endpoint needs to be implemented in the backend. The endpoint should:
1. Update the bid status to `REJECTED`
2. Only allow rejection if no bid has been accepted yet
3. Only allow the shipment owner to reject bids

Example backend implementation:

```typescript
// In bids.controller.ts
@Patch(':bidId/reject')
@HttpCode(HttpStatus.OK)
@UseGuards(RolesGuard)
@Roles(UserRole.SHIPPER)
@ApiOperation({ summary: 'Shipper rejects a bid' })
rejectBid(
  @Param('id', ParseUUIDPipe) shipmentId: string,
  @Param('bidId', ParseUUIDPipe) bidId: string,
  @CurrentUser() user: User,
) {
  return this.bidsService.rejectBid(shipmentId, bidId, user.id);
}

// In bids.service.ts
async rejectBid(
  shipmentId: string,
  bidId: string,
  requesterId: string,
): Promise<Bid> {
  const shipment = await this.getShipment(shipmentId);
  if (shipment.shipperId !== requesterId) {
    throw new ForbiddenException('Only the shipment owner can reject bids');
  }

  const bid = await this.bidRepo.findOne({ where: { id: bidId, shipmentId } });
  if (!bid) throw new NotFoundException(`Bid ${bidId} not found`);
  if (bid.status !== BidStatus.PENDING) {
    throw new BadRequestException('Bid is no longer pending');
  }

  bid.status = BidStatus.REJECTED;
  return this.bidRepo.save(bid);
}
```

## Utility Functions

The component exports several utility functions that can be used independently:

```typescript
import { 
  formatPrice, 
  getRelativeTime, 
  getCarrierRating, 
  sortBids,
  hasAcceptedBid,
  areActionsDisabled 
} from '@/package/components/BidComparisonTable';

// Format price with currency
formatPrice(1500, 'USD'); // "$1,500.00"

// Get relative time
getRelativeTime('2024-01-15T10:30:00Z'); // "2h ago"

// Sort bids
const sorted = sortBids(bids, 'price', 'asc', carrierRatings);
```

## Accessibility

- Keyboard navigation support for sortable columns
- ARIA labels for action buttons
- High contrast colors for status indicators
- Screen reader friendly status announcements

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BidComparisonTable } from './BidComparisonTable';

const mockBids = [
  {
    id: 'bid-1',
    shipmentId: 'ship-1',
    carrier: {
      id: 'carrier-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    carrierId: 'carrier-1',
    proposedPrice: 1500,
    message: 'I can deliver within 3 days',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  },
];

describe('BidComparisonTable', () => {
  it('renders empty state when no bids', () => {
    render(<BidComparisonTable shipmentId="ship-1" bids={[]} />);
    expect(screen.getByText('No Bids Yet')).toBeInTheDocument();
  });

  it('renders bids in table', () => {
    render(<BidComparisonTable shipmentId="ship-1" bids={mockBids} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('$1,500.00')).toBeInTheDocument();
  });

  it('shows confirmation modal on accept click', () => {
    render(<BidComparisonTable shipmentId="ship-1" bids={mockBids} />);
    fireEvent.click(screen.getByText('Accept'));
    expect(screen.getByText('Confirm Bid Acceptance')).toBeInTheDocument();
  });
});
```
