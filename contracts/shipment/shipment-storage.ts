// CT-27: Upgradeable storage pattern for the Shipment contract
// Versioned schema migration without full redeployment

export interface ShipmentStorageV1 {
  storageVersion: 1;
  shipmentId: string;
  carrier: string;
  shipper: string;
  status: string;
}

export interface ShipmentStorageV2 extends Omit<ShipmentStorageV1, "storageVersion"> {
  storageVersion: 2;
  estimatedDelivery: number; // unix timestamp added in v2
  trackingEvents: string[];
}

export type ShipmentStorage = ShipmentStorageV1 | ShipmentStorageV2;

export function createV1(shipmentId: string, carrier: string, shipper: string): ShipmentStorageV1 {
  return { storageVersion: 1, shipmentId, carrier, shipper, status: "CREATED" };
}

export function migrateV1ToV2(
  storage: ShipmentStorageV1,
  caller: string,
  admin: string
): ShipmentStorageV2 {
  if (caller !== admin) throw new Error("Unauthorized: admin only");
  return {
    ...storage,
    storageVersion: 2,
    estimatedDelivery: 0,
    trackingEvents: [],
  };
}

export function migrate(
  storage: ShipmentStorage,
  targetVersion: number,
  caller: string,
  admin: string
): ShipmentStorage {
  if (storage.storageVersion === 1 && targetVersion === 2) {
    return migrateV1ToV2(storage as ShipmentStorageV1, caller, admin);
  }
  throw new Error(`Unsupported migration: v${storage.storageVersion} -> v${targetVersion}`);
}

export function getVersion(storage: ShipmentStorage): number {
  return storage.storageVersion;
}
