"use client";

import { DisputeStatus } from "./types";

export interface StatusFilterTabsProps {
  activeStatus: DisputeStatus | "all";
  onStatusChange: (status: DisputeStatus | "all") => void;
  counts?: {
    all: number;
    open: number;
    under_review: number;
    resolved: number;
    dismissed: number;
  };
}

const STATUS_CONFIG: Array<{
  key: DisputeStatus | "all";
  label: string;
  color: string;
  activeColor: string;
}> = [
  {
    key: "all",
    label: "All",
    color: "text-muted-foreground",
    activeColor: "bg-primary text-primary-foreground",
  },
  {
    key: DisputeStatus.OPEN,
    label: "Open",
    color: "text-yellow-600",
    activeColor: "bg-yellow-600 text-white",
  },
  {
    key: DisputeStatus.UNDER_REVIEW,
    label: "Under Review",
    color: "text-blue-600",
    activeColor: "bg-blue-600 text-white",
  },
  {
    key: DisputeStatus.RESOLVED,
    label: "Resolved",
    color: "text-green-600",
    activeColor: "bg-green-600 text-white",
  },
  {
    key: DisputeStatus.DISMISSED,
    label: "Dismissed",
    color: "text-muted-foreground",
    activeColor: "bg-muted text-foreground",
  },
];

export function StatusFilterTabs({
  activeStatus,
  onStatusChange,
  counts,
}: StatusFilterTabsProps) {
  return (
    <div className="flex gap-2 border-b border-border">
      {STATUS_CONFIG.map(({ key, label, color, activeColor }) => {
        const isActive = activeStatus === key;
        const count = counts?.[key];

        return (
          <button
            key={key}
            onClick={() => onStatusChange(key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? `border-primary ${activeColor}`
                : `border-transparent hover:border-muted-foreground ${color}`
            }`}
          >
            {label}
            {count !== undefined && (
              <span className="ml-2 text-xs opacity-75">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
