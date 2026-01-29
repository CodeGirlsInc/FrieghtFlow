"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Truck, ClipboardList, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shipments", label: "Shipments", icon: ClipboardList },
  { href: "/carriers", label: "Carriers", icon: Truck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar(props: { className?: string }) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "hidden md:flex md:w-64 md:flex-col md:border-r md:bg-background",
        props.className
      )}
    >
      <div className="flex h-14 items-center px-4 font-semibold tracking-tight">
        FreightFlow
      </div>
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

