"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayout(props: {
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const { children, className } = props;
  return (
    <div className={cn("min-h-screen bg-background p-4 md:p-6", className)}>
      {children}
    </div>
  );
}

