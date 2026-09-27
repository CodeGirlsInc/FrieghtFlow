'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { ShipmentStatus } from '../../../types/shipment.types';
import { ShipmentCard } from '../../../components/shipment/shipment-card';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '../../../lib/api/client';
import { shipmentApi } from '../../../lib/api/shipment.api';

const SHIPMENTS_PAGE_SIZE = 10;

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
  const [activeTab, setActiveTab] = useState<ShipmentStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const status = activeTab === 'all' ? undefined : activeTab;

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['shipments', 'list', status, page],
    queryFn: () =>
      shipmentApi.list({ status, page, limit: SHIPMENTS_PAGE_SIZE }),
  });

  useEffect(() => {
    if (error) toast.error('Failed to load shipments');
  }, [error]);

  const totalPages = result?.totalPages ?? 0;

  // A deletion (or a status change) can shrink the result set so the current
  // page no longer exists; fall back to the last page instead of rendering an
  // empty list while `total` is still non-zero.
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const currentPage = totalPages > 0 ? Math.min(page, totalPages) : page;
  const from = result ? (currentPage - 1) * SHIPMENTS_PAGE_SIZE + 1 : 0;
  const to = result ? Math.min(currentPage * SHIPMENTS_PAGE_SIZE, result.total) : 0;

  const exportCsv = async () => {
    setExporting(true);
    try {
      const blob = await apiClient<Blob>('/shipments/export?format=csv', {
        headers: { Accept: 'text/csv' },
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shipments.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to export CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const isShipper = user?.role === 'shipper' || user?.role === 'admin';
  const pageTitle = user?.role === 'carrier' ? 'My Jobs' : 'My Shipments';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={exporting}
            aria-label="Export shipments as CSV"
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Exporting…
              </>
            ) : (
              'Export CSV'
            )}
          </Button>
          {isShipper && (
            <Button asChild>
              <Link href="/shipments/new">+ New Shipment</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveTab(tab.value); setPage(1); }}
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
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !result || result.data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No shipments found.</p>
      ) : (
        <div className="space-y-4">
          {result.data.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {result && result.total > 0 && (
        <nav
          aria-label="Shipments pagination"
          className="flex items-center justify-between text-sm mt-6"
        >
          <p className="text-muted-foreground">
            Showing {from}-{to} of {result.total} shipments
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-muted-foreground">
              Page{' '}
              <span aria-current="page">{currentPage}</span> of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
