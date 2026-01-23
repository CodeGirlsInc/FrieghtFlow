# Document Hash Smart Contract (Solana/Rust)

Immutable document verification system for freight documents on Solana.

## Prerequisites

- Rust 1.70+
- Solana CLI 1.18+
- Node.js 18+

## Build

```bash
cargo build-bpf
```

## Test

```bash
cargo test
```

## Deploy

Local validator:
```bash
# Start local validator
solana-test-validator

# Deploy (in another terminal)
solana program deploy target/deploy/document_hash.so
```

## Hash a Document

```bash
node -e "
const crypto = require('crypto');
const fs = require('fs');
const hash = crypto.createHash('sha256').update(fs.readFileSync('your-file.pdf')).digest('hex');
console.log('Hash:', hash);
"
```

## Features

- Register document hashes on-chain
- Duplicate prevention via account validation
- Document verification workflow
- Shipment document grouping
- IPFS metadata integration
- Solana-native program

## Document Types

0. BillOfLading
1. ProofOfDelivery
2. Invoice
3. CustomsDeclaration
4. InsuranceCertificate
5. Photo
6. Other

## Account Structure

- **State Account**: Stores program state and document counter
- **Document Account**: Stores individual document records
- Each document gets its own account (PDA recommended)
