"use client"

import { useState } from "react"
import InventoryHeader from "@/components/inventory/inventory-header"
import InventoryStats from "@/components/inventory/inventory-stats"
import InventoryList from "@/components/inventory/inventory-list"
import InventoryFilters from "@/components/inventory/inventory-filters"
import WarehouseMap from "@/components/inventory/warehouse-map"
import StockAlerts from "@/components/inventory/stock-alerts"
import InventoryMovements from "@/components/inventory/inventory-movements"
import BulkActions from "@/components/inventory/bulk-actions"

export default function InventoryPage() {
  const [selectedItems, setSelectedItems] = useState([])
  const [filters, setFilters] = useState({
    warehouse: "all",
    category: "all",
    status: "all",
    search: "",
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InventoryHeader />

        <div className="space-y-8">
          <InventoryStats />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <InventoryFilters filters={filters} onFiltersChange={setFilters} />

              {selectedItems.length > 0 && (
                <BulkActions selectedItems={selectedItems} onClearSelection={() => setSelectedItems([])} />
              )}

              <InventoryList filters={filters} selectedItems={selectedItems} onSelectionChange={setSelectedItems} />
            </div>

            <div className="space-y-6">
              <StockAlerts />
              <WarehouseMap />
              <InventoryMovements />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
