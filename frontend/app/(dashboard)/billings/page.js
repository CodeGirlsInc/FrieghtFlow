"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import BillingHeader from "@/components/billing/billing-header";
import BillingPlanDetails from "@/components/billing/billing-plan-details";
import InvoiceHistory from "@/components/billing/invoice-history";
import PaymentMethods from "@/components/billing/payment-methods";
import BillingAddress from "@/components/billing/billing-address";
import SubscriptionManagement from "@/components/billing/subscription-management";
import UsageMetrics from "@/components/billing/usage-metrics";
import TaxInformation from "@/components/billing/tax-information";

export default function BillingPage() {
  const [billingData, setBillingData] = useState({
    currentPlan: "enterprise",
    status: "active",
    billingCycle: "monthly",
    nextBillingDate: "April 15, 2023",
    autoRenew: true,
    currentPeriodStart: "March 15, 2023",
    currentPeriodEnd: "April 14, 2023",
    amount: "$499.00",
    currency: "USD",
    paymentMethod: {
      id: "pm-1",
      type: "visa",
      last4: "4242",
      expMonth: 9,
      expYear: 2025,
      name: "Alex Thompson",
      isDefault: true,
    },
    billingAddress: {
      name: "Global Logistics Inc.",
      address: "123 Shipping Lane",
      city: "Cargo City",
      state: "FL",
      zip: "33101",
      country: "United States",
      email: "billing@globallogistics.com",
      phone: "+1 (555) 123-4567",
    },
    taxId: "US-123456789",
    usage: {
      shipments: {
        used: 87,
        limit: 500,
        percentage: 17.4,
      },
      storage: {
        used: 2.4,
        limit: 10,
        percentage: 24,
      },
      users: {
        used: 15,
        limit: 25,
        percentage: 60,
      },
      api: {
        used: 12500,
        limit: 50000,
        percentage: 25,
      },
    },
  });

  const updateBillingData = (newData) => {
    setBillingData({
      ...billingData,
      ...newData,
    });
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <BillingHeader
        billingData={billingData}
        updateBillingData={updateBillingData}
      />

      <div className="mt-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="tax">Tax Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <BillingPlanDetails billingData={billingData} />
              </div>
              <div>
                <UsageMetrics billingData={billingData} compact={true} />
              </div>
            </div>
            <InvoiceHistory limit={5} />
          </TabsContent>

          <TabsContent value="invoices">
            <Card className="p-6">
              <InvoiceHistory />
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card className="p-6">
              <div className="space-y-6">
                <PaymentMethods
                  billingData={billingData}
                  updateBillingData={updateBillingData}
                />
                <BillingAddress
                  billingData={billingData}
                  updateBillingData={updateBillingData}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <Card className="p-6">
              <UsageMetrics billingData={billingData} />
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <Card className="p-6">
              <SubscriptionManagement
                billingData={billingData}
                updateBillingData={updateBillingData}
              />
            </Card>
          </TabsContent>

          <TabsContent value="tax">
            <Card className="p-6">
              <TaxInformation
                billingData={billingData}
                updateBillingData={updateBillingData}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
