"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface ResolveDisputeModalProps {
  disputeId: string;
  trackingNumber: string;
  onSubmit: (
    resolutionNotes: string,
    decision: "completed" | "cancelled",
  ) => Promise<void>;
  onClose: () => void;
}

export function ResolveDisputeModal({
  trackingNumber,
  onSubmit,
  onClose,
}: ResolveDisputeModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [decision, setDecision] = useState<"completed" | "cancelled">(
    "completed",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!resolutionNotes.trim()) {
      setError("Resolution note is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(resolutionNotes, decision);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to resolve dispute",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg border border-border shadow-xl w-full max-w-lg">
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Resolve Dispute
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tracking: <span className="font-mono">{trackingNumber}</span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Decision
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setDecision("completed")}
                className={`flex-1 px-4 py-3 rounded-md border-2 text-sm font-medium transition-colors ${
                  decision === "completed"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-border bg-background text-foreground hover:border-muted-foreground"
                }`}
              >
                ✓ Complete Shipment
              </button>
              <button
                onClick={() => setDecision("cancelled")}
                className={`flex-1 px-4 py-3 rounded-md border-2 text-sm font-medium transition-colors ${
                  decision === "cancelled"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-border bg-background text-foreground hover:border-muted-foreground"
                }`}
              >
                ✕ Cancel Shipment
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="resolution-notes"
              className="text-sm font-medium text-foreground"
            >
              Resolution Note <span className="text-destructive">*</span>
            </label>
            <textarea
              id="resolution-notes"
              rows={5}
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Explain the resolution decision..."
              value={resolutionNotes}
              onChange={(e) => {
                setResolutionNotes(e.target.value);
                setError(null);
              }}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !resolutionNotes.trim()}
              variant={decision === "cancelled" ? "destructive" : "default"}
            >
              {isSubmitting ? "Resolving..." : "Confirm Resolution"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
