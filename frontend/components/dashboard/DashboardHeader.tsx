"use client";

import * as React from "react";
import { format } from "date-fns";
import { Plus, PackagePlus, MessageSquareText } from "lucide-react";
import type { UserRole } from "@/lib/auth-context";
import { useAuth } from "@/lib/auth-context";
import NotificationBell from "@/components/dashboard/NotificationBell";
import QuickActionButton from "@/components/dashboard/QuickActionButton";
import { UserDropdown } from "@/components/shared/UserDropdown";
import { useNotify } from "@/store/useNotificationStore";
import { Button } from "@/components/ui/buttons";

export default function DashboardHeader(props: {
  role: UserRole;
  onRoleChange?: (role: UserRole) => void;
  unreadCount: number;
}) {
  const { user } = useAuth();
  const notify = useNotify();
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="text-xl sm:text-2xl font-semibold tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ""}.
          </div>
          <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {format(now, "PPPP")} • {format(now, "p")}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
          <QuickActionButton
            label="New Shipment"
            icon={<PackagePlus className="h-4 w-4" />}
            onClick={() => notify.info("New Shipment", "This will open the shipment creation flow.")}
          />
          <QuickActionButton
            label="Quick Create"
            icon={<Plus className="h-4 w-4" />}
            variant="outline"
            onClick={() => notify.info("Quick Create", "Add a quick create modal here.")}
          />
          <QuickActionButton
            label="Message"
            icon={<MessageSquareText className="h-4 w-4" />}
            variant="outline"
            onClick={() => notify.info("Messages", "Open messaging center.")}
          />

          <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

          <NotificationBell
            unreadCount={props.unreadCount}
            onClick={() => notify.info("Notifications", "Open notifications panel.")}
          />
          <UserDropdown />
        </div>
      </div>

      {props.onRoleChange ? (
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Role:</div>
          <div className="flex items-center gap-2">
            {(["SHIPPER", "CARRIER", "DISPATCHER"] as const).map((r) => (
              <Button
                key={r}
                variant={props.role === r ? "default" : "outline"}
                size="sm"
                onClick={() => props.onRoleChange?.(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

