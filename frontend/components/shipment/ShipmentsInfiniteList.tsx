'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { shipmentApi } from '../../lib/api/shipment.api';
import { ShipmentCard } from './shipment-card';
import type { QueryShipmentParams } from '../../types/shipment.types';

const PAGE_LIMIT = 10;

interface ShipmentsInfiniteListProps {
  filters?: Omit<QueryShipmentParams, 'page' | 'limit'>;
}

export default function ShipmentsInfiniteList({ filters = {} }: ShipmentsInfiniteListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['shipments', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      shipmentApi.list({ ...filters, page: pageParam as number, limit: PAGE_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const fetched = lastPage.page * lastPage.limit;
      return fetched < lastPage.total ? lastPage.page + 1 : undefined;
    },
    staleTime: 30_000,
  });

  // Intersection Observer to trigger next page
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const shipments = data?.pages.flatMap((p) => p.data) ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        Failed to load shipments. Please try again.
      </p>
    );
  }

  if (shipments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No shipments found.</p>
    );
  }

  return (
    <div className="space-y-4">
      {shipments.map((shipment) => (
        <ShipmentCard key={shipment.id} shipment={shipment} />
      ))}

      {/* Sentinel element for IntersectionObserver */}
      <div ref={sentinelRef} />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!hasNextPage && shipments.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          You&apos;ve reached the end.
        </p>
      )}
    </div>
  );
}
