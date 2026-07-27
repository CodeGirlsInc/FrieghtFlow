'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Bid {
  id: string;
  amount: number;
  eta: string;
  note: string;
  carrierId: string;
  carrierName: string;
  carrierRating: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt?: string;
}

interface BidListProps {
  shipmentId: string;
  shipmentStatus: string;
  userRole?: string;
  onAccept?: (bidId: string) => void;
  onReject?: (bidId: string) => void;
}

function timeRemaining(expiresAt?: string): string | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hrs = Math.floor(diff / 3600000);
  if (hrs >= 24) return `${Math.floor(hrs / 24)}d left`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}m left`;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  accepted: 'bg-green-500/10 text-green-600',
  rejected: 'bg-muted text-muted-foreground',
  expired: 'bg-destructive/10 text-destructive',
};

export function BidList({ shipmentId, shipmentStatus, userRole, onAccept, onReject }: BidListProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidEta, setBidEta] = useState('');
  const [bidNote, setBidNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAssigned = shipmentStatus !== 'pending';

  useEffect(() => {
    fetchBids();
  }, [shipmentId]);

  const fetchBids = async () => {
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/bids`);
      const data = await response.json();
      setBids(data);
    } catch {
      // Failed to load bids
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async () => {
    if (!bidAmount || !bidEta) {
      toast.error('Please fill in price and ETA.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(bidAmount),
          eta: bidEta,
          note: bidNote,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 409) {
          toast.error('This shipment has already been assigned to another carrier.');
        } else {
          toast.error(err.message ?? 'Failed to submit bid.');
        }
        setShowBidForm(false);
        return;
      }

      toast.success('Bid submitted!');
      setBidAmount('');
      setBidEta('');
      setBidNote('');
      setShowBidForm(false);
      fetchBids();
    } catch {
      toast.error('Failed to submit bid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Bids ({bids.length})</h3>
        {userRole === 'carrier' && !isAssigned && !showBidForm && (
          <Button size="sm" onClick={() => setShowBidForm(true)}>
            Place a bid
          </Button>
        )}
      </div>

      {/* Carrier bid form */}
      {showBidForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Bid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bidAmount">Price ($)</Label>
                <Input
                  id="bidAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="1500.00"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bidEta">Estimated delivery</Label>
                <Input
                  id="bidEta"
                  type="date"
                  value={bidEta}
                  onChange={(e) => setBidEta(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bidNote">Note (optional)</Label>
              <textarea
                id="bidNote"
                rows={2}
                placeholder="Why should the shipper choose you?"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                value={bidNote}
                onChange={(e) => setBidNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowBidForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSubmitBid} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit bid'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bid list */}
      {bids.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No bids received yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {bids.map((bid) => (
            <Card key={bid.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">${bid.amount.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[bid.status] ?? ''}`}>
                        {bid.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{bid.carrierName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      {bid.carrierRating > 0 && (
                        <span>⭐ {bid.carrierRating.toFixed(1)}</span>
                      )}
                      <span>ETA: {new Date(bid.eta).toLocaleDateString()}</span>
                      {bid.expiresAt && (
                        <span className={timeRemaining(bid.expiresAt)?.includes('Expired') ? 'text-destructive' : ''}>
                          {timeRemaining(bid.expiresAt)}
                        </span>
                      )}
                    </div>
                    {bid.note && (
                      <p className="text-xs text-muted-foreground mt-2 italic">"{bid.note}"</p>
                    )}
                  </div>

                  {/* Shipper actions */}
                  {userRole === 'shipper' && bid.status === 'pending' && onAccept && onReject && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600/30 hover:bg-green-500/10"
                        onClick={() => onAccept(bid.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => onReject(bid.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assigned notice */}
      {isAssigned && (
        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground text-center">
          This shipment has been assigned. Bidding is closed.
        </div>
      )}
    </div>
  );
}
