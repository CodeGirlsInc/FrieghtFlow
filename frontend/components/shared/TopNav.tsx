"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";

export function TopNav(props: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  const { left, right, className } = props;
  return (
    <div className={cn("sticky top-0 z-40 border-b bg-background/80 backdrop-blur", className)}>
      <div className="flex h-14 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => {
              // placeholder for future mobile sidebar
            }}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
          {left}
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </div>
  );
}

