"use client"

import { useState } from "react"
import VendorsHeader from "@/components/vendors/vendors-header"
import VendorsList from "@/components/vendors/vendors-list"
import VendorDetails from "@/components/vendors/vendor-details"
import VendorPerformance from "@/components/vendors/vendor-performance"
import ContractManagement from "@/components/vendors/contract-management"
import VendorOnboarding from "@/components/vendors/vendor-onboarding"
import PaymentTracking from "@/components/vendors/payment-tracking"

export default function VendorsPage() {
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VendorsHeader />

        <div className="space-y-8">
          {!selectedVendor ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <VendorsList onVendorSelect={setSelectedVendor} />
              </div>
              <div className="space-y-6">
                <VendorOnboarding />
                <VendorPerformance />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <VendorDetails
                  vendor={selectedVendor}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onBack={() => setSelectedVendor(null)}
                />
              </div>
              <div className="space-y-6">
                <ContractManagement vendorId={selectedVendor.id} />
                <PaymentTracking vendorId={selectedVendor.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
