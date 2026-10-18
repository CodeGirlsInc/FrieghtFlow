import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCarrierCertificationCarrierFk1724600000000
  implements MigrationInterface
{
  name = 'AddCarrierCertificationCarrierFk1724600000000';

  /**
   * `carrier_certifications.carrier_id` had no foreign key, so a row could
   * reference a user that never existed or was deleted. Orphans are removed
   * first so the constraint can be created, then the FK is added (idempotent).
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "carrier_certifications"
      WHERE "carrier_id" NOT IN (SELECT "id" FROM "users")
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_carrier_certifications_carrier_id'
        ) THEN
          ALTER TABLE "carrier_certifications"
            ADD CONSTRAINT "FK_carrier_certifications_carrier_id"
            FOREIGN KEY ("carrier_id") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "carrier_certifications"
        DROP CONSTRAINT IF EXISTS "FK_carrier_certifications_carrier_id"
    `);
  }
}
