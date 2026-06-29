"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { bidApi, Bid, BidStatus } from "../../../lib/api/bid.api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { TableRowSkeleton } from "../../../components/skeletons";
import { EmptyBids } from "../../../components/ui/empty-state";

function getBidStatusClass(status: BidStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "ACCEPTED":
    case "COUNTER_ACCEPTED":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "REJECTED":
    case "COUNTER_REJECTED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "COUNTER_OFFERED":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    case "EXPIRED":
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function ExpiryCountdown({ expiresAt }: { expiresAt?: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!expiresAt) return;

    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel("Expired");
        return;
      }
      const hours = Math.floor(diff / 3_600_000);
      const mins = Math.floor((diff % 3_600_000) / 60_000);
      setLabel(`Expires in ${hours}h ${mins}m`);
    };

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return null;
  const expired = label === "Expired";
  return (
    <span
      className={`text-xs ${expired ? "text-gray-400" : "text-muted-foreground"}`}
    >
      {label}
    </span>
  );
}

export default function BidsDashboardPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const confirmRef = useRef<{
    bidId: string;
    action: "accept" | "decline";
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await bidApi.listMyBids();
      setBids(data);
    } catch {
      toast.error("Failed to load bids");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCounterAction = (bidId: string, action: "accept" | "decline") => {
    confirmRef.current = { bidId, action };
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    const ref = confirmRef.current;
    if (!ref) return;
    const bid = bids.find((b) => b.id === ref.bidId);
    if (!bid) return;

    setShowConfirm(false);
    setActionLoading(ref.bidId);
    try {
      if (ref.action === "accept") {
        await bidApi.acceptCounter(bid.shipmentId, bid.id);
        toast.success("Counter offer accepted");
      } else {
        await bidApi.declineCounter(bid.shipmentId, bid.id);
        toast.success("Counter offer declined");
      }
      await load();
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-3">
        <div className="h-7 w-32 bg-muted rounded animate-pulse" />
        <Card>
          <CardContent className="p-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRowSkeleton key={i} columns={7} />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-foreground">My Bids</h1>

      {bids.length === 0 ? (
        <EmptyBids />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Bids</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Route</th>
                    <th className="text-left px-4 py-3 font-medium">
                      Tracking
                    </th>
                    <th className="text-right px-4 py-3 font-medium">
                      Your Price
                    </th>
                    <th className="text-right px-4 py-3 font-medium">
                      Counter
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Expiry</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid) => (
                    <tr
                      key={bid.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-foreground">
                        {bid.shipment
                          ? `${bid.shipment.origin} → ${bid.shipment.destination}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {bid.shipment ? (
                          <Link
                            href={`/shipments/${bid.shipmentId}`}
                            className="font-mono text-xs text-primary hover:underline"
                          >
                            {bid.shipment.trackingNumber}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ${Number(bid.proposedPrice).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {bid.counterPrice != null ? (
                          <span className="text-amber-600 font-medium">
                            ${Number(bid.counterPrice).toLocaleString()}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getBidStatusClass(bid.status)}`}
                        >
                          {bid.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ExpiryCountdown expiresAt={bid.expiresAt} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {bid.status === "COUNTER_OFFERED" && (
                            <>
                              <Button
                                size="sm"
                                disabled={actionLoading === bid.id}
                                onClick={() =>
                                  handleCounterAction(bid.id, "accept")
                                }
                              >
                                Accept Counter
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading === bid.id}
                                onClick={() =>
                                  handleCounterAction(bid.id, "decline")
                                }
                              >
                                Decline Counter
                              </Button>
                            </>
                          )}
                          <Link
                            href={`/shipments/${bid.shipmentId}`}
                            className="text-xs text-primary hover:underline whitespace-nowrap"
                          >
                            View Shipment
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <Card className="w-full max-w-sm mx-4">
            <CardHeader>
              <CardTitle id="confirm-title" className="text-base">
                {confirmRef.current?.action === "accept"
                  ? "Accept Counter Offer?"
                  : "Decline Counter Offer?"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {confirmRef.current?.action === "accept"
                  ? "This will accept the counter offer and update the bid status."
                  : "This will decline the counter offer."}
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmAction}>Confirm</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
