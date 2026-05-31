"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../stores/auth.store";
import type { UserRole } from "../../components/Sidebar/ResponsiveSidebar";

export const useRoleGuard = (allowedRoles: UserRole[]) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user && !allowedRoles.includes(user.role as UserRole)) {
        router.replace("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  const isRoleAllowed = user && allowedRoles.includes(user.role as UserRole);

  return {
    allowed: isAuthenticated && isRoleAllowed,
    loading: isLoading,
  };
};
