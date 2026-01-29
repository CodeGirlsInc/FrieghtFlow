"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";

export default function NotificationBell(props: {
  unreadCount: number;
  onClick?: () => void;
  className?: string;
}) {
  const { unreadCount, onClick, className } = props;
  return (
    <div className={cn("relative", className)}>
      <Button variant="outline" size="icon" onClick={onClick} aria-label="Notifications">
        <Bell className="h-4 w-4" />
      </Button>
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </div>
  );
}

