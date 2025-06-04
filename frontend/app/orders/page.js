"use client"

import { useState } from "react"
import OrdersHeader from "@/components/orders/orders-header"
import OrdersList from "@/components/orders/orders-list"
import OrderDetails from "@/components/orders/order-details"
import OrderFilters from "@/components/orders/order-filters"
import OrderStats from "@/components/orders/order-stats"
import CreateOrderModal from "@/components/orders/create-order-modal"
import BulkActionsBar from "@/components/orders/bulk-actions-bar"
import { useToast } from "@/hooks/use-toast"

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [filterOptions, setFilterOptions] = useState({
    status: "all",
    dateRange: "all",
    priority: "all",
    type: "all",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState({ field: "createdAt", direction: "desc" })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState("list") // 'list' or 'grid'
  const { toast } = useToast()

  const handleOrderSelect = (order) => {
    setSelectedOrder(order)
  }

  const handleBulkSelect = (orders) => {
    setSelectedOrders(orders)
  }

  const handleFilterChange = (filters) => {
    setFilterOptions(filters)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleSort = (field) => {
    setSortOption((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleCreateOrder = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleBulkAction = (action) => {
    // Handle bulk actions like export, print, delete, etc.
    toast({
      title: "Bulk action initiated",
      description: `${action} applied to ${selectedOrders.length} orders`,
    })
    setSelectedOrders([])
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <OrdersHeader
        onCreateOrder={handleCreateOrder}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onViewModeChange={handleViewModeChange}
        viewMode={viewMode}
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <OrderFilters filters={filterOptions} onFilterChange={handleFilterChange} />
          <div className="mt-6">
            <OrderStats />
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedOrders.length > 0 && (
            <BulkActionsBar selectedCount={selectedOrders.length} onAction={handleBulkAction} />
          )}

          <OrdersList
            searchQuery={searchQuery}
            filters={filterOptions}
            sortOption={sortOption}
            onSort={handleSort}
            onSelectOrder={handleOrderSelect}
            onBulkSelect={handleBulkSelect}
            selectedOrders={selectedOrders}
            viewMode={viewMode}
          />

          {selectedOrder && <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </div>
      </div>

      {showCreateModal && (
        <CreateOrderModal
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal()
            toast({
              title: "Order created",
              description: "Your new order has been created successfully",
            })
          }}
        />
      )}
    </div>
  )
}
