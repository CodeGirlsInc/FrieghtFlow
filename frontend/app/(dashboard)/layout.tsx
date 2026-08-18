'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth.store';
import { useShipmentSocket } from '../../hooks/useShipmentSocket';
import { NotificationBell } from '../../components/notifications/notification-bell';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { MobileNav } from '../../components/layout/mobile-nav';

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
  { href: '/admin/disputes', label: 'Disputes' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Connect to WebSocket and receive real-time shipment notifications
  useShipmentSocket();

  const navItems =
    user?.role === 'carrier'
      ? CARRIER_NAV
      : user?.role === 'admin'
        ? ADMIN_NAV
        : SHIPPER_NAV;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile nav drawer */}
      <MobileNav
        navItems={navItems}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Mobile top bar — visible only on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">FF</span>
          </div>
          <span className="font-bold text-foreground">FreightFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileNavOpen}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 border-r bg-card flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">FF</span>
          </div>
          <span className="font-bold text-foreground flex-1">FreightFlow</span>
          <ThemeToggle />
          <NotificationBell />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === '/dashboard' || item.href === '/admin'
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

        {/* User footer */}
        <div className="border-t p-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <div className="mt-3 space-y-1">
            <Link
              href="/profile"
              className={cn(
                'block w-full text-left text-xs px-1 py-1 rounded transition-colors',
                pathname === '/profile'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Profile
            </Link>
            <Link
              href="/settings"
              className={cn(
                'block w-full text-left text-xs px-1 py-1 rounded transition-colors',
                pathname === '/settings'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Settings
            </Link>
            <button
              onClick={logout}
              className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-1"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}
