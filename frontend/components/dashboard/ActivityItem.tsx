"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/buttons";
import type { ActivityItem as ActivityItemType } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

function initials(name?: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
}

export default function ActivityItem(props: {
  item: ActivityItemType;
  onViewDetails?: (item: ActivityItemType) => void;
}) {
  const { item, onViewDetails } = props;
  const timeAgo = formatDistanceToNowStrict(new Date(item.createdAt), { addSuffix: true });
  const avatar = item.actor?.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={item.actor.name} src={item.actor.avatarUrl} className="h-9 w-9 rounded-full object-cover" />
  ) : (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
      {initials(item.actor?.name)}
    </div>
  );

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 sm:gap-4 rounded-lg border p-3 transition-colors hover:bg-accent/50",
        item.isUnread ? "border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-950/30 shadow-sm" : "bg-background border-border"
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {avatar}
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{item.title}</div>
          {item.description ? <div className="mt-1 truncate text-sm text-muted-foreground">{item.description}</div> : null}
          <div className="mt-2 text-xs text-muted-foreground">{timeAgo}</div>
        </div>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 text-xs sm:text-sm" onClick={() => onViewDetails?.(item)}>
        <span className="hidden sm:inline">View Details</span>
        <span className="sm:hidden">View</span>
      </Button>
    </div>
  );
}

