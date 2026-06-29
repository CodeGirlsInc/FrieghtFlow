'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Shipment, ShipmentStatus, ShipmentStatusHistory } from '../../../../types/shipment.types';
import { shipmentApi } from '../../../../lib/api/shipment.api';
import { messagingApi } from '../../../../lib/api/messaging.api';
import { bidApi, Bid, CounterBidPayload } from '../../../../lib/api/bid.api';
import { useAuthStore } from '../../../../stores/auth.store';
import { StatusBadge } from '../../../../components/shipment/status-badge';
import { StatusTimeline } from '../../../../components/shipment/status-timeline';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

// ─── Expiry countdown ────────────────────────────────────────────────────────
function ExpiryCountdown({ expiresAt }: { expiresAt?: string }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setLabel('Expired'); return; }
      const hours = Math.floor(diff / 3_600_000);
      const mins = Math.floor((diff % 3_600_000) / 60_000);
      setLabel(`Expires in ${hours}h ${mins}m`);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return null;
  return <span className="text-xs text-muted-foreground">{label}</span>;
}

// ─── Counter offer modal ─────────────────────────────────────────────────────
function CounterModal({
  bid,
  onClose,
  onSubmit,
}: {
  bid: Bid;
  onClose: () => void;
  onSubmit: (payload: CounterBidPayload) => Promise<void>;
}) {
  const [price, setPrice] = useState(String(bid.proposedPrice));
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const counterPrice = Number(price);
    if (!counterPrice || counterPrice <= 0) {
      toast.error('Enter a valid counter price');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ counterPrice, message: message.trim() || undefined });
      onClose();
    } catch {
      toast.error('Failed to submit counter offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="counter-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Card className="w-full max-w-sm mx-4">
        <CardHeader>
          <CardTitle id="counter-modal-title" className="text-base">Counter Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="counter-price" className="block text-sm font-medium mb-1">
                Your counter price
              </label>
              <input
                id="counter-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label htmlFor="counter-message" className="block text-sm font-medium mb-1">
                Message to carrier <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                id="counter-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Counter'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Bids tab ────────────────────────────────────────────────────────────────
function BidsTab({
  shipment,
  onBidAccepted,
}: {
  shipment: Shipment;
  onBidAccepted: () => Promise<void>;
}) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBid, setActionBid] = useState<string | null>(null);
  const [counterBid, setCounterBid] = useState<Bid | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const loadBids = useCallback(async () => {
    try {
      const data = await bidApi.listBids(shipment.id);
      setBids(data);
    } catch {
      toast.error('Failed to load bids');
    } finally {
      setLoading(false);
    }
  }, [shipment.id]);

  useEffect(() => { loadBids(); }, [loadBids]);

  const act = async (bidId: string, fn: () => Promise<unknown>, successMsg: string) => {
    setActionBid(bidId);
    try {
      await fn();
      toast.success(successMsg);
      await loadBids();
      if (successMsg.toLowerCase().includes('accepted')) await onBidAccepted();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setActionBid(null);
    }
  };

  const toggleMessage = (bidId: string) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(bidId)) next.delete(bidId); else next.add(bidId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No bids received yet. Carriers browsing the marketplace will submit bids here.
      </p>
    );
  }

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: shipment.currency || 'USD' }).format(amount);

  return (
    <>
      <div className="space-y-4">
        {bids.map((bid) => {
          const initials = `${bid.carrier.firstName[0]}${bid.carrier.lastName[0]}`;
          const msgLong = (bid.message?.length ?? 0) > 100;
          const expanded = expandedMessages.has(bid.id);
          const busy = actionBid === bid.id;

          return (
            <Card key={bid.id}>
              <CardContent className="p-4 space-y-3">
                {/* Carrier info */}
                <div className="flex items-center gap-3">
                  <Link
                    href={`/carriers/${bid.carrierId}`}
                    className="flex items-center gap-3 hover:opacity-80"
                    aria-label={`View carrier ${bid.carrier.firstName} ${bid.carrier.lastName}`}
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {bid.carrier.firstName} {bid.carrier.lastName}
                      </p>
                      {bid.carrier.rating != null && (
                        <p className="text-xs text-muted-foreground" aria-label={`Rating: ${bid.carrier.rating} out of 5`}>
                          {'★'.repeat(Math.round(bid.carrier.rating))}
                          {'☆'.repeat(5 - Math.round(bid.carrier.rating))}
                          {' '}({bid.carrier.rating.toFixed(1)})
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="ml-auto text-right">
                    <p className="text-lg font-bold text-foreground">{fmt(bid.proposedPrice)}</p>
                    <p className="text-xs text-muted-foreground">
                      Posted: {fmt(shipment.price)}
                    </p>
                  </div>
                </div>

                {/* Message */}
                {bid.message && (
                  <div className="text-sm text-muted-foreground">
                    {msgLong && !expanded
                      ? bid.message.slice(0, 100) + '…'
                      : bid.message}
                    {msgLong && (
                      <button
                        onClick={() => toggleMessage(bid.id)}
                        className="ml-1 text-primary text-xs hover:underline"
                      >
                        {expanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                )}

                {/* Times */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Submitted {new Date(bid.createdAt).toLocaleDateString()}</span>
                  <ExpiryCountdown expiresAt={bid.expiresAt} />
                </div>

                {/* Actions — only for pending bids on a pending shipment */}
                {shipment.status === ShipmentStatus.PENDING && bid.status === 'PENDING' && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        act(bid.id, () => bidApi.acceptBid(shipment.id, bid.id), 'Bid accepted — carrier assigned!')
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => setCounterBid(bid)}
                    >
                      Counter Offer
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() =>
                        act(bid.id, () => bidApi.rejectBid(shipment.id, bid.id), 'Bid rejected')
                      }
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {/* Show COUNTER_OFFERED status label */}
                {bid.status === 'COUNTER_OFFERED' && (
                  <p className="text-xs text-amber-600 font-medium">Counter offer sent</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {counterBid && (
        <CounterModal
          bid={counterBid}
          onClose={() => setCounterBid(null)}
          onSubmit={async (payload) => {
            await act(
              counterBid.id,
              () => bidApi.counterBid(shipment.id, counterBid.id, payload),
              'Counter offer submitted',
            );
          }}
        />
      )}
    </>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
type Tab = 'details' | 'bids';

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<ShipmentStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('details');

  const reload = useCallback(async () => {
    const [s, h] = await Promise.all([
      shipmentApi.getById(id),
      shipmentApi.getHistory(id),
    ]);
    setShipment(s);
    setHistory(h);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    reload()
      .catch(() => toast.error('Failed to load shipment'))
      .finally(() => setLoading(false));
  }, [reload]);

  const act = async (fn: () => Promise<unknown>, successMsg: string) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      await reload();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Shipment not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const isShipper = user?.id === shipment.shipperId;
  const isCarrier = user?.id === shipment.carrierId;
  const isAdmin = user?.role === 'admin';
  const showBidsTab = isShipper && shipment.status === ShipmentStatus.PENDING;

  const handleMessage = async () => {
    if (!shipment.carrierId) return;
    setMsgLoading(true);
    try {
      const conv = await messagingApi.getOrCreateConversation(shipment.id);
      router.push(`/messages?conversationId=${conv.id}`);
    } catch {
      toast.error('Could not open conversation');
    } finally {
      setMsgLoading(false);
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: shipment.currency || 'USD',
  }).format(Number(shipment.price));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="text-xs text-muted-foreground hover:text-foreground mb-2 block"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-foreground font-mono">
            {shipment.trackingNumber}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {shipment.origin} → {shipment.destination}
          </p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      {/* Tabs */}
      {showBidsTab && (
        <div className="flex gap-1 border-b">
          {(['details', 'bids'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Bids tab content */}
      {showBidsTab && activeTab === 'bids' ? (
        <BidsTab shipment={shipment} onBidAccepted={reload} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cargo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{shipment.cargoDescription}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Weight</span>
                    <p className="font-medium">{Number(shipment.weightKg).toLocaleString()} kg</p>
                  </div>
                  {shipment.volumeCbm && (
                    <div>
                      <span className="text-muted-foreground">Volume</span>
                      <p className="font-medium">{Number(shipment.volumeCbm)} m³</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Price</span>
                    <p className="font-semibold text-foreground">{formattedPrice}</p>
                  </div>
                </div>
                {shipment.notes && (
                  <p className="text-muted-foreground italic text-sm border-t pt-2">
                    {shipment.notes}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipper</span>
                  <span className="font-medium">
                    {shipment.shipper.firstName} {shipment.shipper.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carrier</span>
                  <span className="font-medium">
                    {shipment.carrier
                      ? `${shipment.carrier.firstName} ${shipment.carrier.lastName}`
                      : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {/* Carrier actions */}
                {shipment.status === ShipmentStatus.PENDING && !isShipper && (
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => act(() => shipmentApi.accept(shipment.id), 'Shipment accepted!')}
                  >
                    Accept Job
                  </Button>
                )}
                {shipment.status === ShipmentStatus.ACCEPTED && isCarrier && (
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => act(() => shipmentApi.pickup(shipment.id), 'Marked as picked up!')}
                  >
                    Mark Picked Up
                  </Button>
                )}
                {shipment.status === ShipmentStatus.IN_TRANSIT && isCarrier && (
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() =>
                      act(() => shipmentApi.markDelivered(shipment.id), 'Marked as delivered!')
                    }
                  >
                    Mark Delivered
                  </Button>
                )}

                {/* Shipper actions */}
                {shipment.status === ShipmentStatus.DELIVERED && isShipper && (
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() =>
                      act(() => shipmentApi.confirmDelivery(shipment.id), 'Delivery confirmed!')
                    }
                  >
                    Confirm Delivery
                  </Button>
                )}

                {/* Cancel */}
                {[ShipmentStatus.PENDING, ShipmentStatus.ACCEPTED].includes(shipment.status) &&
                  (isShipper || isCarrier || isAdmin) && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading}
                      onClick={() =>
                        act(() => shipmentApi.cancel(shipment.id, 'Cancelled by user'), 'Shipment cancelled')
                      }
                    >
                      Cancel
                    </Button>
                  )}

                {/* Dispute */}
                {[ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELIVERED].includes(shipment.status) &&
                  (isShipper || isCarrier) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading}
                      onClick={() =>
                        act(
                          () => shipmentApi.raiseDispute(shipment.id, 'Dispute raised by user'),
                          'Dispute raised',
                        )
                      }
                    >
                      Raise Dispute
                    </Button>
                  )}

                {/* Admin resolve */}
                {shipment.status === ShipmentStatus.DISPUTED && isAdmin && (
                  <>
                    <Button
                      size="sm"
                      disabled={actionLoading}
                      onClick={() =>
                        act(
                          () =>
                            shipmentApi.resolveDispute(
                              shipment.id,
                              ShipmentStatus.COMPLETED,
                              'Resolved by admin — completed',
                            ),
                          'Dispute resolved — completed',
                        )
                      }
                    >
                      Resolve: Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading}
                      onClick={() =>
                        act(
                          () =>
                            shipmentApi.resolveDispute(
                              shipment.id,
                              ShipmentStatus.CANCELLED,
                              'Resolved by admin — cancelled',
                            ),
                          'Dispute resolved — cancelled',
                        )
                      }
                    >
                      Resolve: Cancel
                    </Button>
                  </>
                )}

                {[ShipmentStatus.COMPLETED, ShipmentStatus.CANCELLED].includes(shipment.status) && (
                  <p className="text-sm text-muted-foreground">
                    This shipment is {shipment.status} — no further actions available.
                  </p>
                )}

                {/* Message button — visible once a carrier is assigned */}
                {shipment.carrierId && (isShipper || isCarrier) && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={msgLoading}
                    onClick={handleMessage}
                  >
                    {msgLoading ? 'Opening…' : isShipper ? 'Message Carrier' : 'Message Shipper'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: timeline */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline history={history} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
