"use client"

import { useState } from "react"
import NotificationsHeader from "@/components/notifications/notifications-header"
import NotificationsList from "@/components/notifications/notifications-list"
import NotificationFilters from "@/components/notifications/notification-filters"
import NotificationSettings from "@/components/notifications/notification-settings"
import NotificationTemplates from "@/components/notifications/notification-templates"
import AlertRules from "@/components/notifications/alert-rules"

export default function NotificationsPage() {
  const [selectedTab, setSelectedTab] = useState("inbox")
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    priority: "all",
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NotificationsHeader selectedTab={selectedTab} onTabChange={setSelectedTab} />

        <div className="space-y-8">
          {selectedTab === "inbox" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <NotificationFilters filters={filters} onFiltersChange={setFilters} />
                <NotificationsList filters={filters} />
              </div>
              <div>
                <NotificationSettings />
              </div>
            </div>
          )}

          {selectedTab === "templates" && <NotificationTemplates />}
          {selectedTab === "alerts" && <AlertRules />}
          {selectedTab === "settings" && <NotificationSettings />}
        </div>
      </div>
    </div>
  )
}
