// CT-25: Custom metadata key-value store for the Shipment contract

const MAX_ENTRIES = 10;
const MAX_LEN = 64;

export interface ShipmentMetadata {
  shipmentId: string;
  parties: string[];
  metadata: Map<string, string>;
}

function validate(key: string, value: string): void {
  if (key.length > MAX_LEN || value.length > MAX_LEN)
    throw new Error("Key/value exceeds 64 character limit");
}

export function createShipment(
  shipmentId: string,
  parties: string[],
  initialMetadata: Record<string, string> = {}
): ShipmentMetadata {
  const entries = Object.entries(initialMetadata);
  if (entries.length > MAX_ENTRIES) throw new Error("Exceeds max 10 metadata entries");
  const metadata = new Map<string, string>();
  for (const [k, v] of entries) { validate(k, v); metadata.set(k, v); }
  return { shipmentId, parties, metadata };
}

export function updateMetadata(
  shipment: ShipmentMetadata,
  caller: string,
  key: string,
  value: string
): void {
  if (!shipment.parties.includes(caller)) throw new Error("Unauthorized: not a shipment party");
  validate(key, value);
  if (!shipment.metadata.has(key) && shipment.metadata.size >= MAX_ENTRIES)
    throw new Error("Exceeds max 10 metadata entries");
  shipment.metadata.set(key, value);
}

export function getMetadata(shipment: ShipmentMetadata, key: string): string | undefined {
  return shipment.metadata.get(key);
}

export function getAllMetadata(shipment: ShipmentMetadata): Record<string, string> {
  return Object.fromEntries(shipment.metadata);
}
