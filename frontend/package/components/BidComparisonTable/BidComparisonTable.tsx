"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { apiClient } from "../../../lib/api/client";
import {
  Bid,
  BidComparisonTableProps,
  BidStatus,
  SortField,
  SortDirection,
} from "./types";
import {
  formatPrice,
  getRelativeTime,
  getCarrierRating,
  sortBids,
  areActionsDisabled,
} from "./utils";
import { StarRating } from "./StarRating";
import { BidConfirmationModal } from "./BidConfirmationModal";
import { EmptyBidsState } from "./EmptyBidsState";

export function BidComparisonTable({
  shipmentId,
  bids,
  carrierRatings = [],
  currency = "USD",
  onBidAccepted,
  onBidRejected,
  hasAcceptedBid: hasAcceptedBidProp,
}: BidComparisonTableProps) {
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);

  const hasAnyAccepted = hasAcceptedBidProp ?? areActionsDisabled(bids);
  const sortedBids = sortBids(bids, sortField, sortDirection, carrierRatings);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const acceptMutation = useMutation({
    mutationFn: (bidId: string) =>
      apiClient(`/shipments/${shipmentId}/bids/${bidId}/accept`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      toast.success("Bid accepted successfully!");
      queryClient.invalidateQueries({ queryKey: ["bids", shipmentId] });
      setSelectedBid(null);
      onBidAccepted?.(selectedBid!.id);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to accept bid. Please try again.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (bidId: string) =>
      apiClient(`/shipments/${shipmentId}/bids/${bidId}/reject`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      toast.success("Bid rejected");
      queryClient.invalidateQueries({ queryKey: ["bids", shipmentId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reject bid. Please try again.");
    },
  });

  const handleAcceptClick = (bid: Bid) => {
    setSelectedBid(bid);
  };

  const handleAcceptConfirm = () => {
    if (selectedBid) {
      acceptMutation.mutate(selectedBid.id);
    }
  };

  const handleAcceptCancel = () => {
    setSelectedBid(null);
  };

  const handleReject = (bidId: string) => {
    rejectMutation.mutate(bidId);
    onBidRejected?.(bidId);
  };

  if (bids.length === 0) {
    return <EmptyBidsState />;
  }

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <span className="text-muted-foreground ml-1">↕</span>;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bid Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Carrier</th>
                  <th
                    className="text-left py-3 px-4 font-medium cursor-pointer select-none"
                    onClick={() => handleSort("rating")}
                  >
                    <div className="flex items-center">
                      Rating
                      <SortIndicator field="rating" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium cursor-pointer select-none"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                      Price
                      <SortIndicator field="price" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Message</th>
                  <th className="text-left py-3 px-4 font-medium">Submitted</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedBids.map((bid) => {
                  const rating = getCarrierRating(
                    bid.carrierId,
                    carrierRatings,
                  );
                  const carrierName = `${bid.carrier.firstName} ${bid.carrier.lastName}`;
                  const isAccepted = bid.status === BidStatus.ACCEPTED;
                  const isRejected = bid.status === BidStatus.REJECTED;
                  const isDisabled = hasAnyAccepted && !isAccepted;

                  let rowClass = "border-b transition-colors";
                  if (isAccepted) {
                    rowClass += " bg-green-50 border-green-200";
                  } else if (isRejected) {
                    rowClass += " bg-gray-50 opacity-60";
                  } else {
                    rowClass += " hover:bg-muted/50";
                  }

                  return (
                    <tr key={bid.id} className={rowClass}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                            {bid.carrier.firstName[0]}
                            {bid.carrier.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium">{carrierName}</p>
                            <p className="text-xs text-muted-foreground">
                              {bid.carrier.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StarRating
                          rating={rating.averageRating}
                          showValue
                          size="sm"
                        />
                        {rating.totalReviews > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {rating.totalReviews} review
                            {rating.totalReviews !== 1 ? "s" : ""}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-base">
                          {formatPrice(bid.proposedPrice, currency)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {bid.message ? (
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                            {bid.message}
                          </p>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No message
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {getRelativeTime(bid.createdAt)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(bid.id)}
                            disabled={isDisabled || isAccepted || isRejected}
                          >
                            {isAccepted
                              ? "Accepted"
                              : isRejected
                                ? "Rejected"
                                : "Reject"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptClick(bid)}
                            disabled={isDisabled || isAccepted || isRejected}
                          >
                            {isAccepted
                              ? "Accepted"
                              : isRejected
                                ? "Rejected"
                                : "Accept"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedBid && (
        <BidConfirmationModal
          bid={selectedBid}
          carrierRating={getCarrierRating(
            selectedBid.carrierId,
            carrierRatings,
          )}
          currency={currency}
          onConfirm={handleAcceptConfirm}
          onCancel={handleAcceptCancel}
          isConfirming={acceptMutation.isPending}
        />
      )}
    </>
  );
}
