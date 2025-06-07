const { Server } = require("@stellar/stellar-sdk")
const WebSocket = require("ws")
require("dotenv").config()

class FreightFlowMonitor {
  constructor() {
    this.server = new Server(process.env.STELLAR_RPC_URL)
    this.contracts = {
      freightflow: process.env.FREIGHTFLOW_CONTRACT_ID,
      payment: process.env.PAYMENT_CONTRACT_ID,
      insurance: process.env.INSURANCE_CONTRACT_ID,
      documents: process.env.DOCUMENT_CONTRACT_ID,
    }
    this.isMonitoring = false
  }

  async startMonitoring() {
    if (!process.env.ENABLE_MONITORING || process.env.ENABLE_MONITORING !== "true") {
      console.log("⚠️  Monitoring is disabled")
      return
    }

    console.log("🔍 Starting FreightFlow blockchain monitoring...\n")
    this.isMonitoring = true

    // Monitor each contract
    Object.entries(this.contracts).forEach(([name, contractId]) => {
      if (contractId) {
        this.monitorContract(name, contractId)
      }
    })

    // Keep the process running
    process.on("SIGINT", () => {
      console.log("\n🛑 Stopping monitoring...")
      this.isMonitoring = false
      process.exit(0)
    })
  }

  async monitorContract(contractName, contractId) {
    console.log(`📡 Monitoring ${contractName} contract: ${contractId}`)

    const interval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(interval)
        return
      }

      try {
        // Monitor contract events and transactions
        await this.checkContractActivity(contractName, contractId)
      } catch (error) {
        console.error(`Error monitoring ${contractName}:`, error.message)
      }
    }, process.env.MONITORING_INTERVAL || 30000)
  }

  async checkContractActivity(contractName, contractId) {
    try {
      // Get recent transactions for the contract
      const transactions = await this.server.transactions().forAccount(contractId).order("desc").limit(5).call()

      if (transactions.records.length > 0) {
        const latestTx = transactions.records[0]
        console.log(`📊 ${contractName}: Latest transaction ${latestTx.hash} at ${latestTx.created_at}`)
      }
    } catch (error) {
      // Contract might not have any transactions yet
      console.log(`📊 ${contractName}: No recent activity`)
    }
  }

  async getSystemStats() {
    const stats = {
      timestamp: new Date().toISOString(),
      contracts: {},
      totalTransactions: 0,
    }

    for (const [name, contractId] of Object.entries(this.contracts)) {
      if (contractId) {
        try {
          const transactions = await this.server.transactions().forAccount(contractId).limit(200).call()

          stats.contracts[name] = {
            contractId,
            transactionCount: transactions.records.length,
            lastActivity: transactions.records[0]?.created_at || "No activity",
          }

          stats.totalTransactions += transactions.records.length
        } catch (error) {
          stats.contracts[name] = {
            contractId,
            transactionCount: 0,
            lastActivity: "No activity",
            error: error.message,
          }
        }
      }
    }

    return stats
  }
}

// Start monitoring if this script is run directly
if (require.main === module) {
  const monitor = new FreightFlowMonitor()
  monitor.startMonitoring()
}

module.exports = FreightFlowMonitor
