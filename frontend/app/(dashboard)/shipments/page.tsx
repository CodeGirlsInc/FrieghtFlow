'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { shipmentApi, Shipment, UserRole, ShipmentStatus } from '@/lib/api/shipment';
import { ShipmentCard } from '@/components/ShipmentCard';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const STATUS_TABS: { label: string; value: ShipmentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
];

function ShipmentCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 animate-pulse bg-gray-50/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-5 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ShipmentsPage() {
  const [role] = useState<UserRole>('shipper'); // Mock user role
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ShipmentStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const canCreateShipment = role === 'shipper' || role === 'admin';

  const fetchShipments = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const data = await shipmentApi.list({ status });
      setShipments(data);
      // For "All" tab, total = data length; for filtered tabs, we show filtered count
      const allData = await shipmentApi.list({});
      setTotalCount(allData.length);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
      toast.error('Failed to load shipments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const showCreateFirstCta = !isLoading && shipments.length === 0 && activeTab === 'all' && canCreateShipment;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your shipments
          </p>
        </div>
        {canCreateShipment && (
          <Button asChild>
            <Link href="/shipments/new">
              <Plus className="h-4 w-4 mr-2" />
              New Shipment
            </Link>
          </Button>
        )}
      </div>

      <div className="border-b">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Status filter">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                py-3 px-1 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors
                ${activeTab === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <ShipmentCardSkeleton key={i} />
          ))}
        </div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-gray-50/50">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
            <Package className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium">No shipments found</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm mx-auto">
            {showCreateFirstCta
              ? "You don't have any shipments yet. Create your first one to get started."
              : "No shipments match the selected filter."}
          </p>
          {showCreateFirstCta && (
            <Button asChild>
              <Link href="/shipments/new">Create your first shipment</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {shipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {shipments.length} of {totalCount} shipments
          </p>
        </>
      )}
    </div>
  );
}
