import { CreatePaymentsTable1724140800000 } from './1724140800000-CreatePaymentsTable';
import { AddPaymentFundingFields1724227200000 } from './1724227200000-AddPaymentFundingFields';

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
});
