#!/usr/bin/env bash
set -euo pipefail

: "${ADMIN_PUBLIC_KEY:?Set ADMIN_PUBLIC_KEY to the admin address}"
: "${TOKEN_CONTRACT_ADDRESS:?Set TOKEN_CONTRACT_ADDRESS for escrow initialization}"
: "${NETWORK_PASSPHRASE:=Testnet SDF Future Network ; October 2022}"
: "${CONTRACTS_DIR:=$(dirname "$0")/..}"

ENV_FILE="$CONTRACTS_DIR/deployed-addresses.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found. Run deploy-all.sh first."
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

echo "Initializing contracts with admin=$ADMIN_PUBLIC_KEY …"

echo "  Initializing identity…"
soroban contract invoke \
  --id "$SOROBAN_IDENTITY_CONTRACT_ADDRESS" \
  --source deployer \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- initialize \
  --admin "$ADMIN_PUBLIC_KEY"

echo "  Initializing shipment…"
soroban contract invoke \
  --id "$SOROBAN_SHIPMENT_CONTRACT_ADDRESS" \
  --source deployer \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- initialize \
  --admin "$ADMIN_PUBLIC_KEY"

echo "  Initializing escrow…"
soroban contract invoke \
  --id "$SOROBAN_ESCROW_CONTRACT_ADDRESS" \
  --source deployer \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- initialize \
  --admin "$ADMIN_PUBLIC_KEY" \
  --token "$TOKEN_CONTRACT_ADDRESS"

echo "  Initializing document…"
soroban contract invoke \
  --id "$SOROBAN_DOCUMENT_CONTRACT_ADDRESS" \
  --source deployer \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- initialize \
  --admin "$ADMIN_PUBLIC_KEY"

echo "  Initializing reputation…"
soroban contract invoke \
  --id "$SOROBAN_REPUTATION_CONTRACT_ADDRESS" \
  --source deployer \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- initialize \
  --admin "$ADMIN_PUBLIC_KEY" \
  --authorized-shipment "$SOROBAN_SHIPMENT_CONTRACT_ADDRESS"

echo ""
echo "All contracts initialized."
