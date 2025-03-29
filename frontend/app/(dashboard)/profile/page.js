"use client";

import { useState } from "react";
import ProfileHeader from "@/components/profile/profile-header";
import ProfileStats from "@/components/profile/profile-stats";
import ShippingHistory from "@/components/profile/shipping-history";
import AccountSettings from "@/components/profile/account-settings";
import DocumentsSection from "@/components/profile/documents-section";
import PaymentMethods from "@/components/profile/payment-methods";
import CompanyDetails from "@/components/profile/company-details";
import NotificationsPanel from "@/components/profile/notifications-panel";
import SecuritySettings from "@/components/profile/security-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function ProfilePage() {
  const [user, setUser] = useState({
    id: "user_12345",
    name: "Alex Thompson",
    email: "alex@freightflow.com",
    role: "Enterprise Shipper",
    avatar: "/placeholder.svg?height=100&width=100",
    company: "Global Logistics Inc.",
    memberSince: "January 2022",
    verificationStatus: "verified",
    preferredCurrency: "USD",
    timezone: "UTC-5 (Eastern Time)",
    language: "English",
    contactNumber: "+1 (555) 123-4567",
    address: "123 Shipping Lane, Cargo City, FL 33101",
  });

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <ProfileHeader user={user} setUser={setUser} />

      <div className="mt-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-5 md:grid-cols-9 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="notifications" className="hidden md:flex">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="hidden md:flex">
              Security
            </TabsTrigger>
            <TabsTrigger value="settings" className="hidden md:flex">
              Settings
            </TabsTrigger>
            <TabsTrigger value="more" className="md:hidden">
              More
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ProfileStats />
              </div>
              <div>
                <NotificationsPanel limit={3} />
              </div>
            </div>
            <ShippingHistory limit={5} />
          </TabsContent>

          <TabsContent value="shipments">
            <Card className="p-6">
              <ShippingHistory />
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="p-6">
              <DocumentsSection />
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="p-6">
              <PaymentMethods />
            </Card>
          </TabsContent>

          <TabsContent value="company">
            <Card className="p-6">
              <CompanyDetails user={user} setUser={setUser} />
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <NotificationsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-6">
              <SecuritySettings user={user} />
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <AccountSettings user={user} setUser={setUser} />
            </Card>
          </TabsContent>

          <TabsContent value="more" className="md:hidden">
            <Tabs defaultValue="notifications" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="notifications">
                <Card className="p-6">
                  <NotificationsPanel />
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="p-6">
                  <SecuritySettings user={user} />
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="p-6">
                  <AccountSettings user={user} setUser={setUser} />
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
