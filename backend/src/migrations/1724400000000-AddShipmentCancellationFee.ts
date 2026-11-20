import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShipmentCancellationFee1724400000000
  implements MigrationInterface
{
  name = 'AddShipmentCancellationFee1724400000000';

  /**
   * `cancellation_fee` records the tiered fee retained by the platform when
   * a shipment is cancelled (see `CancellationFeeService`). It is NULL
   * while the shipment is live, so the column also answers "was this
   * cancelled for a fee?".
   *
   * Guarded with IF NOT EXISTS so the migration is safe to re-run on
   * environments where `synchronize` already created the column.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shipments"
        ADD COLUMN IF NOT EXISTS "cancellation_fee" NUMERIC(14,2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shipments" DROP COLUMN IF EXISTS "cancellation_fee"
    `);
  }
}
