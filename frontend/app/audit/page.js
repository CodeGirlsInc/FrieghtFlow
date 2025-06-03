"use client"

import { useState } from "react"
import AuditHeader from "@/components/audit/audit-header"
import AuditLogs from "@/components/audit/audit-logs"
import AuditFilters from "@/components/audit/audit-filters"
import AuditStats from "@/components/audit/audit-stats"
import SecurityEvents from "@/components/audit/security-events"
import ComplianceReports from "@/components/audit/compliance-reports"
import UserActivity from "@/components/audit/user-activity"

export default function AuditPage() {
  const [selectedTab, setSelectedTab] = useState("logs")
  const [filters, setFilters] = useState({
    dateRange: "7d",
    eventType: "all",
    user: "all",
    severity: "all",
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AuditHeader selectedTab={selectedTab} onTabChange={setSelectedTab} />

        <div className="space-y-8">
          <AuditStats filters={filters} />

          {selectedTab === "logs" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <AuditFilters filters={filters} onFiltersChange={setFilters} />
                <AuditLogs filters={filters} />
              </div>
              <div>
                <SecurityEvents />
              </div>
            </div>
          )}

          {selectedTab === "security" && <SecurityEvents />}
          {selectedTab === "compliance" && <ComplianceReports />}
          {selectedTab === "activity" && <UserActivity />}
        </div>
      </div>
    </div>
  )
}
