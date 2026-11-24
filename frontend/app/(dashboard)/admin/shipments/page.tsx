'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../stores/auth.store';
import { adminApi, PaginatedAdminShipments } from '../../../../lib/api/admin.api';
import { ShipmentStatus } from '../../../../types/shipment.types';
import { Button } from '../../../../components/ui/button';
import { Pagination } from '../../../../components/ui/pagination';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { cn } from '../../../../lib/utils';

const STATUS_TABS: { label: string; value: ShipmentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: ShipmentStatus.PENDING },
  { label: 'Accepted', value: ShipmentStatus.ACCEPTED },
  { label: 'In Transit', value: ShipmentStatus.IN_TRANSIT },
  { label: 'Delivered', value: ShipmentStatus.DELIVERED },
  { label: 'Completed', value: ShipmentStatus.COMPLETED },
  { label: 'Disputed', value: ShipmentStatus.DISPUTED },
  { label: 'Cancelled', value: ShipmentStatus.CANCELLED },
];

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  [ShipmentStatus.PENDING]: 'bg-yellow-500/10 text-yellow-600',
  [ShipmentStatus.ACCEPTED]: 'bg-blue-500/10 text-blue-600',
  [ShipmentStatus.IN_TRANSIT]: 'bg-indigo-500/10 text-indigo-600',
  [ShipmentStatus.DELIVERED]: 'bg-teal-500/10 text-teal-600',
  [ShipmentStatus.COMPLETED]: 'bg-green-500/10 text-green-600',
  [ShipmentStatus.CANCELLED]: 'bg-muted text-muted-foreground',
  [ShipmentStatus.DISPUTED]: 'bg-destructive/10 text-destructive',
};

export default function AdminShipmentsPage() {
  return (
    <Suspense fallback={null}>
      <AdminShipmentsTable />
    </Suspense>
  );
}

function AdminShipmentsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [result, setResult] = useState<PaginatedAdminShipments | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ShipmentStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState(searchParams.get('from') ?? '');
  const [toDate, setToDate] = useState(searchParams.get('to') ?? '');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .listShipments({
        status: activeTab === 'all' ? undefined : activeTab,
        page,
        limit: 20,
        from: fromDate || undefined,
        to: toDate || undefined,
      })
      .then(setResult)
      .catch(() => toast.error('Failed to load shipments'))
      .finally(() => setLoading(false));
  }, [activeTab, page, fromDate, toDate]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    load();
  }, [user, load]);

  // Date-range filter: the URL is the source of truth so the view can be
  // shared, and changing a bound resets to page 1 since earlier pages don't
  // apply to the new range.
  const updateDateFilter = (which: 'from' | 'to', value: string) => {
    const nextFrom = which === 'from' ? value : fromDate;
    const nextTo = which === 'to' ? value : toDate;
    setPage(1);
    setFromDate(nextFrom);
    setToDate(nextTo);
    const params = new URLSearchParams();
    if (nextFrom) params.set('from', nextFrom);
    if (nextTo) params.set('to', nextTo);
    const search = params.toString();
    router.replace(search ? `/admin/shipments?${search}` : '/admin/shipments');
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Shipments</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {result ? `${result.total} total shipments` : 'Loading…'}
        </p>
      </div>

      {/* Date-range filter */}
      <div className="flex items-center gap-3">
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          type="date"
          value={fromDate}
          onChange={(e) => updateDateFilter('from', e.target.value)}
        />
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          type="date"
          value={toDate}
          onChange={(e) => updateDateFilter('to', e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-border">
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

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : !result || result.data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No shipments found.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Shipments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Tracking #
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Route
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Shipper
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Carrier
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Created
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.data.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {shipment.trackingNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs">
                          {shipment.origin} → {shipment.destination}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {shipment.shipper
                          ? `${shipment.shipper.firstName} ${shipment.shipper.lastName}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {shipment.carrier
                          ? `${shipment.carrier.firstName} ${shipment.carrier.lastName}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                            STATUS_STYLES[shipment.status],
                          )}
                        >
                          {shipment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {/* price is a Postgres decimal with no TypeORM
                            transformer, so the API can hand it back as a
                            string — coerce before formatting, as every other
                            shipment call site does. */}
                        {shipment.currency} {Number(shipment.price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(shipment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/shipments/${shipment.id}`}>View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {result && result.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={result.totalPages}
          currentCount={result.data.length}
          total={result.total}
          itemLabel="shipments"
          onPageChange={setPage}
          label="Shipments pagination"
        />
      )}
    </div>
  );
}
