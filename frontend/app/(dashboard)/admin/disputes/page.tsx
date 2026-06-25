'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../stores/auth.store';
import { adminApi } from '../../../../lib/api/admin.api';
import { shipmentApi } from '../../../../lib/api/shipment.api';
import { ShipmentStatus, type Shipment, type ShipmentStatusHistory } from '../../../../types/shipment.types';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { StatusTimeline } from '../../../../components/shipment/status-timeline';

const fmt = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);

function ConfirmDialog({
  resolution,
  note,
  onNote,
  onConfirm,
  onCancel,
  loading,
}: {
  resolution: ShipmentStatus.COMPLETED | ShipmentStatus.CANCELLED;
  note: string;
  onNote: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg border border-border shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-semibold text-foreground">
          Resolve as {resolution === ShipmentStatus.COMPLETED ? 'Completed' : 'Cancelled'}?
        </h3>
        <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Resolution Note</label>
          <textarea
            className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 resize-none"
            rows={3}
            placeholder="Explain the resolution…"
            value={note}
            onChange={(e) => onNote(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button
            size="sm"
            variant={resolution === ShipmentStatus.CANCELLED ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading || !note.trim()}
          >
            {loading ? 'Resolving…' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DisputeDetail({
  shipment,
  onClose,
  onResolved,
}: {
  shipment: Shipment;
  onClose: () => void;
  onResolved: () => void;
}) {
  const [history, setHistory] = useState<ShipmentStatusHistory[]>([]);
  const [histLoaded, setHistLoaded] = useState(false);
  const [dialog, setDialog] = useState<ShipmentStatus.COMPLETED | ShipmentStatus.CANCELLED | null>(null);
  const [note, setNote] = useState('');
  const [resolving, setResolving] = useState(false);

  const loadHistory = useCallback(async () => {
    if (histLoaded) return;
    try {
      const h = await shipmentApi.getHistory(shipment.id);
      setHistory(h);
      setHistLoaded(true);
    } catch {
      // best-effort
    }
  }, [shipment.id, histLoaded]);

  useState(() => { loadHistory(); });

  const resolve = async () => {
    if (!dialog) return;
    setResolving(true);
    try {
      await shipmentApi.resolveDispute(shipment.id, dialog, note);
      toast.success(`Dispute resolved — ${dialog}`);
      onResolved();
    } catch {
      toast.error('Failed to resolve dispute');
    } finally {
      setResolving(false);
      setDialog(null);
    }
  };

  return (
    <>
      {dialog && (
        <ConfirmDialog
          resolution={dialog}
          note={note}
          onNote={setNote}
          onConfirm={resolve}
          onCancel={() => setDialog(null)}
          loading={resolving}
        />
      )}
      <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-4">
        <div className="bg-card rounded-lg border border-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <p className="font-mono text-xs text-muted-foreground">{shipment.trackingNumber}</p>
              <h2 className="font-semibold text-foreground">{shipment.origin} → {shipment.destination}</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">✕</button>
          </div>
          <div className="p-6 space-y-6">
            {/* Parties & value */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Shipper</p>
                <p className="font-medium">{shipment.shipper.firstName} {shipment.shipper.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Carrier</p>
                <p className="font-medium">{shipment.carrier ? `${shipment.carrier.firstName} ${shipment.carrier.lastName}` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Value</p>
                <p className="font-medium">{fmt(Number(shipment.price), shipment.currency)}</p>
              </div>
            </div>

            {/* Notes / evidence */}
            {shipment.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Dispute Evidence / Notes</p>
                <p className="text-sm bg-muted/50 rounded-md p-3 italic">{shipment.notes}</p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">Status History</p>
              <StatusTimeline history={history} />
            </div>

            {/* Resolution actions */}
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                size="sm"
                onClick={() => { setNote(''); setDialog(ShipmentStatus.COMPLETED); }}
              >
                Resolve: Complete
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => { setNote(''); setDialog(ShipmentStatus.CANCELLED); }}
              >
                Resolve: Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminDisputesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Shipment | null>(null);

  const { data: result, isLoading } = useQuery({
    queryKey: ['admin-disputes', page],
    queryFn: () => adminApi.listShipments({ status: ShipmentStatus.DISPUTED, page, limit: 20 }),
    enabled: user?.role === 'admin',
  });

  if (user && user.role !== 'admin') {
    router.replace('/dashboard');
    return null;
  }

  return (
    <>
      {selected && (
        <DisputeDetail
          shipment={selected}
          onClose={() => setSelected(null)}
          onResolved={() => {
            setSelected(null);
            queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
          }}
        />
      )}

      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dispute Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {result ? `${result.total} active dispute${result.total !== 1 ? 's' : ''}` : 'Loading…'}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : !result || result.data.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No active disputes. 🎉
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Disputes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Shipper</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Carrier</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date Raised</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Value</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.data.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.trackingNumber}</td>
                        <td className="px-4 py-3 text-xs">{s.shipper.firstName} {s.shipper.lastName}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {s.carrier ? `${s.carrier.firstName} ${s.carrier.lastName}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(s.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium">{fmt(Number(s.price), s.currency)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => setSelected(s)}>
                            Review
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

        {result && result.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">Showing {result.data.length} of {result.total}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page === result.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
