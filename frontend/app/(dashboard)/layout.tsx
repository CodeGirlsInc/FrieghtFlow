"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { useShipmentSocket } from "../../hooks/useShipmentSocket";
import { NotificationBell } from "../../components/notifications/notification-bell";

interface DashboardLayoutProps {
  children: ReactNode;
}

const SHIPPER_NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/shipments', label: 'My Shipments' },
  { href: '/shipments/new', label: 'Create Shipment' },
];

const CARRIER_NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/shipments', label: 'My Jobs' },
  { href: '/marketplace', label: 'Marketplace' },
];

const ADMIN_NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/shipments', label: 'All Shipments' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/admin', label: 'Admin Panel' },
  { href: '/admin/users', label: 'Manage Users' },
  { href: '/admin/shipments', label: 'Shipment Oversight' },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  // Initialize the WebSocket connection for real-time shipment updates
  useShipmentSocket();

  // Determine nav items based on user role
  const getNavItems = () => {
    if (!user) return SHIPPER_NAV;
    if (user.role === 'admin') return ADMIN_NAV;
    if (user.role === 'carrier') return CARRIER_NAV;
    return SHIPPER_NAV;
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center gap-2 px-4 border-b">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-xs">FF</span>
          </div>
          <span className="font-bold text-foreground flex-1">FreightFlow</span>
          <NotificationBell />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active =
              ['/dashboard', '/admin'].includes(item.href)
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            );
          })}
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
