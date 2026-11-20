#!/usr/bin/env bash
# Build every contract crate for wasm32 and enforce a per-crate size budget.
#
# Soroban WASM size drives deployment cost and has network-enforced ceilings,
# so a size regression should fail CI rather than surface at deploy time.
#
# Budgets below are deliberate ceilings with headroom, not current sizes.
# Raising one is allowed, but do it in its own commit with a note saying why.
# Run from the `contracts/` directory: ./scripts/check-wasm-size.sh
set -euo pipefail

# crate:budget_in_bytes
BUDGETS=(
  "identity:65536"
  "shipment:98304"
  "escrow:81920"
  "document:81920"
  "reputation:81920"
)

TARGET_DIR="target/wasm32-unknown-unknown/release"
status=0

cargo build --release --target wasm32-unknown-unknown --all

printf '%-14s %10s %10s  %s\n' CRATE SIZE BUDGET RESULT
for entry in "${BUDGETS[@]}"; do
  crate="${entry%%:*}"
  budget="${entry##*:}"
  wasm="${TARGET_DIR}/${crate}.wasm"

  if [[ ! -f "$wasm" ]]; then
    printf '%-14s %10s %10s  %s\n' "$crate" - "$budget" "MISSING $wasm"
    status=1
    continue
  fi

  size=$(wc -c < "$wasm")
  if (( size > budget )); then
    printf '%-14s %10s %10s  %s\n' "$crate" "$size" "$budget" "OVER by $((size - budget))"
    status=1
  else
    printf '%-14s %10s %10s  %s\n' "$crate" "$size" "$budget" "ok"
  fi
done

exit "$status"
