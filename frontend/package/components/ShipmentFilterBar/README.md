# ShipmentFilterBar

A comprehensive, multi-dimensional filtering component for the shipments page with URL-based state management.

## Features

✅ **Text Search** - Matches tracking number, origin, destination, and cargo description (debounced 400ms)  
✅ **Status Multi-Select** - Filter by one or more shipment statuses  
✅ **Date Range Picker** - Filter shipments by date range  
✅ **Origin Country Select** - Filter by origin country  
✅ **URL-Based State** - All filters are reflected in URL query params for bookmarking/sharing  
✅ **Clear All Filters** - One-click reset of all active filters  
✅ **Active Filter Count Badge** - Visual indicator of how many filters are applied  
✅ **Individual Filter Removal** - Remove filters individually from the active filters display  
✅ **No Full Page Reload** - Shipment list updates via client-side navigation

## Installation

All files are located in `frontend/package/components/ShipmentFilterBar/`:

```
ShipmentFilterBar/
├── ShipmentFilterBar.tsx    # Main component
├── useFilterState.ts        # Custom hooks for filter state & debouncing
├── types.ts                 # Type definitions & constants
├── index.ts                 # Export file
├── USAGE_EXAMPLE.tsx        # Integration example
└── README.md                # This file
```

## Usage

### Basic Integration

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShipmentFilterBar,
  ShipmentFilters,
} from "@/package/components/ShipmentFilterBar";
import { shipmentApi } from "@/lib/api/shipment.api";

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleFilterChange = useCallback(async (filters: ShipmentFilters) => {
    setLoading(true);
    try {
      const data = await shipmentApi.list({
        status: filters.status?.[0], // Backend may need update for multi-status
        // Add other params as backend supports them
      });
      setShipments(data);
    } catch (error) {
      console.error("Failed to load shipments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFilterChange({});
  }, [handleFilterChange]);

  return (
    <div>
      <h1>My Shipments</h1>
      <ShipmentFilterBar onFilterChange={handleFilterChange} />
      {/* Render shipment list */}
    </div>
  );
}
```

### URL Query Parameters

The component automatically syncs filters with the URL:

```
/shipments?status=PENDING,IN_TRANSIT
/shipments?search=LOS&status=DELIVERED
/shipments?dateFrom=2024-01-01&dateTo=2024-12-31&originCountry=US
/shipments?search=cargo&status=PENDING,ACCEPTED&dateFrom=2024-01-01
```

Users can bookmark and share these URLs to save their filter preferences.

## Props

### ShipmentFilterBar

| Prop             | Type                                 | Description                                               |
| ---------------- | ------------------------------------ | --------------------------------------------------------- |
| `onFilterChange` | `(filters: ShipmentFilters) => void` | Callback fired when filters change (debounced for search) |

### ShipmentFilters Interface

```typescript
interface ShipmentFilters {
  search?: string; // Text search query
  status?: ShipmentStatus[]; // Array of selected statuses
  dateFrom?: string; // Start date (ISO format: YYYY-MM-DD)
  dateTo?: string; // End date (ISO format: YYYY-MM-DD)
  originCountry?: string; // Country code (e.g., 'US', 'NG')
}
```

## Custom Hooks

### useFilterState

Manages filter state with URL synchronization:

```typescript
import { useFilterState } from "@/package/components/ShipmentFilterBar";

function MyComponent() {
  const {
    filters, // Current filter values
    updateFilters, // Function to update filters
    clearFilters, // Function to clear all filters
    activeFilterCount, // Number of active filters
  } = useFilterState();

  // Update a single filter
  updateFilters({ search: "LOS" });

  // Update multiple filters
  updateFilters({
    status: ["PENDING", "IN_TRANSIT"],
    originCountry: "US",
  });

  // Clear all filters
  clearFilters();
}
```

### useDebounce

Debounces any value with configurable delay:

```typescript
import { useDebounce } from '@/package/components/ShipmentFilterBar';

function SearchInput() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400); // 400ms delay

  useEffect(() => {
    // This runs 400ms after the user stops typing
    performSearch(debouncedSearch);
  }, [debouncedSearch]);

  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
}
```

## Backend API Requirements

For full functionality, the backend `/shipments` endpoint should support these query parameters:

| Parameter       | Type                   | Description                                                              |
| --------------- | ---------------------- | ------------------------------------------------------------------------ |
| `search`        | `string`               | Text search across trackingNumber, origin, destination, cargoDescription |
| `status`        | `string[]` or `string` | Filter by one or more statuses (comma-separated)                         |
| `dateFrom`      | `string`               | Filter shipments created after this date (ISO 8601)                      |
| `dateTo`        | `string`               | Filter shipments created before this date (ISO 8601)                     |
| `originCountry` | `string`               | Filter by origin country code                                            |

### Example Backend Query (TypeORM)

```typescript
async findAll(filters: ShipmentFilters) {
  const query = this.shipmentRepo.createQueryBuilder('shipment');

  if (filters.search) {
    query.andWhere(
      '(shipment.trackingNumber ILIKE :search OR ' +
      'shipment.origin ILIKE :search OR ' +
      'shipment.destination ILIKE :search OR ' +
      'shipment.cargoDescription ILIKE :search)',
      { search: `%${filters.search}%` }
    );
  }

  if (filters.status && filters.status.length > 0) {
    query.andWhere('shipment.status IN (:...statuses)', {
      statuses: filters.status
    });
  }

  if (filters.dateFrom) {
    query.andWhere('shipment.createdAt >= :dateFrom', {
      dateFrom: filters.dateFrom
    });
  }

  if (filters.dateTo) {
    query.andWhere('shipment.createdAt <= :dateTo', {
      dateTo: filters.dateTo
    });
  }

  if (filters.originCountry) {
    query.andWhere('shipment.origin LIKE :country', {
      country: `%${filters.originCountry}%`
    });
  }

  return query.getManyAndCount();
}
```

## Design Patterns

### Debouncing

- Search input is debounced by 400ms to prevent excessive API calls
- Uses custom `useDebounce` hook with configurable delay

### URL State Management

- Filters are stored in URL query parameters using Next.js `useSearchParams` and `useRouter`
- Client-side navigation prevents full page reloads
- Browser back/forward buttons work correctly

### Component Architecture

- All work is isolated in `frontend/package/components/ShipmentFilterBar/`
- No modifications to existing files outside this directory
- Follows existing project patterns and design system

## Accessibility

- All inputs have proper `aria-label` attributes
- Filter tags are removable with keyboard navigation
- Status dropdown is properly labeled and managed
- Active filter count is announced to screen readers

## Browser Compatibility

Works in all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Testing

To test the component:

1. **Text Search**: Type in the search box and verify URL updates after 400ms
2. **Status Filter**: Click status dropdown, select multiple statuses
3. **Date Range**: Select from/to dates
4. **Country Filter**: Select a country from dropdown
5. **URL Sync**: Verify URL query params match selected filters
6. **Bookmark**: Copy URL with filters, paste in new tab, verify filters restore
7. **Clear All**: Click "Clear All" button, verify all filters reset
8. **Individual Removal**: Click X on individual filter tags
9. **Filter Count**: Verify badge shows correct count
10. **No Reload**: Verify page doesn't fully reload when filters change

## Future Enhancements

Potential improvements:

- Add sorting options (date, price, status)
- Add pagination integration
- Add saved filter presets
- Add export filtered results to CSV
- Add advanced filter mode with more criteria
- Support for custom country lists
- Auto-complete for origin/destination fields
