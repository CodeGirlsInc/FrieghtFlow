"use client";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Bid, CarrierRating } from "./types";
import { formatPrice, getRelativeTime, getCarrierRating } from "./utils";
import { StarRating } from "./StarRating";

interface BidConfirmationModalProps {
  bid: Bid;
  carrierRating: CarrierRating;
  currency: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming: boolean;
}

export function BidConfirmationModal({
  bid,
  carrierRating,
  currency,
  onConfirm,
  onCancel,
  isConfirming,
}: BidConfirmationModalProps) {
  const carrierName = `${bid.carrier.firstName} ${bid.carrier.lastName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Confirm Bid Acceptance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Carrier</span>
              <span className="font-medium">{carrierName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rating</span>
              <StarRating
                rating={carrierRating.averageRating}
                showValue
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Reviews
              </span>
              <span className="font-medium">{carrierRating.totalReviews}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Proposed Price
              </span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(bid.proposedPrice, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Bid Submitted
              </span>
              <span className="font-medium">
                {getRelativeTime(bid.createdAt)}
              </span>
            </div>
          </div>

          {bid.message && (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                Carrier Message
              </span>
              <p className="rounded-md bg-background p-3 text-sm border">
                {bid.message}
              </p>
            </div>
          )}

          <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Accepting this bid will automatically
              reject all other pending bids for this shipment and assign the
              carrier.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isConfirming}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? "Accepting..." : "Confirm Acceptance"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
