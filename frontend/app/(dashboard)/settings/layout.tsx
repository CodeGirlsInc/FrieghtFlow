'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../../lib/utils';

const SETTINGS_NAV = [
  { href: '/settings/profile', label: 'Profile' },
  { href: '/settings/notifications', label: 'Notifications' },
  { href: '/settings/security', label: 'Security' },
  { href: '/settings/webhooks', label: 'Webhooks' },
  { href: '/settings/api-keys', label: 'API Keys' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full">
      <aside className="w-52 shrink-0 border-r bg-card p-4 space-y-1">
        <p className="text-xs font-semibold uppercase text-muted-foreground px-3 mb-2">Settings</p>
        {SETTINGS_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
