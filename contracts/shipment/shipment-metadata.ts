// CT-25: Custom metadata key-value store for the Shipment contract

const MAX_ENTRIES = 10;
const MAX_LEN_BYTES = 64;

/**
 * Returns the UTF-8 byte length of `str`. Metadata keys/values are limited
 * by byte length — not `.length`, which counts UTF-16 code units — because
 * byte size is what actually determines storage cost. A single multi-byte
 * character (most CJK characters, most emoji) can be 1 JS `.length` unit
 * but 3-4 bytes; `.length` alone would under- or over-count depending on
 * the character.
 */
function byteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

function validateKeyValue(key: string, value: string): void {
  if (typeof key !== "string" || typeof value !== "string") {
    throw new Error("Key and value must be strings");
  }
  if (key.trim().length === 0) {
    throw new Error("Key cannot be empty or whitespace-only");
  }
  if (byteLength(key) > MAX_LEN_BYTES || byteLength(value) > MAX_LEN_BYTES) {
    throw new Error(`Key/value exceeds ${MAX_LEN_BYTES}-byte limit`);
  }
}

function validateParties(parties: string[]): void {
  if (parties.length === 0) {
    throw new Error("Shipment must have at least one party");
  }
  if (new Set(parties).size !== parties.length) {
    throw new Error("Duplicate addresses in parties list");
  }
}

/**
 * Encapsulated shipment metadata store. Parties and metadata are only
 * mutable through this class's own methods, which enforce authorization
 * and the entry/length limits — external code gets read-only snapshots,
 * so those invariants can't be bypassed by reaching into the object
 * directly (as was possible when `parties`/`metadata` were plain public
 * fields on an interface).
 */
export class ShipmentMetadata {
  readonly shipmentId: string;
  private readonly _parties: string[];
  private readonly _metadata: Map<string, string>;

  constructor(
    shipmentId: string,
    parties: string[],
    initialMetadata: Record<string, string> = {}
  ) {
    if (!shipmentId || shipmentId.trim().length === 0) {
      throw new Error("shipmentId cannot be empty");
    }
    validateParties(parties);

    const entries = Object.entries(initialMetadata);
    if (entries.length > MAX_ENTRIES) {
      throw new Error(`Exceeds max ${MAX_ENTRIES} metadata entries`);
    }

    this.shipmentId = shipmentId;
    this._parties = [...parties];
    this._metadata = new Map();
    for (const [k, v] of entries) {
      validateKeyValue(k, v);
      this._metadata.set(k, v);
    }
  }

  /** Read-only snapshot of the parties list — mutating the returned array has no effect on the shipment. */
  get parties(): readonly string[] {
    return [...this._parties];
  }

  /** Number of metadata entries currently stored. */
  get size(): number {
    return this._metadata.size;
  }

  isParty(address: string): boolean {
    return this._parties.includes(address);
  }

  hasMetadata(key: string): boolean {
    return this._metadata.has(key);
  }

  get(key: string): string | undefined {
    return this._metadata.get(key);
  }

  getAll(): Record<string, string> {
    return Object.fromEntries(this._metadata);
  }

  /** Set (create or overwrite) a metadata entry. Only an existing shipment party may call this. */
  set(caller: string, key: string, value: string): void {
    if (!this.isParty(caller)) {
      throw new Error("Unauthorized: not a shipment party");
    }
    validateKeyValue(key, value);
    if (!this._metadata.has(key) && this._metadata.size >= MAX_ENTRIES) {
      throw new Error(`Exceeds max ${MAX_ENTRIES} metadata entries`);
    }
    this._metadata.set(key, value);
  }

  /**
   * Remove a metadata entry. Only an existing shipment party may call
   * this. Returns whether a key was actually present and removed.
   */
  delete(caller: string, key: string): boolean {
    if (!this.isParty(caller)) {
      throw new Error("Unauthorized: not a shipment party");
    }
    return this._metadata.delete(key);
  }
}

// ── Functional API (kept for backward compatibility with existing callers) ──

export function createShipment(
  shipmentId: string,
  parties: string[],
  initialMetadata: Record<string, string> = {}
): ShipmentMetadata {
  return new ShipmentMetadata(shipmentId, parties, initialMetadata);
}

export function updateMetadata(
  shipment: ShipmentMetadata,
  caller: string,
  key: string,
  value: string
): void {
  shipment.set(caller, key, value);
}

/** New: removes a metadata entry. Returns whether the key existed. */
export function deleteMetadata(
  shipment: ShipmentMetadata,
  caller: string,
  key: string
): boolean {
  return shipment.delete(caller, key);
}

export function getMetadata(shipment: ShipmentMetadata, key: string): string | undefined {
  return shipment.get(key);
}

/** New: check for a key's existence without needing to distinguish `undefined` from "not set". */
export function hasMetadata(shipment: ShipmentMetadata, key: string): boolean {
  return shipment.hasMetadata(key);
}

export function getAllMetadata(shipment: ShipmentMetadata): Record<string, string> {
  return shipment.getAll();
}