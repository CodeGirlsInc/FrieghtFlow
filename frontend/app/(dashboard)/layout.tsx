'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth.store';

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
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems =
    user?.role === 'carrier'
      ? CARRIER_NAV
      : user?.role === 'admin'
        ? ADMIN_NAV
        : SHIPPER_NAV;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">FF</span>
          </div>
          <span className="font-bold text-foreground">FreightFlow</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
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
          <button
            onClick={logout}
            className="mt-3 w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
