import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsRFQToShipments1718900000001 implements MigrationInterface {
  name = 'AddIsRFQToShipments1718900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shipments" ADD "is_rfq" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "shipments" ALTER COLUMN "price" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shipments" ALTER COLUMN "price" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN "is_rfq"`);
  }
}
