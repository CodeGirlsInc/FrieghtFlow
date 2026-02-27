'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../../stores/auth.store';
import { shipmentApi } from '../../../lib/api/shipment.api';
import { ShipmentStatus, PaginatedShipments } from '../../../types/shipment.types';
import { ShipmentCard } from '../../../components/shipment/shipment-card';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

const STATUS_TABS: { label: string; value: ShipmentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: ShipmentStatus.PENDING },
  { label: 'Accepted', value: ShipmentStatus.ACCEPTED },
  { label: 'In Transit', value: ShipmentStatus.IN_TRANSIT },
  { label: 'Delivered', value: ShipmentStatus.DELIVERED },
  { label: 'Completed', value: ShipmentStatus.COMPLETED },
];

export default function ShipmentsPage() {
  const { user } = useAuthStore();
  const [result, setResult] = useState<PaginatedShipments | null>(null);
  const [activeTab, setActiveTab] = useState<ShipmentStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    shipmentApi
      .list({ status: activeTab === 'all' ? undefined : activeTab })
      .then(setResult)
      .catch(() => toast.error('Failed to load shipments'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const isShipper = user?.role === 'shipper' || user?.role === 'admin';
  const pageTitle = user?.role === 'carrier' ? 'My Jobs' : 'My Shipments';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
        {isShipper && (
          <Button asChild>
            <Link href="/shipments/new">+ New Shipment</Link>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : !result || result.data.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">
            {activeTab === 'all'
              ? 'No shipments yet.'
              : `No shipments with status "${activeTab}".`}
          </p>
          {isShipper && activeTab === 'all' && (
            <Button asChild className="mt-4" variant="outline">
              <Link href="/shipments/new">Create your first shipment</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {result.data.map((s) => (
              <ShipmentCard key={s.id} shipment={s} />
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
