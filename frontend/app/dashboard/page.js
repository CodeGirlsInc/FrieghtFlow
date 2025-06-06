"use client"

import { useState } from "react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardStats from "@/components/dashboard/dashboard-stats"
import RecentActivity from "@/components/dashboard/recent-activity"
import QuickActions from "@/components/dashboard/quick-actions"
import DashboardCharts from "@/components/dashboard/dashboard-charts"
import UpcomingDeliveries from "@/components/dashboard/upcoming-deliveries"
import AlertsPanel from "@/components/dashboard/alerts-panel"
import WeatherWidget from "@/components/dashboard/weather-widget"
import PerformanceMetrics from "@/components/dashboard/performance-metrics"

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("7d")
  const [selectedMetrics, setSelectedMetrics] = useState(["orders", "revenue", "deliveries"])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader dateRange={dateRange} onDateRangeChange={setDateRange} />

        <div className="space-y-8">
          <DashboardStats dateRange={dateRange} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <DashboardCharts
                dateRange={dateRange}
                selectedMetrics={selectedMetrics}
                onMetricsChange={setSelectedMetrics}
              />
              <RecentActivity />
            </div>

            <div className="space-y-8">
              <QuickActions />
              <UpcomingDeliveries />
              <AlertsPanel />
              <WeatherWidget />
            </div>
          </div>

          <PerformanceMetrics dateRange={dateRange} />
        </div>
      </div>
    </div>
  )
}
