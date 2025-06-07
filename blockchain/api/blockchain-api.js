const express = require("express")
const { Server, Keypair, Contract } = require("@stellar/stellar-sdk")
const Joi = require("joi")
require("dotenv").config()

const app = express()
app.use(express.json())

const server = new Server(process.env.STELLAR_RPC_URL)

// Validation schemas
const createShipmentSchema = Joi.object({
  shipper: Joi.string().required(),
  carrier: Joi.string().required(),
  receiver: Joi.string().required(),
  origin: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    postal_code: Joi.string().required(),
  }).required(),
  destination: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    postal_code: Joi.string().required(),
  }).required(),
  cargo: Joi.object({
    description: Joi.string().required(),
    cargo_type: Joi.string().required(),
    weight_kg: Joi.number().positive().required(),
    volume_m3: Joi.number().positive().required(),
    value_usd: Joi.number().positive().required(),
  }).required(),
  estimated_delivery: Joi.number().required(),
  requires_customs: Joi.boolean().required(),
})

// API Routes

// Create shipment
app.post("/api/shipments", async (req, res) => {
  try {
    const { error, value } = createShipmentSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    // Call smart contract to create shipment
    const shipmentId = await createShipmentOnBlockchain(value)

    res.json({
      success: true,
      shipmentId,
      message: "Shipment created successfully",
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get shipment
app.get("/api/shipments/:id", async (req, res) => {
  try {
    const shipment = await getShipmentFromBlockchain(req.params.id)
    res.json({ success: true, shipment })
  } catch (err) {
    res.status(404).json({ error: "Shipment not found" })
  }
})

// Update shipment status
app.put("/api/shipments/:id/status", async (req, res) => {
  try {
    const { status, location, notes } = req.body
    await updateShipmentStatusOnBlockchain(req.params.id, status, location, notes)
    res.json({ success: true, message: "Shipment status updated" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create payment
app.post("/api/payments", async (req, res) => {
  try {
    const paymentId = await createPaymentOnBlockchain(req.body)
    res.json({ success: true, paymentId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get payment
app.get("/api/payments/:id", async (req, res) => {
  try {
    const payment = await getPaymentFromBlockchain(req.params.id)
    res.json({ success: true, payment })
  } catch (err) {
    res.status(404).json({ error: "Payment not found" })
  }
})

// Create insurance policy
app.post("/api/insurance/policies", async (req, res) => {
  try {
    const policyId = await createInsurancePolicyOnBlockchain(req.body)
    res.json({ success: true, policyId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Upload document
app.post("/api/documents", async (req, res) => {
  try {
    const documentId = await uploadDocumentOnBlockchain(req.body)
    res.json({ success: true, documentId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// System health check
app.get("/api/health", async (req, res) => {
  try {
    const health = await checkSystemHealth()
    res.json({ success: true, health })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Blockchain interaction functions
async function createShipmentOnBlockchain(shipmentData) {
  // Implementation for creating shipment on blockchain
  return `SHIP${Date.now()}`
}

async function getShipmentFromBlockchain(shipmentId) {
  // Implementation for getting shipment from blockchain
  return { id: shipmentId, status: "Created" }
}

async function updateShipmentStatusOnBlockchain(shipmentId, status, location, notes) {
  // Implementation for updating shipment status
  return true
}

async function createPaymentOnBlockchain(paymentData) {
  // Implementation for creating payment
  return `PAY${Date.now()}`
}

async function getPaymentFromBlockchain(paymentId) {
  // Implementation for getting payment
  return { id: paymentId, status: "Created" }
}

async function createInsurancePolicyOnBlockchain(policyData) {
  // Implementation for creating insurance policy
  return `INS${Date.now()}`
}

async function uploadDocumentOnBlockchain(documentData) {
  // Implementation for uploading document
  return `DOC${Date.now()}`
}

async function checkSystemHealth() {
  return {
    status: "healthy",
    contracts: {
      freightflow: !!process.env.FREIGHTFLOW_CONTRACT_ID,
      payment: !!process.env.PAYMENT_CONTRACT_ID,
      insurance: !!process.env.INSURANCE_CONTRACT_ID,
      documents: !!process.env.DOCUMENT_CONTRACT_ID,
    },
    network: process.env.STELLAR_NETWORK,
    timestamp: new Date().toISOString(),
  }
}

const PORT = process.env.API_PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 FreightFlow Blockchain API running on port ${PORT}`)
})

module.exports = app
