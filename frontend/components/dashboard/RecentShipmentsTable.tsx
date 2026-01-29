"use client";

import * as React from "react";
import { format } from "date-fns";
import { MoreHorizontal, MessageCircle, Navigation, Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/ui/buttons";
import { DataTable } from "@/components/shared/DataTable";
import type { RecentShipment, ShipmentStatus, Paginated } from "@/lib/dashboard/types";
import type { UserRole } from "@/lib/auth-context";
import { useRecentShipments } from "@/lib/dashboard/hooks";
import { useNotify } from "@/store/useNotificationStore";

function statusVariant(status: ShipmentStatus) {
  switch (status) {
    case "Delivered":
      return "success";
    case "Delayed":
      return "error";
    case "In Transit":
    case "Out for Delivery":
      return "warning";
    default:
      return "info";
  }
}

export default function RecentShipmentsTable(props: { role: UserRole }) {
  const notify = useNotify();
  const [page, setPage] = React.useState(1);
  const pageSize = 8;
  const q = useRecentShipments({ role: props.role, page, pageSize });

  const columns = React.useMemo<ColumnDef<RecentShipment>[]>(
    () => [
      { accessorKey: "id", header: "ID", enableSorting: true },
      {
        id: "route",
        header: "Origin → Destination",
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = `${rowA.original.origin} → ${rowA.original.destination}`;
          const b = `${rowB.original.origin} → ${rowB.original.destination}`;
          return a.localeCompare(b);
        },
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.origin} → {row.original.destination}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)} size="sm">
            {row.original.status}
          </Badge>
        ),
      },
      { accessorKey: "carrier", header: "Carrier", enableSorting: true },
      {
        accessorKey: "eta",
        header: "ETA",
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          return new Date(rowA.original.eta).getTime() - new Date(rowB.original.eta).getTime();
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {format(new Date(row.original.eta), "PP p")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => notify.info("View", `Opening ${row.original.id}`)}
              aria-label="View"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => notify.info("Track", `Tracking ${row.original.id}`)}
              aria-label="Track"
            >
              <Navigation className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => notify.info("Message", `Messaging carrier for ${row.original.id}`)}
              aria-label="Message"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => notify.info("More actions", row.original.id)}
              aria-label="More"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [notify]
  );

  const data = q.data as Paginated<RecentShipment> | undefined;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <Card
      header={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold">Recent Shipments</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || q.isLoading}
            >
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || q.isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      }
      className="flex flex-col h-full"
    >
      {q.isLoading ? (
        <div className="h-56 animate-pulse rounded-lg bg-secondary" />
      ) : q.isError ? (
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-destructive">Failed to load shipments.</div>
          <Button variant="outline" size="sm" onClick={() => q.refetch()}>
            Retry
          </Button>
        </div>
      ) : data ? (
        <div className="flex-1 overflow-y-auto">
          <DataTable data={[...data.items]} columns={columns} pageSize={pageSize} pagination={false} />
        </div>
      ) : null}
    </Card>
  );
}

