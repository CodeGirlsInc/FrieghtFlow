"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useRoleGuard } from "./useRoleGuard";
import type { UserRole } from "../../components/Sidebar/ResponsiveSidebar";

export const withRoleGuard = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: UserRole[]
) => {
  return function WithRoleGuard(props: P) {
    const { allowed, loading } = useRoleGuard(allowedRoles);

    if (loading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (!allowed) {
      // Return null or a placeholder while the router redirect happens in the hook
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};
