const { Server, Keypair, TransactionBuilder, Operation, Asset, Contract } = require("@stellar/stellar-sdk")
const fs = require("fs")
require("dotenv").config()

async function deployContract(network = "testnet") {
  console.log(`🚀 Deploying FreightFlow contract to ${network}...\n`)

  const server = new Server(process.env.STELLAR_RPC_URL)
  const adminKeypair = Keypair.fromSecret(process.env.ADMIN_SECRET_KEY)

  try {
    // Read the compiled WASM file
    const wasmPath = process.env.CONTRACT_WASM_PATH
    if (!fs.existsSync(wasmPath)) {
      throw new Error(`WASM file not found at ${wasmPath}. Run: cargo build --target wasm32-unknown-unknown --release`)
    }

    const wasmCode = fs.readFileSync(wasmPath)
    console.log(`📦 WASM file loaded: ${wasmCode.length} bytes`)

    // Get admin account
    const adminAccount = await server.loadAccount(adminKeypair.publicKey())
    console.log(`👤 Admin account loaded: ${adminKeypair.publicKey()}`)

    // Upload contract code
    console.log("📤 Uploading contract code...")
    const uploadTransaction = new TransactionBuilder(adminAccount, {
      fee: "100000",
      networkPassphrase:
        network === "testnet" ? "Test SDF Network ; September 2015" : "Public Global Stellar Network ; September 2015",
    })
      .addOperation(
        Operation.uploadContractWasm({
          wasm: wasmCode,
        }),
      )
      .setTimeout(30)
      .build()

    uploadTransaction.sign(adminKeypair)
    const uploadResult = await server.submitTransaction(uploadTransaction)

    if (!uploadResult.successful) {
      throw new Error("Failed to upload contract code")
    }

    const wasmHash = uploadResult.hash
    console.log(`✅ Contract code uploaded. Hash: ${wasmHash}`)

    // Create contract instance
    console.log("🏗️  Creating contract instance...")
    const adminAccount2 = await server.loadAccount(adminKeypair.publicKey())

    const createTransaction = new TransactionBuilder(adminAccount2, {
      fee: "100000",
      networkPassphrase:
        network === "testnet" ? "Test SDF Network ; September 2015" : "Public Global Stellar Network ; September 2015",
    })
      .addOperation(
        Operation.createStellarAssetContract({
          asset: Asset.native(),
        }),
      )
      .setTimeout(30)
      .build()

    createTransaction.sign(adminKeypair)
    const createResult = await server.submitTransaction(createTransaction)

    if (!createResult.successful) {
      throw new Error("Failed to create contract instance")
    }

    console.log(`✅ Contract deployed successfully!`)
    console.log(`📋 Transaction Hash: ${createResult.hash}`)
    console.log(`🔗 Contract ID: Update your .env file with the contract ID`)

    // Update .env file with contract ID
    let envContent = fs.readFileSync(".env", "utf8")
    envContent = envContent.replace(/CONTRACT_ID=.*/, `CONTRACT_ID=${createResult.hash}`)
    fs.writeFileSync(".env", envContent)

    console.log("\n🎉 Deployment completed successfully!")
    console.log("Next steps:")
    console.log("1. Initialize the contract: npm run invoke")
    console.log("2. Test contract functions")
    console.log("3. Integrate with your frontend and backend")
  } catch (error) {
    console.error("❌ Deployment failed:", error.message)
    process.exit(1)
  }
}

const network = process.argv[2] || "testnet"
deployContract(network)
