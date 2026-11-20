import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShipmentListedPrice1724700000000 implements MigrationInterface {
  name = 'AddShipmentListedPrice1724700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shipments"
        ADD COLUMN IF NOT EXISTS "listed_price" NUMERIC(14,2)
    `);
    await queryRunner.query(`
      UPDATE "shipments"
      SET "listed_price" = "price"
      WHERE "listed_price" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "shipments"
        ALTER COLUMN "listed_price" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shipments" DROP COLUMN IF EXISTS "listed_price"
    `);
  }
}
