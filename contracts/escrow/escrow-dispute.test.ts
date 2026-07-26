// CT-26: Unit tests for Escrow dispute and resolution flow

type EscrowStatus = "ACTIVE" | "DISPUTED" | "RELEASED" | "REFUNDED";

interface Escrow {
  id: string;
  shipper: string;
  carrier: string;
  admin: string;
  amount: number;
  fee: number;
  status: EscrowStatus;
}

function raiseDispute(escrow: Escrow, caller: string): void {
  if (escrow.status !== "ACTIVE") throw new Error("Can only dispute an active escrow");
  if (caller !== escrow.shipper && caller !== escrow.carrier) throw new Error("Unauthorized");
  escrow.status = "DISPUTED";
}

function resolveDispute(escrow: Escrow, caller: string, releaseToCarrier: boolean): void {
  if (caller !== escrow.admin) throw new Error("Only admin can resolve disputes");
  if (escrow.status !== "DISPUTED") throw new Error("Escrow is not disputed");
  escrow.status = releaseToCarrier ? "RELEASED" : "REFUNDED";
}

function makeEscrow(overrides: Partial<Escrow> = {}): Escrow {
  return {
    id: "e1",
    shipper: "alice",
    carrier: "bob",
    admin: "admin",
    amount: 100,
    fee: 5,
    status: "ACTIVE",
    ...overrides,
  };
}

// --- Test harness ---

let passCount = 0;
let failCount = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    passCount++;
    console.log(`✓ ${name}`);
  } catch (e) {
    failCount++;
    console.error(`✗ ${name}: ${(e as Error).message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(message ?? `Expected ${String(expected)}, got ${String(actual)}`);
  }
}

/**
 * Asserts that `fn` throws, and (optionally) that the thrown error's
 * message matches `expectedMessage` exactly. Re-throws with a clear
 * failure reason if `fn` doesn't throw at all, or throws the wrong error.
 */
function assertThrows(fn: () => void, expectedMessage?: string): void {
  try {
    fn();
  } catch (e) {
    const actualMessage = (e as Error).message;
    if (expectedMessage !== undefined && actualMessage !== expectedMessage) {
      throw new Error(
        `Expected error "${expectedMessage}", got "${actualMessage}"`,
      );
    }
    return;
  }
  throw new Error("Expected function to throw, but it did not");
}

function printSummary(): void {
  const total = passCount + failCount;
  console.log(`\n${passCount}/${total} tests passed`);
  if (failCount > 0) {
    console.log(`${failCount} test(s) failed`);
  }
}

// --- raiseDispute ---

test("raiseDispute: shipper can raise a dispute on an active escrow", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  assertEqual(e.status, "DISPUTED");
});

test("raiseDispute: carrier can also raise a dispute", () => {
  const e = makeEscrow();
  raiseDispute(e, "bob");
  assertEqual(e.status, "DISPUTED");
});

test("raiseDispute: unrelated caller is rejected", () => {
  const e = makeEscrow();
  assertThrows(() => raiseDispute(e, "mallory"), "Unauthorized");
  assertEqual(e.status, "ACTIVE", "Status should be unchanged after a rejected call");
});

test("raiseDispute: admin cannot raise a dispute on someone else's escrow", () => {
  const e = makeEscrow();
  assertThrows(() => raiseDispute(e, "admin"), "Unauthorized");
});

test("raiseDispute: cannot dispute an already-disputed escrow", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  assertThrows(() => raiseDispute(e, "bob"), "Can only dispute an active escrow");
});

test("raiseDispute: cannot dispute a released escrow", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  resolveDispute(e, "admin", true);
  assertThrows(() => raiseDispute(e, "alice"), "Can only dispute an active escrow");
});

test("raiseDispute: cannot dispute a refunded escrow", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  resolveDispute(e, "admin", false);
  assertThrows(() => raiseDispute(e, "bob"), "Can only dispute an active escrow");
});

// --- resolveDispute ---

test("resolveDispute: admin releases funds to carrier", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  resolveDispute(e, "admin", true);
  assertEqual(e.status, "RELEASED");
});

test("resolveDispute: admin refunds shipper", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  resolveDispute(e, "admin", false);
  assertEqual(e.status, "REFUNDED");
});

test("resolveDispute: only admin can resolve disputes", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  assertThrows(() => resolveDispute(e, "alice", true), "Only admin can resolve disputes");
});

test("resolveDispute: carrier also cannot resolve disputes", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  assertThrows(() => resolveDispute(e, "bob", true), "Only admin can resolve disputes");
});

test("resolveDispute: cannot resolve an active (non-disputed) escrow", () => {
  const e = makeEscrow();
  assertThrows(() => resolveDispute(e, "admin", true), "Escrow is not disputed");
});

test("resolveDispute: cannot resolve an already-released escrow twice", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  resolveDispute(e, "admin", true);
  assertThrows(() => resolveDispute(e, "admin", false), "Escrow is not disputed");
  assertEqual(e.status, "RELEASED", "Status should remain RELEASED after rejected second resolution");
});

test("resolveDispute: cannot resolve an already-refunded escrow twice", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  resolveDispute(e, "admin", false);
  assertThrows(() => resolveDispute(e, "admin", true), "Escrow is not disputed");
});

// --- Field integrity ---

test("dispute/resolution flow does not mutate unrelated escrow fields", () => {
  const e = makeEscrow({ id: "e42", amount: 250, fee: 12.5 });
  raiseDispute(e, "alice");
  resolveDispute(e, "admin", true);
  assertEqual(e.id, "e42");
  assertEqual(e.shipper, "alice");
  assertEqual(e.carrier, "bob");
  assertEqual(e.admin, "admin");
  assertEqual(e.amount, 250);
  assertEqual(e.fee, 12.5);
});

printSummary();

if (failCount > 0) {
  process.exit(1);
}