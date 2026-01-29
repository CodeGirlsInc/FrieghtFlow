"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../../lib/auth-api";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotify } from "../../store/useNotificationStore";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const notify = useNotify();

  async function handleLogout() {
    try {
      await authApi.logout();
      logout();
      notify.success("Signed out");
      router.push("/auth/login");
    } catch (err) {
      // Even if server logout fails, clear local state
      logout();
      notify.info("Signed out locally");
      router.push("/auth/login");
    }
  }

  return (
    <button onClick={handleLogout} className={className ?? "px-3 py-1 bg-gray-200 rounded"}>
      Sign out
    </button>
  );
}
