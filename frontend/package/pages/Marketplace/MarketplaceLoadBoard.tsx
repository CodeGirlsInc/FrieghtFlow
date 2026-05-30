'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShipmentCardSkeleton } from '@/components/ui/skeleton';
import { shipmentApi } from '@/lib/api/shipment.api';
import { ShipmentCard } from '@/components/shipment/shipment-card';
import { BidSubmissionForm } from '../../components/BidForm/BidSubmissionForm';
import type { QueryShipmentParams } from '@/types/shipment.types';

const CARGO_CATEGORIES = [
  'All', 'Electronics', 'Furniture', 'Food & Beverage',
  'Clothing', 'Machinery', 'Chemicals', 'Automotive', 'Medical', 'Other',
];

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'weight_asc' | 'weight_desc';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Weight: Light → Heavy', value: 'weight_asc' },
  { label: 'Weight: Heavy → Light', value: 'weight_desc' },
];

export function MarketplaceLoadBoard() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoCategory, setCargoCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);
  const [bidShipmentId, setBidShipmentId] = useState<string | null>(null);
  const [filters, setFilters] = useState<QueryShipmentParams>({
    page: 1,
    limit: 12,
  });

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['marketplace-loadboard', filters],
    queryFn: () => shipmentApi.marketplace({ ...filters, page: filters.page }),
  });

  if (error) {
    toast.error('Failed to load marketplace');
  }

  const applyFilters = useCallback(
    (pg = 1) => {
      setPage(pg);
      setFilters({
        origin: origin || undefined,
        destination: destination || undefined,
        page: pg,
        limit: 12,
        cargoCategory: cargoCategory !== 'All' ? cargoCategory : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
    },
    [origin, destination, cargoCategory, minPrice, maxPrice],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(1);
  };

  const handleClear = () => {
    setOrigin('');
    setDestination('');
    setCargoCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
    setFilters({ page: 1, limit: 12 });
  };

  const sorted = result?.data
    ? [...result.data].sort((a, b) => {
        if (sort === 'price_asc') return Number(a.price) - Number(b.price);
        if (sort === 'price_desc') return Number(b.price) - Number(a.price);
        if (sort === 'weight_asc') return Number(a.weightKg) - Number(b.weightKg);
        if (sort === 'weight_desc') return Number(b.weightKg) - Number(a.weightKg);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
    : [];

  const hasFilters = origin || destination || cargoCategory !== 'All' || minPrice || maxPrice;

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-36"
              />
              <Input
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-36"
              />
              <select
                value={cargoCategory}
                onChange={(e) => setCargoCategory(e.target.value)}
                className="text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground"
              >
                {CARGO_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-28"
                min={0}
              />
              <Input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-28"
                min={0}
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="outline" size="sm">
                Search
              </Button>
              {hasFilters && (
                <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Load Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShipmentCardSkeleton key={i} />
          ))}
        </div>
      ) : !result || sorted.length === 0 ? (
        <div className="text-center py-16 rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground text-sm">
            No available shipments match your filters. Try adjusting your search criteria.
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" className="mt-3" onClick={handleClear}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((s) => (
              <div key={s.id} className="relative">
                <ShipmentCard shipment={s} />
                <div className="mt-2 px-1">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setBidShipmentId(s.id)}
                  >
                    Place Bid
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => applyFilters(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {result.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === result.totalPages}
                onClick={() => applyFilters(page + 1)}
              >
                Next
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            {result.total} shipment{result.total !== 1 ? 's' : ''} available
          </p>
        </>
      )}

      {/* Bid Modal */}
      {bidShipmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Place a Bid</h2>
              <button
                onClick={() => setBidShipmentId(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <BidSubmissionForm
              shipmentId={bidShipmentId}
              onSuccess={() => setBidShipmentId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
