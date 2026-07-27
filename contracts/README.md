# FreightFlow Soroban Contracts

This workspace contains the Stellar/Soroban smart contracts that power FreightFlow's on-chain features:

| Contract | Purpose |
|---|---|
| [identity](identity/) | Wallet-to-user identity registry |
| [shipment](shipment/) | Shipment lifecycle management |
| [escrow](escrow/) | Payment escrow with dispute resolution |
| [document](document/) | Tamper-proof document hash registry |
| [reputation](reputation/) | On-chain ratings and reputation scores |

## Prerequisites

- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/installation) (`soroban`)
- Rust toolchain with `wasm32-unknown-unknown` target
- A funded Stellar testnet account

```bash
# Install the WASM target
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install --locked --soroban-cli
```

## Build

```bash
cargo build --target wasm32-unknown-unknown --release --workspace
```

## Test

```bash
cargo test --workspace
```

## Deploy

See [scripts/](scripts/) for deployment automation. Quick start:

```bash
# 1. Set your deployer secret
export SOURCE_SECRET=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# 2. Deploy all contracts
./scripts/deploy-all.sh

# 3. Initialize contracts
export ADMIN_PUBLIC_KEY=GABC...
export TOKEN_CONTRACT_ADDRESS=CAAA...
./scripts/initialize-contracts.sh
```

## Deployed Addresses

See [deployed-addresses.md](deployed-addresses.md) for tracked deployment addresses.

## Backend Integration

See [INTEGRATION.md](INTEGRATION.md) for TypeScript examples of invoking these contracts from the NestJS backend using `@stellar/stellar-sdk`.
