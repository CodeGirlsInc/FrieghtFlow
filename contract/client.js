const {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');
const borsh = require('borsh');
const crypto = require('crypto');

// Document types enum
const DocumentType = {
  BillOfLading: 0,
  ProofOfDelivery: 1,
  Invoice: 2,
  CustomsDeclaration: 3,
  InsuranceCertificate: 4,
  Photo: 5,
  Other: 6,
};

// Hash a document
function hashDocument(filePath) {
  const fs = require('fs');
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest();
}

// Example usage
async function main() {
  // Connect to localnet
  const connection = new Connection('http://localhost:8899', 'confirmed');
  
  // Load your wallet
  const payer = Keypair.generate(); // Replace with actual wallet
  
  console.log('Connected to Solana');
  console.log('Wallet:', payer.publicKey.toString());
  
  // Your program ID (deploy first to get this)
  const programId = new PublicKey('YOUR_PROGRAM_ID_HERE');
  
  console.log('\nReady to interact with document hash program');
  console.log('Program ID:', programId.toString());
}

main().catch(console.error);
