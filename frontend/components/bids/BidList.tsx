'use client';

import { useState, useEffect } from 'react';
import { Check, X, DollarSign } from 'lucide-react';

interface Bid {
  id: string;
  amount: number;
  note: string;
  carrierName: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface BidListProps {
  shipmentId: string;
  onAccept?: (bidId: string) => void;
  onReject?: (bidId: string) => void;
}

export function BidList({ shipmentId, onAccept, onReject }: BidListProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, [shipmentId]);

  const fetchBids = async () => {
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/bids`);
      const data = await response.json();
      setBids(data);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading bids...</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Bids</h3>
      {bids.length === 0 ? (
        <p className="text-gray-500">No bids received yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {bids.map((bid) => (
            <li key={bid.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">{bid.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{bid.carrierName}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {bid.status === 'pending' && (
                  <>
                    <button
                      onClick={() => onAccept?.(bid.id)}
                      className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onReject?.(bid.id)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
                <span className="text-sm text-gray-500 capitalize">{bid.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
