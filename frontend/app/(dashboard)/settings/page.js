"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SettingsLayout from "@/components/settings/settings-layout";
import AccountSettings from "@/components/settings/account-settings";
import NotificationPreferences from "@/components/settings/notification-preferences";
import AppearanceSettings from "@/components/settings/appearance-settings";
import PrivacySettings from "@/components/settings/privacy-settings";
import SecuritySettings from "@/components/settings/security-settings";
// import BillingSettings from "@/components/settings/billing-settings"
// import IntegrationSettings from "@/components/settings/integration-settings"
// import AccessibilitySettings from "@/components/settings/accessibility-settings"
// import DataExportSettings from "@/components/settings/data-export-settings"
import { useSearchParams } from "next/navigation";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "account";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Mock user data
  const userData = {
    id: "user_12345",
    name: "Alex Thompson",
    email: "alex@freightflow.com",
    phone: "+1 (555) 123-4567",
    company: "Global Logistics Inc.",
    role: "Enterprise Shipper",
    avatar: "/placeholder.svg?height=100&width=100",
    timezone: "America/New_York",
    language: "en-US",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    theme: "system",
    notifications: {
      email: {
        shipmentUpdates: true,
        marketingEmails: false,
        securityAlerts: true,
        weeklyReports: true,
        billingNotices: true,
      },
      push: {
        shipmentUpdates: true,
        securityAlerts: true,
        billingNotices: true,
      },
      inApp: {
        shipmentUpdates: true,
        marketingMessages: true,
        securityAlerts: true,
        systemUpdates: true,
      },
    },
    privacy: {
      profileVisibility: "contacts",
      dataSharing: true,
      activityTracking: true,
    },
    accessibility: {
      fontSize: "medium",
      contrastMode: "normal",
      reducedMotion: false,
      screenReader: false,
    },
    billing: {
      plan: "Enterprise",
      billingCycle: "monthly",
      paymentMethod: "visa",
      cardLastFour: "4242",
    },
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    // Update URL without refreshing the page
    const url = new URL(window.location);
    url.searchParams.set("tab", value);
    window.history.pushState({}, "", url);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <SettingsLayout activeTab={activeTab} onTabChange={handleTabChange}>
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="account" className="mt-0">
            <AccountSettings userData={userData} />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationPreferences userData={userData} />
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <AppearanceSettings userData={userData} />
          </TabsContent>

          <TabsContent value="privacy" className="mt-0">
            <PrivacySettings userData={userData} />
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <SecuritySettings userData={userData} />
          </TabsContent>

          <TabsContent value="billing" className="mt-0">
            <BillingSettings userData={userData} />
          </TabsContent>

          <TabsContent value="integrations" className="mt-0">
            <IntegrationSettings userData={userData} />
          </TabsContent>

          <TabsContent value="accessibility" className="mt-0">
            <AccessibilitySettings userData={userData} />
          </TabsContent>

          <TabsContent value="data" className="mt-0">
            <DataExportSettings userData={userData} />
          </TabsContent>
        </Tabs>
      </SettingsLayout>
    </div>
  );
}
