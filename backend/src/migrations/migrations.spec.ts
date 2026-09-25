import { CreatePaymentsTable1724140800000 } from './1724140800000-CreatePaymentsTable';
import { AddPaymentFundingFields1724227200000 } from './1724227200000-AddPaymentFundingFields';
import { CreateTwoFactorOtpTable1724313600000 } from './1724313600000-CreateTwoFactorOtpTable';
import { AppDataSource } from '../data-source';

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

  it('excludes migration specs from the TypeORM CLI glob', () => {
    expect(AppDataSource.options.migrations).toEqual([
      'src/migrations/!(*.spec).ts',
    ]);
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
});
