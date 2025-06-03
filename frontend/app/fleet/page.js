"use client"

import { useState } from "react"
import FleetHeader from "@/components/fleet/fleet-header"
import FleetStats from "@/components/fleet/fleet-stats"
import VehicleList from "@/components/fleet/vehicle-list"
import FleetMap from "@/components/fleet/fleet-map"
import DriverManagement from "@/components/fleet/driver-management"
import MaintenanceSchedule from "@/components/fleet/maintenance-schedule"
import FuelTracking from "@/components/fleet/fuel-tracking"
import RouteOptimization from "@/components/fleet/route-optimization"

export default function FleetPage() {
  const [selectedView, setSelectedView] = useState("overview")
  const [selectedVehicles, setSelectedVehicles] = useState([])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FleetHeader selectedView={selectedView} onViewChange={setSelectedView} />

        <div className="space-y-8">
          <FleetStats />

          {selectedView === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <VehicleList selectedVehicles={selectedVehicles} onSelectionChange={setSelectedVehicles} />
              </div>
              <div className="space-y-6">
                <FleetMap />
                <MaintenanceSchedule />
              </div>
            </div>
          )}

          {selectedView === "drivers" && <DriverManagement />}
          {selectedView === "maintenance" && <MaintenanceSchedule />}
          {selectedView === "fuel" && <FuelTracking />}
          {selectedView === "routes" && <RouteOptimization />}
        </div>
      </div>
    </div>
  )
}
