"use client";

import * as React from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";

export function UserDropdown(props: { className?: string }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join("") ?? "U";

  return (
    <div className={cn("relative", props.className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
          {initials}
        </span>
        <span className="hidden sm:inline">{user?.name ?? user?.email ?? "Account"}</span>
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-lg border bg-background p-2 shadow-lg"
        >
          <div className="px-2 py-2">
            <div className="text-sm font-medium">{user?.name ?? "User"}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-secondary"
            onClick={() => {
              setOpen(false);
              // placeholder for future profile page
            }}
          >
            <User className="h-4 w-4" />
            Profile
          </button>
          <button
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-secondary"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

