#!/usr/bin/env bash
set -euo pipefail

: "${CONTRACT_NAME:?Set CONTRACT_NAME (identity|shipment|escrow|document|reputation)}"
: "${NETWORK_PASSPHRASE:=Testnet SDF Future Network ; October 2022}"
: "${CONTRACTS_DIR:=$(dirname "$0")/..}"

ENV_FILE="$CONTRACTS_DIR/deployed-addresses.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found. Run deploy-all.sh first."
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

VAR="SOROBAN_${CONTRACT_NAME^^}_CONTRACT_ADDRESS"
EXISTING_ADDRESS="${!VAR:-}"
if [ -z "$EXISTING_ADDRESS" ]; then
  echo "Error: No deployed address found for $CONTRACT_NAME in $ENV_FILE"
  exit 1
fi

echo "Upgrading $CONTRACT_NAME at $EXISTING_ADDRESS …"
echo ""
echo "Step 1: Build the new WASM"
soroban contract build \
  --wasm "$CONTRACTS_DIR/$CONTRACT_NAME/target/wasm32-unknown-unknown/release/${CONTRACT_NAME}_contract.wasm"

echo ""
echo "Step 2: Install the new WASM and get the new WASM hash"
NEW_WASM_HASH=$(soroban contract install \
  --wasm "$CONTRACTS_DIR/$CONTRACT_NAME/target/wasm32-unknown-unknown/release/${CONTRACT_NAME}_contract.wasm" \
  --source "$SOURCE_SECRET" \
  --network-passphrase "$NETWORK_PASSPHRASE")
echo "    New WASM hash: $NEW_WASM_HASH"

echo ""
echo "Step 3: Upgrade the contract"
soroban contract invoke \
  --id "$EXISTING_ADDRESS" \
  --source "$SOURCE_SECRET" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- __update_contract_wasm \
  --new_wasm_hash "$NEW_WASM_HASH"

echo ""
echo "$CONTRACT_NAME upgraded successfully."
echo "Address: $EXISTING_ADDRESS"
echo "New WASM hash: $NEW_WASM_HASH"
