'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../../stores/auth.store';
import { adminApi } from '../../../../lib/api/admin.api';
import { Shipment } from '../../../../types/shipment.types';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { toast } from 'sonner';

const TABS = [
  'All',
  'Pending',
  'Accepted',
  'In Transit',
  'Delivered',
  'Completed',
  'Disputed',
  'Cancelled',
];

export default function AdminShipmentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadShipments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.listShipments(page, activeTab);
      setShipments(res.data || []);
      setTotalPages(res.totalPages || Math.max(1, Math.ceil((res.total || 0) / (res.limit || 10))));
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    } else if (user) {
      loadShipments();
    }
  }, [user, router, loadShipments]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
      case 'disputed':
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
      case 'in_transit':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
      case 'delivered':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400';
      case 'accepted':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shipment Oversight</h1>
        <p className="text-muted-foreground mt-1">Monitor all platform shipments.</p>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-colors focus:outline-none ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card className="border shadow-sm overflow-x-auto text-sm">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="h-12 px-4 font-medium">Tracking #</th>
              <th className="h-12 px-4 font-medium">Route</th>
              <th className="h-12 px-4 font-medium">Shipper</th>
              <th className="h-12 px-4 font-medium">Carrier</th>
              <th className="h-12 px-4 font-medium">Status</th>
              <th className="h-12 px-4 font-medium">Price</th>
              <th className="h-12 px-4 font-medium">Created Date</th>
              <th className="h-12 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y relative">
            {loading && (
              <tr>
                <td colSpan={8} className="p-4">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 animate-pulse">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-4 bg-muted rounded w-20"></div>
                        <div className="h-4 bg-muted rounded w-16"></div>
                        <div className="h-4 bg-muted rounded w-20"></div>
                        <div className="h-4 bg-muted rounded w-12 ml-auto"></div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            )}
            {!loading && shipments.length === 0 && (
              <tr>
                <td colSpan={8} className="h-24 text-center text-muted-foreground">
                  No shipments found.
                </td>
              </tr>
            )}
            {!loading &&
              shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-mono font-medium">{shipment.trackingNumber || shipment.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4 truncate max-w-[200px]" title={`${shipment.origin} → ${shipment.destination}`}>
                    <span className="font-semibold">{shipment.origin}</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="font-semibold">{shipment.destination}</span>
                  </td>
                  <td className="p-4">
                    {shipment.shipper ? `${shipment.shipper.firstName} ${shipment.shipper.lastName}` : 'N/A'}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {shipment.carrier ? `${shipment.carrier.firstName} ${shipment.carrier.lastName}` : 'Unassigned'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadge(
                        shipment.status
                      )}`}
                    >
                      {shipment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-medium">
                    {shipment.price.toLocaleString()} {shipment.currency || 'USD'}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(shipment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/shipments/${shipment.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
