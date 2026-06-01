/**
 * ShipmentFilterBar Usage Example
 *
 * This file demonstrates how to integrate the ShipmentFilterBar component
 * with the shipments page to enable filtering with URL-based state.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShipmentFilterBar,
  ShipmentFilters,
} from "../../../package/components/ShipmentFilterBar";
import { shipmentApi } from "../../../lib/api/shipment.api";
import { PaginatedShipments } from "../../../types/shipment.types";
import { ShipmentCard } from "../../../components/shipment/shipment-card";
import { ShipmentCardSkeleton } from "../../../components/ui/skeleton";
import { toast } from "sonner";

export default function ShipmentsPageWithFilters() {
  const [result, setResult] = useState<PaginatedShipments | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ShipmentFilters>({});

  // Fetch shipments when filters change
  const fetchShipments = useCallback(
    async (currentFilters: ShipmentFilters) => {
      setLoading(true);
      try {
        // Build query params from filters
        const params: any = {
          page: 1,
          limit: 20,
        };

        // Note: The backend API may need to be updated to support all filter parameters
        // For now, we're demonstrating the frontend implementation
        if (currentFilters.status && currentFilters.status.length === 1) {
          params.status = currentFilters.status[0];
        }

        if (currentFilters.originCountry) {
          params.origin = currentFilters.originCountry;
        }

        // Text search would need backend support for searching across multiple fields
        // This could be implemented as a 'search' query param on the backend

        const data = await shipmentApi.list(params);
        setResult(data);
      } catch {
        toast.error("Failed to load shipments");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: ShipmentFilters) => {
      setFilters(newFilters);
      fetchShipments(newFilters);
    },
    [fetchShipments],
  );

  // Initial load
  useEffect(() => {
    fetchShipments({});
  }, [fetchShipments]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Shipments</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search and filter your shipments
        </p>
      </div>

      {/* Filter Bar */}
      <ShipmentFilterBar onFilterChange={handleFilterChange} />

      {/* Loading State */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShipmentCardSkeleton key={i} />
          ))}
        </div>
      ) : !result || result.data.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">
            No shipments found matching your filters.
          </p>
        </div>
      ) : (
        /* Results */
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {result.data.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>

          {/* Pagination info */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            Showing {result.data.length} of {result.total} shipments
          </p>
        </>
      )}
    </div>
  );
}

/**
 * IMPORTANT NOTES:
 *
 * 1. URL-Based State:
 *    The ShipmentFilterBar automatically syncs filters with URL query params.
 *    Example URLs:
 *    - /shipments?status=PENDING,IN_TRANSIT
 *    - /shipments?search=LOS&status=DELIVERED
 *    - /shipments?dateFrom=2024-01-01&dateTo=2024-12-31&originCountry=US
 *
 *    Users can bookmark and share these filtered views.
 *
 * 2. Backend API Requirements:
 *    For full functionality, the backend /shipments endpoint should support:
 *    - search: Text search across trackingNumber, origin, destination, cargoDescription
 *    - status: Array of statuses (or comma-separated string)
 *    - dateFrom: Filter shipments created after this date
 *    - dateTo: Filter shipments created before this date
 *    - originCountry: Filter by origin country code
 *
 * 3. Debouncing:
 *    The search input is debounced by 400ms to avoid excessive API calls
 *    while the user is typing.
 *
 * 4. No Full Page Reload:
 *    Filter changes use Next.js client-side navigation (router.push with scroll: false)
 *    so the shipment list updates without a full page reload.
 */
