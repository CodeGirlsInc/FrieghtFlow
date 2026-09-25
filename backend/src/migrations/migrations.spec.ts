import { globSync } from 'node:fs';
import { AppDataSource, MIGRATIONS_GLOB } from '../data-source';
import { CreatePaymentsTable1724140800000 } from './1724140800000-CreatePaymentsTable';
import { AddPaymentFundingFields1724227200000 } from './1724227200000-AddPaymentFundingFields';
import { CreateShipmentTemplatesTable1724313600000 } from './1724313600000-CreateShipmentTemplatesTable';
import { AddShipmentCancellationFee1724400000000 } from './1724400000000-AddShipmentCancellationFee';
import { AddCertificationDocumentProvenance1724313600000 } from './1724313600000-AddCertificationDocumentProvenance';
import { CreateTwoFactorOtpTable1724313600000 } from './1724313600000-CreateTwoFactorOtpTable';

function mockQueryRunner() {
  return {
    query: jest.fn(),
  };
}

describe('migrations', () => {
  it('applies and reverts the payments table migration in order', async () => {
    const queryRunner = mockQueryRunner();
    const migration = new CreatePaymentsTable1724140800000();

    await migration.up(queryRunner as never);
    await migration.down(queryRunner as never);

    expect(queryRunner.query).toHaveBeenCalled();
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE "payments"'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('DROP TABLE "payments"'),
    );
  });

  it('adds and removes funding fields on the payments table', async () => {
    const queryRunner = mockQueryRunner();
    const migration = new AddPaymentFundingFields1724227200000();

    await migration.up(queryRunner as never);
    await migration.down(queryRunner as never);

    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('ALTER TABLE "payments"'),
    );
  });

  it('creates and drops the shipment templates table', async () => {
    const queryRunner = mockQueryRunner();
    const migration = new CreateShipmentTemplatesTable1724313600000();

    await migration.up(queryRunner as never);
    await migration.down(queryRunner as never);

    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE "shipment_templates"'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('DROP TABLE "shipment_templates"'),
    );
  });

  it('gives shipment templates every field the entity declares', async () => {
    const queryRunner = mockQueryRunner();
    await new CreateShipmentTemplatesTable1724313600000().up(
      queryRunner as never,
    );

    const createTableCall = queryRunner.query.mock.calls.find(
      (call: unknown[]) =>
        String(call[0]).includes('CREATE TABLE "shipment_templates"'),
    );
    const sql = String((createTableCall as unknown[] | undefined)?.[0]);

    for (const column of [
      '"user_id"',
      '"name"',
      '"origin"',
      '"destination"',
      '"cargo_description"',
      '"weight_kg"',
      '"price"',
      '"currency"',
      '"created_at"',
      '"updated_at"',
    ]) {
      expect(sql).toContain(column);
    }
    // Ownership is a per-user namespace with a unique name, and deleting
    // a user must take their templates with it.
    expect(sql).toContain('UNIQUE ("user_id", "name")');
    expect(sql).toContain('REFERENCES "users"("id") ON DELETE CASCADE');
  });

  it('adds and removes the shipment cancellation fee column', async () => {
    const queryRunner = mockQueryRunner();
    const migration = new AddShipmentCancellationFee1724400000000();

    await migration.up(queryRunner as never);
    await migration.down(queryRunner as never);

    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('ADD COLUMN IF NOT EXISTS "cancellation_fee"'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('DROP COLUMN IF EXISTS "cancellation_fee"'),
    );
  });

  it('adds platform document provenance and expiry-safe certification fields', async () => {
    const queryRunner = mockQueryRunner();
    const migration = new AddCertificationDocumentProvenance1724313600000();

    await migration.up(queryRunner as never);
    await migration.down(queryRunner as never);

    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('ADD COLUMN IF NOT EXISTS "document_id"'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('is_platform_hosted'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('verification_revoked_at'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('"documents_document_type_enum"'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('ON DELETE RESTRICT'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('SET "is_verified" = false'),
    );
    expect(queryRunner.query).not.toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM "documents"'),
    );
    expect(queryRunner.query).not.toHaveBeenCalledWith(
      expect.stringContaining('platform://document/'),
    );
  });

  it('creates and removes the persistent two-factor table', async () => {
    const queryRunner = mockQueryRunner();
    const migration = new CreateTwoFactorOtpTable1724313600000();

    await migration.up(queryRunner as never);
    await migration.down(queryRunner as never);

    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE "two_factor_otps"'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('"otp_code_hash"  VARCHAR(64)'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('"otp_expires_at" TIMESTAMPTZ'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('CONSTRAINT "UQ_two_factor_otps_user_id" UNIQUE'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('DROP TABLE "two_factor_otps"'),
    );
  });

  describe('CLI discovery glob', () => {
    // The DataSource glob used to be `src/migrations/*.ts`, which also matched
    // this spec file. The TypeORM CLI loads every match as a migration and
    // fails on one that exports no MigrationInterface.
    it('is the glob the DataSource actually uses', () => {
      expect(AppDataSource.options.migrations).toEqual([MIGRATIONS_GLOB]);
    });

    it('does not match the spec file', () => {
      const matched = globSync(MIGRATIONS_GLOB);

      expect(matched).not.toContain('migrations.spec.ts');
      expect(
        matched.every((path) => !path.endsWith('.spec.ts')),
      ).toBe(true);
    });

    it('still matches every real migration', () => {
      const matched = globSync(MIGRATIONS_GLOB);

      for (const migration of [
        '1724140800000-CreatePaymentsTable.ts',
        '1724227200000-AddPaymentFundingFields.ts',
        '1724313600000-AddCertificationDocumentProvenance.ts',
        '1724313600000-CreateShipmentTemplatesTable.ts',
        '1724313600000-CreateTwoFactorOtpTable.ts',
        '1724400000000-AddShipmentCancellationFee.ts',
      ]) {
        expect(matched).toContain(`src/migrations/${migration}`);
      }
    });
  });
});
