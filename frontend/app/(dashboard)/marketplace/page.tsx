'use client';

import React, { useEffect, useState } from 'react';
import { shipmentApi } from '@/services/shipmentApi';
import ShipmentCard from '@/components/ShipmentCard';
import { toast } from 'react-hot-toast';

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  // other fields...
}

export default function MarketplacePage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchShipments = async (params?: { origin?: string; destination?: string; page?: number }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentApi.marketplace(params || { page });
      setShipments(response.data);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError('Failed to fetch shipments');
      toast.error('Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments({ page });
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchShipments({ origin, destination, page: 1 });
  };

  const handleClear = () => {
    setOrigin('');
    setDestination('');
    setPage(1);
    fetchShipments({ page: 1 });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Carrier Marketplace</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
          Search
        </button>
        {(origin || destination) && (
          <button type="button" onClick={handleClear} className="bg-gray-400 text-white px-4 py-1 rounded">
            Clear
          </button>
        )}
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-40 rounded" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Empty State */}
      {!loading && !error && shipments.length === 0 && (
        <p className="text-gray-600">No available shipments right now. Check back soon!</p>
      )}

      {/* Results Grid */}
      {!loading && shipments.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Total Count */}
          <p className="text-sm text-gray-500 mt-2">{totalCount} shipment(s) available</p>
        </>
      )}
    </div>
  );
}
