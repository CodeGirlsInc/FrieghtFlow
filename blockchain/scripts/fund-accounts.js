const { Server, Keypair } = require("@stellar/stellar-sdk")
require("dotenv").config()

async function fundAccount(publicKey, accountName) {
  try {
    const response = await fetch(`${process.env.FRIENDBOT_URL}?addr=${publicKey}`)

    if (response.ok) {
      console.log(`✅ ${accountName} account funded: ${publicKey}`)
      return true
    } else {
      console.log(`❌ Failed to fund ${accountName} account: ${publicKey}`)
      return false
    }
  } catch (error) {
    console.error(`Error funding ${accountName} account:`, error.message)
    return false
  }
}

async function fundAllAccounts() {
  console.log("💰 Funding FreightFlow system accounts...\n")

  const accounts = [
    { key: process.env.ADMIN_PUBLIC_KEY, name: "Admin" },
    { key: process.env.SHIPPER_PUBLIC_KEY, name: "Shipper" },
    { key: process.env.CARRIER_PUBLIC_KEY, name: "Carrier" },
    { key: process.env.RECEIVER_PUBLIC_KEY, name: "Receiver" },
    { key: process.env.CUSTOMS_AGENT_PUBLIC_KEY, name: "Customs Agent" },
    { key: process.env.INSURANCE_AGENT_PUBLIC_KEY, name: "Insurance Agent" },
  ]

  let successCount = 0

  for (const account of accounts) {
    if (account.key) {
      const success = await fundAccount(account.key, account.name)
      if (success) successCount++

      // Wait 1 second between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } else {
      console.log(`⚠️  ${account.name} public key not found in .env file`)
    }
  }

  console.log(`\n🎉 Successfully funded ${successCount}/${accounts.length} accounts`)

  if (successCount === accounts.length) {
    console.log("\nNext steps:")
    console.log("1. Build all contracts: npm run build:all")
    console.log("2. Deploy to testnet: npm run deploy:all:testnet")
    console.log("3. Run integration tests: npm run test:integration")
  }
}

fundAllAccounts().catch(console.error)
