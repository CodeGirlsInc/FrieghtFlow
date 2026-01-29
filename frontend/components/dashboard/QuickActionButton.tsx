"use client";

import * as React from "react";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";

export default function QuickActionButton(props: {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
}) {
  const { label, icon, onClick, variant = "default", className } = props;
  return (
    <Button
      variant={variant}
      size="sm"
      className={cn("gap-2", className)}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </Button>
  );
}

