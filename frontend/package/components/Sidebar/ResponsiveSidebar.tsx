"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  ShieldAlert,
  Menu,
  X
} from "lucide-react";

export type UserRole = "shipper" | "carrier" | "admin";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface ResponsiveSidebarProps {
  role: UserRole;
}

const getNavItems = (role: UserRole): NavItem[] => {
  switch (role) {
    case "shipper":
      return [
        { label: "Shipments", href: "/shipments", icon: <Package className="w-5 h-5" /> },
        { label: "Marketplace", href: "/marketplace", icon: <ShoppingCart className="w-5 h-5" /> },
      ];
    case "carrier":
      return [
        { label: "Earnings", href: "/earnings", icon: <DollarSign className="w-5 h-5" /> },
        { label: "Marketplace", href: "/marketplace", icon: <ShoppingCart className="w-5 h-5" /> },
      ];
    case "admin":
      return [
        { label: "Admin Panel", href: "/admin", icon: <ShieldAlert className="w-5 h-5" /> },
      ];
    default:
      return [];
  }
};

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);

  const navItems = getNavItems(role);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Prevent background scrolling when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Outside click to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      setIsOpen(false);
    }
  };

  const NavContent = () => (
    <nav className="flex flex-col gap-2 p-4 mt-16 md:mt-0">
      {navItems.map((item) => {
        const isActive = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`
              group relative flex items-center gap-4 rounded-lg px-3 py-3 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
            `}
            tabIndex={0}
          >
            {item.icon}
            <span className="md:hidden lg:block">{item.label}</span>
            
            {/* Tooltip for tablet view */}
            <div className="absolute left-14 hidden md:block lg:hidden rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </div>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border shadow-sm text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
        >
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col">
            <div className="p-4 flex justify-end absolute top-0 right-0 w-full">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavContent />
            </div>
          </div>
        </div>
      )}

      {/* Tablet & Desktop Sidebar */}
      <aside className="hidden md:flex flex-col border-r bg-white min-h-screen transition-all duration-300 md:w-20 lg:w-64 sticky top-0">
        <div className="p-4 flex items-center justify-center lg:justify-start h-16 border-b">
          <span className="font-bold text-xl text-blue-600 hidden lg:block">FreightFlow</span>
          <span className="font-bold text-xl text-blue-600 lg:hidden">FF</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavContent />
        </div>
      </aside>
    </>
  );
};
