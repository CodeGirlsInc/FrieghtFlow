"use client";

import * as React from "react";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/buttons";
import ActivityItem from "@/components/dashboard/ActivityItem";
import type { ActivityItem as ActivityItemType } from "@/lib/dashboard/types";
import { flattenActivityPages, useRecentActivity } from "@/lib/dashboard/hooks";
import type { UserRole } from "@/lib/auth-context";
import { useNotify } from "@/store/useNotificationStore";

export default function ActivityFeed(props: { role: UserRole }) {
  const notify = useNotify();
  const q = useRecentActivity(props.role, 10);
  const items = flattenActivityPages(q.data?.pages);

  const onViewDetails = React.useCallback(
    (item: ActivityItemType) => {
      notify.info("View Details", `Open ${item.entity?.type ?? "item"} ${item.entity?.id ?? ""}`.trim());
    },
    [notify]
  );

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Recent Activity</div>
          {q.isFetching ? <span className="text-xs text-muted-foreground">Updating…</span> : null}
        </div>
      }
      className="flex flex-col h-full"
    >
      {q.isLoading ? (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : q.isError ? (
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-destructive">Failed to load activity.</div>
          <Button variant="outline" size="sm" onClick={() => q.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {items.map((it) => (
              <ActivityItem key={it.id} item={it} onViewDetails={onViewDetails} />
            ))}
          </div>
          <div className="pt-2 border-t mt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => q.fetchNextPage()}
              disabled={!q.hasNextPage || q.isFetchingNextPage}
            >
              {q.hasNextPage ? (q.isFetchingNextPage ? "Loading…" : "Load more") : "No more activity"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

