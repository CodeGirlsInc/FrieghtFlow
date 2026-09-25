import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds platform-owned document provenance to carrier certifications.
 *
 * The migration is intentionally forward-safe: rerunning the statements is
 * harmless, and the down migration preserves rows and provenance columns
 * rather than deleting files or manufacturing legacy URLs.
 */
export class AddCertificationDocumentProvenance1724313600000
  implements MigrationInterface
{
  name = 'AddCertificationDocumentProvenance1724313600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Certification documents are not attached to a shipment, so the shared
    // document record must permit a null shipment reference.
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "shipment_id" DROP NOT NULL`,
    );

    // TypeORM derives enum names as <table>_<column>_enum. For the documents
    // table/document_type column this is documents_document_type_enum.
    await queryRunner.query(
      `ALTER TYPE "public"."documents_document_type_enum" ADD VALUE IF NOT EXISTS 'carrier_certification'`,
    );

    await queryRunner.query(`
      ALTER TABLE "carrier_certifications"
        ADD COLUMN IF NOT EXISTS "document_id" uuid,
        ADD COLUMN IF NOT EXISTS "is_platform_hosted" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "verification_revoked_at" timestamptz
    `);

    // Existing rows predate platform upload provenance. Revoke any old
    // verification rather than allowing an arbitrary legacy URL to remain
    // trusted after this migration. This changes only verification state; it
    // does not delete user data or files.
    await queryRunner.query(`
      UPDATE "carrier_certifications"
      SET "is_verified" = false,
          "verification_revoked_at" = CURRENT_TIMESTAMP
      WHERE "document_id" IS NULL AND "is_verified" = true
    `);
    await queryRunner.query(`
      UPDATE "carrier_certifications"
      SET "is_platform_hosted" = false
      WHERE "document_id" IS NULL
    `);

    await queryRunner.query(
      `ALTER TABLE "carrier_certifications" ALTER COLUMN "file_url" DROP NOT NULL`,
    );

    // RESTRICT is intentional: deleting a backing document must not silently
    // turn a verified certification into an unverifiable dangling reference.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_carrier_certifications_document'
            AND conrelid = 'carrier_certifications'::regclass
        ) THEN
          ALTER TABLE "carrier_certifications"
            DROP CONSTRAINT "FK_carrier_certifications_document";
        END IF;
        ALTER TABLE "carrier_certifications"
          ADD CONSTRAINT "FK_carrier_certifications_document"
          FOREIGN KEY ("document_id") REFERENCES "documents"("id")
          ON DELETE RESTRICT;
      END $$;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_carrier_certifications_document_id"
      ON "carrier_certifications" ("document_id")
      WHERE "document_id" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_carrier_certifications_verified_expiry"
      ON "carrier_certifications"
        ("is_verified", "expires_at", "verification_revoked_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_carrier_certifications_document_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_carrier_certifications_verified_expiry"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carrier_certifications" DROP CONSTRAINT IF EXISTS "FK_carrier_certifications_document"`,
    );

    // Do not synthesize replacement URLs, delete unbound documents, or restore
    // NOT NULL constraints here. Those operations would be destructive and can
    // fail once platform documents exist. Keeping the nullable provenance
    // columns is a safe rollback; a subsequent up is idempotent.
    //
    // PostgreSQL also cannot remove an enum value without rebuilding the type,
    // so carrier_certification intentionally remains in the enum.
  }
}
