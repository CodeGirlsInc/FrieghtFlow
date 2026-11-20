export enum PaymentStatus {
  PENDING = 'pending',
  // Claimed for an in-flight chain submission — see PaymentsService.submitFunding.
  // Distinct from PENDING so a concurrent duplicate submit request can detect
  // "someone already claimed this" via an atomic conditional update instead
  // of a read-then-write race (issue #1276 concurrency requirement).
  FUNDING = 'funding',
  FUNDED = 'funded',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}
