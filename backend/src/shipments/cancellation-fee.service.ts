import { Injectable, BadRequestException } from '@nestjs/common';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

/**
 * Share of the quoted price retained by the platform when a shipment is
 * cancelled. The rate is a function of how far the shipment progressed:
 * nothing is owed before a carrier commits, and the fee grows as the
 * platform / carrier has already incurred cost.
 */
export const CANCELLATION_FEE_TIERS: Readonly<
  Partial<Record<ShipmentStatus, number>>
> = Object.freeze({
  // No carrier has committed yet — cancel for free.
  [ShipmentStatus.PENDING]: 0,
  // A carrier accepted the job: 10% of the quoted price.
  [ShipmentStatus.ACCEPTED]: 0.1,
  // Cargo is already moving: 25% of the quoted price.
  [ShipmentStatus.IN_TRANSIT]: 0.25,
  // An admin cancelling a disputed shipment refunds in full, so the
  // platform — not the shipper — absorbs the carrier's committed cost.
  [ShipmentStatus.DISPUTED]: 0,
});

/**
 * The statuses a cancellation fee is actually charged for. `DISPUTED` is
 * cancellable but fee-free (see `CANCELLATION_FEE_TIERS`).
 */
export const FEE_BEARING_CANCELLABLE_STATUSES: readonly ShipmentStatus[] =
  Object.freeze([
    ShipmentStatus.PENDING,
    ShipmentStatus.ACCEPTED,
    ShipmentStatus.IN_TRANSIT,
  ]);

/**
 * Single source of truth for the cancellation fee policy.
 *
 * This service is deliberately pure — no repository, no I/O — so the
 * `ShipmentsService.cancel()` path and any future caller (admin tooling,
 * a scheduled sweeper) share exactly one implementation of the tiers.
 * Persisting the outcome is the caller's job.
 */
@Injectable()
export class CancellationFeeService {
  /**
   * Whether `status` can be cancelled at all (i.e. is not already
   * terminal). Terminal statuses — delivered / completed / cancelled —
   * return `false`.
   */
  isCancellable(status: ShipmentStatus): boolean {
    return Object.prototype.hasOwnProperty.call(CANCELLATION_FEE_TIERS, status);
  }

  /**
   * Whether cancelling from `status` is one of the statuses that carries a
   * published fee tier (PENDING / ACCEPTED / IN_TRANSIT).
   */
  isFeeBearingCancellable(status: ShipmentStatus): boolean {
    return FEE_BEARING_CANCELLABLE_STATUSES.includes(status);
  }

  /**
   * The fee (in the shipment's currency) to retain when cancelling a
   * shipment in `status`, rounded to 2 decimal places.
   *
   * @throws BadRequestException when `status` is not cancellable.
   */
  calculateFee(price: number, status: ShipmentStatus): number {
    const rate = CANCELLATION_FEE_TIERS[status] ?? null;
    if (rate === null) {
      throw new BadRequestException(
        `Shipment in status "${status}" cannot be cancelled`,
      );
    }
    return Math.round(price * rate * 100) / 100;
  }

  /** Human-readable audit line recorded on the shipment. */
  describeFee(fee: number, currency: string): string {
    return `Cancellation fee: ${fee} ${currency}`;
  }

  /**
   * Stamps the calculated fee onto `shipment` (in memory — the caller
   * persists it) and appends an audit line to the existing notes rather
   * than overwriting them, so a shipper's own notes survive a
   * cancellation.
   *
   * @param previousStatus the status the shipment is being cancelled
   *   *from*; defaults to the shipment's current status.
   * @returns the fee that was applied.
   */
  applyTo(shipment: Shipment, previousStatus?: ShipmentStatus): number {
    const from = previousStatus ?? shipment.status;
    const fee = this.calculateFee(Number(shipment.price), from);
    const note = this.describeFee(fee, shipment.currency);

    shipment.cancellationFee = fee;
    shipment.notes = shipment.notes ? `${shipment.notes}\n${note}` : note;

    return fee;
  }
}
