'use client';

import { useEffect, useState } from 'react';
import { shipmentApi } from '../../../lib/api/shipment.api';
import { PaginatedShipments } from '../../../types/shipment.types';
import { ShipmentCard } from '../../../components/shipment/shipment-card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

export default function MarketplacePage() {
  const [result, setResult] = useState<PaginatedShipments | null>(null);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [page, setPage] = useState(1);

  const fetchMarketplace = async (pg = 1) => {
    setLoading(true);
    try {
      const data = await shipmentApi.marketplace({
        origin: origin || undefined,
        destination: destination || undefined,
        page: pg,
        limit: 12,
      });
      setResult(data);
      setPage(pg);
    } catch {
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplace(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMarketplace(1);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse available shipments open for carriers to accept.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6 flex-wrap">
        <Input
          placeholder="Origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="w-40"
        />
        <Input
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-40"
        />
        <Button type="submit" variant="outline" size="sm">
          Search
        </Button>
        {(origin || destination) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setOrigin('');
              setDestination('');
              fetchMarketplace(1);
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : !result || result.data.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">
            No available shipments right now. Check back soon!
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((s) => (
              <ShipmentCard key={s.id} shipment={s} />
            ))}
          </div>

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => fetchMarketplace(page - 1)}
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
                onClick={() => fetchMarketplace(page + 1)}
              >
                Next
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-3">
            {result.total} shipment{result.total !== 1 ? 's' : ''} available
          </p>
        </>
      )}
    </div>
  );
}
