"use client";

import { useState, useEffect } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Bell,
  CreditCard,
  Database,
  Eye,
  Globe,
  Key,
  Layers,
  LogOut,
  Moon,
  Paintbrush,
  Settings,
  Shield,
  User,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SettingsLayout({ children, activeTab, onTabChange }) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);

  // Close mobile sidebar when tab changes
  useEffect(() => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  }, [activeTab, isMobile, openMobile]);

  const settingsSections = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Paintbrush },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "integrations", label: "Integrations", icon: Workflow },
    { id: "accessibility", label: "Accessibility", icon: Layers },
    { id: "data", label: "Data & Export", icon: Database },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between p-4 border-b md:hidden">
        <h1 className="text-xl font-semibold">Settings</h1>
        <SidebarTrigger onClick={() => setOpenMobile(!openMobile)} />
      </div>

      <div className="flex flex-1">
        <SidebarProvider defaultOpen={true}>
          <Sidebar className="hidden md:flex border-r" collapsible="none">
            <SidebarContent className="py-6">
              <div className="px-4 mb-6">
                <h1 className="text-xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your account preferences
                </p>
              </div>

              <SidebarMenu>
                {settingsSections.map((section) => (
                  <SidebarMenuItem key={section.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(section.id)}
                      isActive={activeTab === section.id}
                    >
                      <section.icon className="h-5 w-5" />
                      <span>{section.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

              <div className="mt-auto px-4 pt-6">
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </SidebarContent>
          </Sidebar>

          {/* Mobile sidebar */}
          {isMobile && (
            <div
              className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 ${
                openMobile ? "block" : "hidden"
              }`}
              onClick={() => setOpenMobile(false)}
            >
              <div
                className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-background border-r shadow-lg p-6 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6">
                  <h1 className="text-xl font-semibold">Settings</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your account preferences
                  </p>
                </div>

                <div className="space-y-1">
                  {settingsSections.map((section) => (
                    <Button
                      key={section.id}
                      variant={activeTab === section.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        onTabChange(section.id);
                        setOpenMobile(false);
                      }}
                    >
                      <section.icon className="mr-2 h-5 w-5" />
                      {section.label}
                    </Button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 p-6">{children}</div>
        </SidebarProvider>
      </div>
    </div>
  );
}
