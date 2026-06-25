// CT-28: Carrier whitelist registration for the Identity contract
// Manages admin-controlled carrier approval on-chain

export type Address = string;

export interface CarrierWhitelistStorage {
  carrierWhitelist: Map<Address, boolean>;
  admin: Address;
  whitelistEnabled: boolean;
}

export function initWhitelistStorage(admin: Address): CarrierWhitelistStorage {
  return { carrierWhitelist: new Map(), admin, whitelistEnabled: true };
}

function assertAdmin(storage: CarrierWhitelistStorage, caller: Address): void {
  if (caller !== storage.admin) throw new Error("Unauthorized: admin only");
}

export function approveCarrier(
  storage: CarrierWhitelistStorage,
  caller: Address,
  wallet: Address
): void {
  assertAdmin(storage, caller);
  storage.carrierWhitelist.set(wallet, true);
}

export function revokeCarrier(
  storage: CarrierWhitelistStorage,
  caller: Address,
  wallet: Address
): void {
  assertAdmin(storage, caller);
  storage.carrierWhitelist.set(wallet, false);
}

export function isApprovedCarrier(
  storage: CarrierWhitelistStorage,
  wallet: Address
): boolean {
  if (!storage.whitelistEnabled) return true;
  return storage.carrierWhitelist.get(wallet) === true;
}

export function setWhitelistEnabled(
  storage: CarrierWhitelistStorage,
  caller: Address,
  enabled: boolean
): void {
  assertAdmin(storage, caller);
  storage.whitelistEnabled = enabled;
}
