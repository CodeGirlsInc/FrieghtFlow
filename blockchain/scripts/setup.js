const { Keypair } = require("@stellar/stellar-sdk")
const fs = require("fs")

async function generateKeypairs() {
  console.log("🔑 Generating Stellar keypairs for FreightFlow Complete System...\n")

  const accounts = {
    admin: Keypair.random(),
    shipper: Keypair.random(),
    carrier: Keypair.random(),
    receiver: Keypair.random(),
    customs_agent: Keypair.random(),
    insurance_agent: Keypair.random(),
  }

  console.log("Generated Accounts:")
  console.log("==================")

  Object.entries(accounts).forEach(([role, keypair]) => {
    console.log(`${role.toUpperCase().replace("_", " ")}:`)
    console.log(`  Public Key:  ${keypair.publicKey()}`)
    console.log(`  Secret Key:  ${keypair.secret()}\n`)
  })

  // Create .env file
  const envContent = `# Stellar Network Configuration
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Admin Account
ADMIN_PUBLIC_KEY=${accounts.admin.publicKey()}
ADMIN_SECRET_KEY=${accounts.admin.secret()}

# Contract Addresses (Will be populated after deployment)
FREIGHTFLOW_CONTRACT_ID=
PAYMENT_CONTRACT_ID=
INSURANCE_CONTRACT_ID=
DOCUMENT_CONTRACT_ID=

# Contract WASM Paths
FREIGHTFLOW_WASM_PATH=target/wasm32-unknown-unknown/release/freightflow_core.wasm
PAYMENT_WASM_PATH=target/wasm32-unknown-unknown/release/freightflow_payment.wasm
INSURANCE_WASM_PATH=target/wasm32-unknown-unknown/release/freightflow_insurance.wasm
DOCUMENT_WASM_PATH=target/wasm32-unknown-unknown/release/freightflow_documents.wasm

# Test Accounts
SHIPPER_PUBLIC_KEY=${accounts.shipper.publicKey()}
SHIPPER_SECRET_KEY=${accounts.shipper.secret()}
CARRIER_PUBLIC_KEY=${accounts.carrier.publicKey()}
CARRIER_SECRET_KEY=${accounts.carrier.secret()}
RECEIVER_PUBLIC_KEY=${accounts.receiver.publicKey()}
RECEIVER_SECRET_KEY=${accounts.receiver.secret()}
CUSTOMS_AGENT_PUBLIC_KEY=${accounts.customs_agent.publicKey()}
CUSTOMS_AGENT_SECRET_KEY=${accounts.customs_agent.secret()}
INSURANCE_AGENT_PUBLIC_KEY=${accounts.insurance_agent.publicKey()}
INSURANCE_AGENT_SECRET_KEY=${accounts.insurance_agent.secret()}

# Token Addresses (Testnet)
USDC_TOKEN_ADDRESS=
XLM_TOKEN_ADDRESS=

# API Configuration
API_PORT=3001
WEBHOOK_SECRET=${generateRandomString(32)}

# Monitoring
ENABLE_MONITORING=true
MONITORING_INTERVAL=30000

# Friendbot URL for testnet funding
FRIENDBOT_URL=https://friendbot.stellar.org

# Database (for caching and indexing)
DATABASE_URL=postgresql://user:password@localhost:5432/freightflow_blockchain

# Redis (for real-time updates)
REDIS_URL=redis://localhost:6379
`

  fs.writeFileSync(".env", envContent)
  console.log("✅ Environment file (.env) created successfully!")
  console.log("⚠️  Keep your secret keys secure and never commit them to version control.")
  console.log("\nNext steps:")
  console.log("1. Run: npm run fund-accounts")
  console.log("2. Run: npm run build:all")
  console.log("3. Run: npm run deploy:all:testnet")
  console.log("4. Run: npm run test:integration")
}

function generateRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

generateKeypairs().catch(console.error)
