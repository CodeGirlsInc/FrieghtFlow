"use client"

import { useState } from "react"
import ComplianceHeader from "@/components/compliance/compliance-header"
import ComplianceOverview from "@/components/compliance/compliance-overview"
import RegulationsTracker from "@/components/compliance/regulations-tracker"
import DocumentManagement from "@/components/compliance/document-management"
import AuditTrail from "@/components/compliance/audit-trail"
import ComplianceReports from "@/components/compliance/compliance-reports"
import CertificationStatus from "@/components/compliance/certification-status"
import RiskAssessment from "@/components/compliance/risk-assessment"

export default function CompliancePage() {
  const [selectedTab, setSelectedTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ComplianceHeader selectedTab={selectedTab} onTabChange={setSelectedTab} />

        <div className="space-y-8">
          {selectedTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <ComplianceOverview />
              </div>
              <div className="space-y-6">
                <CertificationStatus />
                <RiskAssessment />
              </div>
            </div>
          )}

          {selectedTab === "regulations" && <RegulationsTracker />}
          {selectedTab === "documents" && <DocumentManagement />}
          {selectedTab === "audit" && <AuditTrail />}
          {selectedTab === "reports" && <ComplianceReports />}
        </div>
      </div>
    </div>
  )
}
