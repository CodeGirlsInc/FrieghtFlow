import { MigrationInterface, QueryRunner } from 'typeorm';

export class BidCounterOfferAndExpiry1750678212610 implements MigrationInterface {
  name = 'BidCounterOfferAndExpiry1750678212610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Extend the BidStatus enum with new values
    await queryRunner.query(`ALTER TYPE "public"."bids_status_enum" ADD VALUE IF NOT EXISTS 'COUNTER_OFFERED'`);
    await queryRunner.query(`ALTER TYPE "public"."bids_status_enum" ADD VALUE IF NOT EXISTS 'COUNTER_ACCEPTED'`);
    await queryRunner.query(`ALTER TYPE "public"."bids_status_enum" ADD VALUE IF NOT EXISTS 'COUNTER_REJECTED'`);
    await queryRunner.query(`ALTER TYPE "public"."bids_status_enum" ADD VALUE IF NOT EXISTS 'EXPIRED'`);

    // Add new columns
    await queryRunner.query(`ALTER TABLE "bids" ADD "counter_price" numeric(14,2)`);
    await queryRunner.query(`ALTER TABLE "bids" ADD "counter_message" text`);
    await queryRunner.query(`ALTER TABLE "bids" ADD "expires_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "bids" ADD "counter_offered_at" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bids" DROP COLUMN "counter_offered_at"`);
    await queryRunner.query(`ALTER TABLE "bids" DROP COLUMN "expires_at"`);
    await queryRunner.query(`ALTER TABLE "bids" DROP COLUMN "counter_message"`);
    await queryRunner.query(`ALTER TABLE "bids" DROP COLUMN "counter_price"`);

    // Note: PostgreSQL does not support removing enum values directly.
    // To revert enum values, recreate the type without the new values if needed.
  }
}
