const { Server, Keypair, TransactionBuilder, Operation, Asset, Contract } = require("@stellar/stellar-sdk")
const fs = require("fs")
require("dotenv").config()

async function deployAllContracts(network = "testnet") {
  console.log(`🚀 Deploying FreightFlow complete system to ${network}...\n`)

  const server = new Server(process.env.STELLAR_RPC_URL)
  const adminKeypair = Keypair.fromSecret(process.env.ADMIN_SECRET_KEY)

  const contracts = [
    { name: "FreightFlow Core", wasmPath: process.env.FREIGHTFLOW_WASM_PATH, envKey: "FREIGHTFLOW_CONTRACT_ID" },
    { name: "Payment", wasmPath: process.env.PAYMENT_WASM_PATH, envKey: "PAYMENT_CONTRACT_ID" },
    { name: "Insurance", wasmPath: process.env.INSURANCE_WASM_PATH, envKey: "INSURANCE_CONTRACT_ID" },
    { name: "Documents", wasmPath: process.env.DOCUMENT_WASM_PATH, envKey: "DOCUMENT_CONTRACT_ID" },
  ]

  const deployedContracts = {}

  try {
    for (const contract of contracts) {
      console.log(`📦 Deploying ${contract.name} contract...`)

      if (!fs.existsSync(contract.wasmPath)) {
        throw new Error(`WASM file not found: ${contract.wasmPath}`)
      }

      const wasmCode = fs.readFileSync(contract.wasmPath)
      console.log(`   WASM file loaded: ${wasmCode.length} bytes`)

      // Get admin account
      const adminAccount = await server.loadAccount(adminKeypair.publicKey())

      // Upload contract code
      const uploadTransaction = new TransactionBuilder(adminAccount, {
        fee: "100000",
        networkPassphrase:
          network === "testnet"
            ? "Test SDF Network ; September 2015"
            : "Public Global Stellar Network ; September 2015",
      })
        .addOperation(Operation.uploadContractWasm({ wasm: wasmCode }))
        .setTimeout(30)
        .build()

      uploadTransaction.sign(adminKeypair)
      const uploadResult = await server.submitTransaction(uploadTransaction)

      if (!uploadResult.successful) {
        throw new Error(`Failed to upload ${contract.name} contract code`)
      }

      const wasmHash = uploadResult.hash
      console.log(`   ✅ ${contract.name} code uploaded. Hash: ${wasmHash}`)

      // Create contract instance
      const adminAccount2 = await server.loadAccount(adminKeypair.publicKey())
      const createTransaction = new TransactionBuilder(adminAccount2, {
        fee: "100000",
        networkPassphrase:
          network === "testnet"
            ? "Test SDF Network ; September 2015"
            : "Public Global Stellar Network ; September 2015",
      })
        .addOperation(Operation.createStellarAssetContract({ asset: Asset.native() }))
        .setTimeout(30)
        .build()

      createTransaction.sign(adminKeypair)
      const createResult = await server.submitTransaction(createTransaction)

      if (!createResult.successful) {
        throw new Error(`Failed to create ${contract.name} contract instance`)
      }

      const contractId = createResult.hash
      deployedContracts[contract.envKey] = contractId
      console.log(`   ✅ ${contract.name} deployed. Contract ID: ${contractId}\n`)

      // Wait between deployments
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    // Update .env file with contract IDs
    let envContent = fs.readFileSync(".env", "utf8")
    Object.entries(deployedContracts).forEach(([key, value]) => {
      envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`)
    })
    fs.writeFileSync(".env", envContent)

    console.log("🎉 All contracts deployed successfully!")
    console.log("\nDeployed Contract IDs:")
    console.log("=====================")
    Object.entries(deployedContracts).forEach(([key, value]) => {
      console.log(`${key}: ${value}`)
    })

    console.log("\nNext steps:")
    console.log("1. Initialize contracts: npm run invoke")
    console.log("2. Run integration tests: npm run test:integration")
    console.log("3. Start monitoring: npm run monitor")
  } catch (error) {
    console.error("❌ Deployment failed:", error.message)
    process.exit(1)
  }
}

const network = process.argv[2] || "testnet"
deployAllContracts(network)
