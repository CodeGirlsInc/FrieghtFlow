"use client"

import { useState } from "react"
import IntegrationsHeader from "@/components/integrations/integrations-header"
import IntegrationsList from "@/components/integrations/integrations-list"
import ActiveIntegrations from "@/components/integrations/active-integrations"
import IntegrationDetails from "@/components/integrations/integration-details"
import APIDocumentation from "@/components/integrations/api-documentation"
import WebhookManagement from "@/components/integrations/webhook-management"
import IntegrationLogs from "@/components/integrations/integration-logs"

export default function IntegrationsPage() {
  const [selectedTab, setSelectedTab] = useState("browse")
  const [selectedIntegration, setSelectedIntegration] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IntegrationsHeader selectedTab={selectedTab} onTabChange={setSelectedTab} />

        <div className="space-y-8">
          {selectedTab === "browse" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <IntegrationsList onIntegrationSelect={setSelectedIntegration} />
              </div>
              <div>
                <ActiveIntegrations />
              </div>
            </div>
          )}

          {selectedTab === "active" && <ActiveIntegrations />}
          {selectedTab === "api" && <APIDocumentation />}
          {selectedTab === "webhooks" && <WebhookManagement />}
          {selectedTab === "logs" && <IntegrationLogs />}

          {selectedIntegration && (
            <IntegrationDetails integration={selectedIntegration} onClose={() => setSelectedIntegration(null)} />
          )}
        </div>
      </div>
    </div>
  )
}
