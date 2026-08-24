import { PaymentReconciliationService } from './payment-reconciliation.service';
import { StellarContractService } from './stellar-contract.service';
import { Payment } from '../entities/payment.entity';
import { PaymentStatus } from '../enums/payment-status.enum';

describe('PaymentReconciliationService (Issue #1278 / PAY-05)', () => {
  let reconciliationService: PaymentReconciliationService;
  let stellarContractService: StellarContractService;

  beforeEach(() => {
    stellarContractService = new StellarContractService();
    reconciliationService = new PaymentReconciliationService(stellarContractService);
  });

  it('detects a manually-induced drift (backend CONFIRMED vs chain DISPUTED) within one cycle', async () => {
    const payment = new Payment();
    payment.id = 'pay-drift-1';
    payment.shipmentId = 'ship-drift-1';
    payment.status = PaymentStatus.CONFIRMED;
    payment.amount = 100;
    payment.feeAmount = 5;
    payment.insurancePremium = 2;

    reconciliationService.addPayment(payment);

    jest.spyOn(stellarContractService, 'getEscrowBalance').mockResolvedValue({
      balance: 107,
      isDisputed: true, // Chain says disputed!
    });

    const mismatches = await reconciliationService.runReconciliationJob();

    expect(mismatches).toHaveLength(1);
    expect(mismatches[0].paymentId).toBe('pay-drift-1');
    expect(mismatches[0].reason).toContain('Disputed');
  });

  it('correctly calculates multi-party settlement fee and insurance premium routing', () => {
    const settlement = reconciliationService.calculateMultiPartySettlement(1000, true);

    expect(settlement.netCarrierAmount).toBe(1000);
    expect(settlement.feeAmount).toBe(50); // 5% fee
    expect(settlement.insurancePremium).toBe(20); // 2% premium
    expect(settlement.totalLockAmount).toBe(1070); // 1000 + 50 + 20
  });

  it('catches and records an interleaved failure when dispute resolution chain call fails mid-way', async () => {
    const payment = new Payment();
    payment.id = 'pay-dispute-fail';
    payment.shipmentId = 'ship-dispute-fail';
    payment.status = PaymentStatus.SUBMITTED;
    payment.amount = 500;

    reconciliationService.addPayment(payment);

    jest.spyOn(stellarContractService, 'submitAdminTransaction').mockRejectedValue(
      new Error('Soroban RPC Connection Timeout'),
    );

    await expect(
      reconciliationService.resolveDispute({
        paymentId: 'pay-dispute-fail',
        shipmentId: 'ship-dispute-fail',
        outcome: 'RELEASE_CARRIER',
      }),
    ).rejects.toThrow('Soroban RPC Connection Timeout');

    const mismatches = reconciliationService.getOpenMismatches();
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0].chainStatus).toBe('RESOLVE_CHAIN_FAILED');
  });
});
