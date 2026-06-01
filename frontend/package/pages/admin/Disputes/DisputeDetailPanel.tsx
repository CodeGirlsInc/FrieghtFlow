"use client";

import { useState } from "react";
import { Dispute, DisputeStatus } from "./types";
import { ResolveDisputeModal } from "./ResolveDisputeModal";
import { Button } from "@/components/ui/button";

export interface DisputeDetailPanelProps {
  dispute: Dispute;
  onClose: () => void;
  onResolve: (
    disputeId: string,
    resolutionNotes: string,
    decision: "completed" | "cancelled",
  ) => Promise<void>;
}

const STATUS_COLORS: Record<DisputeStatus, string> = {
  [DisputeStatus.OPEN]: "bg-yellow-100 text-yellow-800 border-yellow-300",
  [DisputeStatus.UNDER_REVIEW]: "bg-blue-100 text-blue-800 border-blue-300",
  [DisputeStatus.RESOLVED]: "bg-green-100 text-green-800 border-green-300",
  [DisputeStatus.DISMISSED]: "bg-gray-100 text-gray-800 border-gray-300",
};

const STATUS_LABELS: Record<DisputeStatus, string> = {
  [DisputeStatus.OPEN]: "Open",
  [DisputeStatus.UNDER_REVIEW]: "Under Review",
  [DisputeStatus.RESOLVED]: "Resolved",
  [DisputeStatus.DISMISSED]: "Dismissed",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DisputeDetailPanel({
  dispute,
  onClose,
  onResolve,
}: DisputeDetailPanelProps) {
  const [showResolveModal, setShowResolveModal] = useState(false);

  const handleResolve = async (
    resolutionNotes: string,
    decision: "completed" | "cancelled",
  ) => {
    await onResolve(dispute.id, resolutionNotes, decision);
    setShowResolveModal(false);
  };

  const isResolved =
    dispute.status === DisputeStatus.RESOLVED ||
    dispute.status === DisputeStatus.DISMISSED;

  return (
    <>
      {showResolveModal && (
        <ResolveDisputeModal
          disputeId={dispute.id}
          trackingNumber={dispute.trackingNumber}
          onSubmit={handleResolve}
          onClose={() => setShowResolveModal(false)}
        />
      )}

      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose}>
        <div
          className="absolute right-0 top-0 h-full w-full max-w-2xl bg-card border-l border-border shadow-xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between">
            <div>
              <p className="font-mono text-xs text-muted-foreground">
                {dispute.trackingNumber}
              </p>
              <h2 className="text-xl font-semibold text-foreground mt-1">
                Dispute Details
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  STATUS_COLORS[dispute.status]
                }`}
              >
                {STATUS_LABELS[dispute.status]}
              </span>
              <span className="text-xs text-muted-foreground">
                Opened {formatDate(dispute.createdAt)}
              </span>
            </div>

            {/* Reason & Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Reason</h3>
              <p className="text-sm font-medium text-foreground">
                {dispute.reason}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Description
              </h3>
              <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 rounded-md p-4">
                {dispute.description}
              </p>
            </div>

            {/* Party Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Shipper
                </h3>
                <div className="bg-muted/50 rounded-md p-4 space-y-1">
                  <p className="text-sm font-medium">
                    {dispute.shipper.firstName} {dispute.shipper.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dispute.shipper.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Carrier
                </h3>
                {dispute.carrier ? (
                  <div className="bg-muted/50 rounded-md p-4 space-y-1">
                    <p className="text-sm font-medium">
                      {dispute.carrier.firstName} {dispute.carrier.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dispute.carrier.email}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No carrier assigned
                  </p>
                )}
              </div>
            </div>

            {/* Shipment Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Shipment Details
              </h3>
              <div className="bg-muted/50 rounded-md p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route:</span>
                  <span className="font-medium">
                    {dispute.origin} → {dispute.destination}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cargo:</span>
                  <span className="font-medium">
                    {dispute.cargoDescription}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: dispute.currency,
                    }).format(dispute.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Files */}
            {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Evidence Files
                </h3>
                <div className="space-y-2">
                  {dispute.evidenceUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      📎 Evidence file {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {dispute.timeline && dispute.timeline.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Dispute Timeline
                </h3>
                <div className="space-y-3">
                  {dispute.timeline.map((event) => (
                    <div key={event.id} className="flex gap-3 text-sm">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">
                          {event.changedBy.firstName} {event.changedBy.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.fromStatus || "Created"} → {event.toStatus}
                        </p>
                        {event.reason && (
                          <p className="text-xs text-muted-foreground italic">
                            {event.reason}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(event.changedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Info */}
            {isResolved && dispute.resolutionNotes && (
              <div className="space-y-2 border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-green-700">
                  Resolution
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-md p-4 space-y-2">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {dispute.resolutionNotes}
                  </p>
                  {dispute.resolvedBy && (
                    <p className="text-xs text-muted-foreground">
                      Resolved by {dispute.resolvedBy.firstName}{" "}
                      {dispute.resolvedBy.lastName}
                      {dispute.resolvedAt &&
                        ` on ${formatDate(dispute.resolvedAt)}`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Resolve Button */}
            {!isResolved && (
              <div className="border-t border-border pt-4">
                <Button
                  onClick={() => setShowResolveModal(true)}
                  className="w-full"
                  size="lg"
                >
                  Resolve Dispute
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
