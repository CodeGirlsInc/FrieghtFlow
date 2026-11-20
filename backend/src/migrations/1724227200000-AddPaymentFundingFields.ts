import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentFundingFields1724227200000
  implements MigrationInterface
{
  name = 'AddPaymentFundingFields1724227200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // FUNDING marks a payment claimed for an in-flight chain submission —
    // see PaymentStatus enum comment / issue #1276's duplicate-submit
    // concurrency requirement. Not used within this same transaction, so
    // this is safe on PG12+ without the "unsafe use of new value" error.
    await queryRunner.query(`
      ALTER TYPE "public"."payment_status_enum" ADD VALUE IF NOT EXISTS 'funding'
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
        ADD COLUMN "stellar_tx_hash" VARCHAR(64),
        ADD COLUMN "failure_reason" VARCHAR(64)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payments"
        DROP COLUMN "failure_reason",
        DROP COLUMN "stellar_tx_hash"
    `);
    // Postgres has no DROP VALUE for enums — reverting the 'funding' enum
    // value would require recreating the type, which isn't safe to do
    // automatically without knowing whether any row already uses it.
  }
}
