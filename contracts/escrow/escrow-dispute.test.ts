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

function makeEscrow(): Escrow {
  return { id: "e1", shipper: "alice", carrier: "bob", admin: "admin", amount: 100, fee: 5, status: "ACTIVE" };
}

// --- Tests ---

function test(name: string, fn: () => void) {
  try { fn(); console.log(`✓ ${name}`); }
  catch (e) { console.error(`✗ ${name}: ${(e as Error).message}`); }
}

test("raise_dispute transitions escrow to Disputed", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  if (e.status !== "DISPUTED") throw new Error("Expected DISPUTED");
});

test("resolve_dispute releases funds to carrier", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  resolveDispute(e, "admin", true);
  if (e.status !== "RELEASED") throw new Error("Expected RELEASED");
});

test("resolve_dispute refunds shipper", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  resolveDispute(e, "admin", false);
  if (e.status !== "REFUNDED") throw new Error("Expected REFUNDED");
});

test("only admin can resolve disputes", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  try { resolveDispute(e, "alice", true); throw new Error("Should have thrown"); }
  catch (err) { if ((err as Error).message !== "Only admin can resolve disputes") throw err; }
});

test("raising dispute on already-disputed escrow is rejected", () => {
  const e = makeEscrow();
  raiseDispute(e, "alice");
  try { raiseDispute(e, "bob"); throw new Error("Should have thrown"); }
  catch (err) { if ((err as Error).message !== "Can only dispute an active escrow") throw err; }
});
