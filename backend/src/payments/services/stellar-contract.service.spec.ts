import { StellarContractService } from './stellar-contract.service';

describe('StellarContractService Sequence Contention (Issue #1277 / PAY-04)', () => {
  let stellarService: StellarContractService;

  beforeEach(() => {
    stellarService = new StellarContractService();
  });

  it('handles N concurrent admin calls without sequence-number collision or race conditions', async () => {
    const N = 10;
    const concurrentCalls = Array.from({ length: N }, (_, i) =>
      stellarService.submitAdminTransaction(`admin_action_${i}`, async (seq) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return { txHash: `tx_admin_${i}_seq_${seq}` };
      }),
    );

    const results = await Promise.all(concurrentCalls);

    expect(results).toHaveLength(N);

    const sequencesUsed = results.map((r) => r.sequenceUsed);
    const uniqueSequences = new Set(sequencesUsed);

    expect(uniqueSequences.size).toBe(N);
    expect(sequencesUsed).toEqual([
      100000n,
      100001n,
      100002n,
      100003n,
      100004n,
      100005n,
      100006n,
      100007n,
      100008n,
      100009n,
    ]);
  });
});
