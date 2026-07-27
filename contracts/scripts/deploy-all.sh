#!/usr/bin/env bash
set -euo pipefail

: "${SOURCE_SECRET:?Set SOURCE_SECRET to the deployer secret key}"
: "${NETWORK_PASSPHRASE:=Testnet SDF Future Network ; October 2022}"
: "${CONTRACTS_DIR:=$(dirname "$0")/..}"

CONTRACTS=(identity shipment escrow document reputation)
OUTPUT="$CONTRACTS_DIR/deployed-addresses.env"
rm -f "$OUTPUT"
touch "$OUTPUT"

echo "Building all contracts…"
for name in "${CONTRACTS[@]}"; do
  echo "  Building $name…"
  soroban contract build \
    --wasm "$CONTRACTS_DIR/$name/target/wasm32-unknown-unknown/release/${name}_contract.wasm"
done

echo ""
echo "Deploying to $NETWORK_PASSPHRASE …"

declare -A ADDRESSES

for name in "${CONTRACTS[@]}"; do
  WASM="$CONTRACTS_DIR/$name/target/wasm32-unknown-unknown/release/${name}_contract.wasm"
  echo "  Deploying $name…"
  addr=$(soroban contract deploy \
    --wasm "$WASM" \
    --source "$SOURCE_SECRET" \
    --network "$NETWORK_PASSPHRASE")
  ADDRESSES[$name]="$addr"
  echo "    → $addr"
  echo "SOROBAN_${name^^}_CONTRACT_ADDRESS=$addr" >> "$OUTPUT"
done

echo ""
echo "All contracts deployed. Addresses written to $OUTPUT"
echo ""
cat "$OUTPUT"
