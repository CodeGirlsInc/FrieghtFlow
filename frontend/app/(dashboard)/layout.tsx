"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r flex flex-col justify-between">
        {/* Main nav block */}
        <nav className="flex-1 p-4">
          {/* Existing navItems logic here */}
          {/* Example placeholder */}
          <Link
            href="/dashboard"
            className={cn(
              "block px-3 py-2 rounded-md text-sm font-medium",
              pathname === "/dashboard" && "bg-gray-200 text-gray-900"
            )}
          >
            Dashboard
          </Link>
          {/* Other navItems... */}
        </nav>

        {/* User footer section */}
        <div className="p-4 border-t">
          <Link
            href="/profile"
            className={cn(
              "block px-3 py-2 rounded-md text-sm font-medium",
              pathname === "/profile" && "bg-gray-200 text-gray-900"
            )}
          >
            Profile
          </Link>
          <Link
            href="/settings"
            className={cn(
              "block px-3 py-2 rounded-md text-sm font-medium",
              pathname === "/settings" && "bg-gray-200 text-gray-900"
            )}
          >
            Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
