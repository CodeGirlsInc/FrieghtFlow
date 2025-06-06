"use client"

import { useState } from "react"
import AnalyticsHeader from "@/components/analytics/analytics-header"
import RevenueAnalytics from "@/components/analytics/revenue-analytics"
import ShipmentAnalytics from "@/components/analytics/shipment-analytics"
import PerformanceAnalytics from "@/components/analytics/performance-analytics"
import CustomerAnalytics from "@/components/analytics/customer-analytics"
import GeographicAnalytics from "@/components/analytics/geographic-analytics"
import PredictiveAnalytics from "@/components/analytics/predictive-analytics"
import CustomReports from "@/components/analytics/custom-reports"
import ExportOptions from "@/components/analytics/export-options"

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedMetrics, setSelectedMetrics] = useState(["revenue", "shipments", "performance"])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsHeader
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedMetrics={selectedMetrics}
          onMetricsChange={setSelectedMetrics}
        />

        <div className="space-y-8">
          {selectedMetrics.includes("revenue") && <RevenueAnalytics period={selectedPeriod} />}

          {selectedMetrics.includes("shipments") && <ShipmentAnalytics period={selectedPeriod} />}

          {selectedMetrics.includes("performance") && <PerformanceAnalytics period={selectedPeriod} />}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CustomerAnalytics period={selectedPeriod} />
            <GeographicAnalytics period={selectedPeriod} />
          </div>

          <PredictiveAnalytics period={selectedPeriod} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CustomReports />
            <ExportOptions selectedMetrics={selectedMetrics} />
          </div>
        </div>
      </div>
    </div>
  )
}
