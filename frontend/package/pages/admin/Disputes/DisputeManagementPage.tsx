"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api/client";
import { DisputeDetailPanel } from "./DisputeDetailPanel";
import { StatusFilterTabs } from "./StatusFilterTabs";
import {
  Dispute,
  DisputeStatus,
  DisputeListResult,
  ResolveDisputePayload,
} from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// API functions
const disputeApi = {
  listDisputes(
    status?: DisputeStatus | "all",
    page = 1,
    limit = 20,
  ): Promise<DisputeListResult> {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    params.set("page", String(page));
    params.set("limit", String(limit));

    return apiClient<DisputeListResult>(`/admin/disputes?${params.toString()}`);
  },

  resolveDispute(
    disputeId: string,
    payload: ResolveDisputePayload,
  ): Promise<Dispute> {
    return apiClient<Dispute>(`/admin/disputes/${disputeId}/resolve`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// Utility functions
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const STATUS_COLORS: Record<DisputeStatus, string> = {
  [DisputeStatus.OPEN]: "bg-yellow-100 text-yellow-800",
  [DisputeStatus.UNDER_REVIEW]: "bg-blue-100 text-blue-800",
  [DisputeStatus.RESOLVED]: "bg-green-100 text-green-800",
  [DisputeStatus.DISMISSED]: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS: Record<DisputeStatus, string> = {
  [DisputeStatus.OPEN]: "Open",
  [DisputeStatus.UNDER_REVIEW]: "Under Review",
  [DisputeStatus.RESOLVED]: "Resolved",
  [DisputeStatus.DISMISSED]: "Dismissed",
};

export function DisputeManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState<DisputeStatus | "all">(
    "all",
  );
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  // Fetch disputes
  const { data, isLoading } = useQuery({
    queryKey: ["admin-disputes", activeStatus, page],
    queryFn: () => disputeApi.listDisputes(activeStatus, page, 20),
    enabled: user?.role === "admin",
  });

  // Handle dispute resolution
  const handleResolve = async (
    disputeId: string,
    resolutionNotes: string,
    decision: "completed" | "cancelled",
  ) => {
    try {
      await disputeApi.resolveDispute(disputeId, {
        resolutionNotes,
        decision,
      });

      toast.success("Dispute resolved successfully");

      // Invalidate queries to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });

      // Close the detail panel
      setSelectedDispute(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to resolve dispute";
      toast.error(message);
      throw error;
    }
  };

  // Calculate counts for status tabs
  const statusCounts = useMemo(() => {
    if (!data) return undefined;

    return {
      all: data.total,
      open: data.data.filter((d) => d.status === DisputeStatus.OPEN).length,
      under_review: data.data.filter(
        (d) => d.status === DisputeStatus.UNDER_REVIEW,
      ).length,
      resolved: data.data.filter((d) => d.status === DisputeStatus.RESOLVED)
        .length,
      dismissed: data.data.filter((d) => d.status === DisputeStatus.DISMISSED)
        .length,
    };
  }, [data]);

  // Redirect non-admin users
  if (user && user.role !== "admin") {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Dispute Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data
            ? `${data.total} total dispute${data.total !== 1 ? "s" : ""}`
            : "Loading disputes..."}
        </p>
      </div>

      {/* Status Filter Tabs */}
      <StatusFilterTabs
        activeStatus={activeStatus}
        onStatusChange={(status) => {
          setActiveStatus(status);
          setPage(1);
        }}
        counts={statusCounts}
      />

      {/* Disputes Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {activeStatus === "all"
              ? "No disputes found. 🎉"
              : `No ${activeStatus.replace("_", " ")} disputes.`}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Tracking #
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Shipper
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Carrier
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Reason
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Date Opened
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.data.map((dispute) => (
                    <tr
                      key={dispute.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedDispute(dispute)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {dispute.trackingNumber}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {dispute.shipper.firstName} {dispute.shipper.lastName}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {dispute.carrier
                          ? `${dispute.carrier.firstName} ${dispute.carrier.lastName}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-xs truncate">
                        {dispute.reason}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[dispute.status]
                          }`}
                        >
                          {STATUS_LABELS[dispute.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(dispute.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDispute(dispute);
                          }}
                        >
                          View
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

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {data.data.length} of {data.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selectedDispute && (
        <DisputeDetailPanel
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
}
