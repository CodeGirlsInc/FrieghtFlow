import { PaymentPollerService } from './payment-poller.service';
import { StellarContractService } from './stellar-contract.service';
import { Payment } from '../entities/payment.entity';
import { PaymentStatus } from '../enums/payment-status.enum';

describe('PaymentPollerService (Issue #1277 / PAY-04)', () => {
  let pollerService: PaymentPollerService;
  let stellarContractService: StellarContractService;
  let mockPaymentsGateway: any;

  beforeEach(() => {
    stellarContractService = new StellarContractService();
    mockPaymentsGateway = {
      emitPaymentEvent: jest.fn(),
    };
    pollerService = new PaymentPollerService(
      stellarContractService,
      mockPaymentsGateway,
    );
  });

  it('automatically transitions a SUBMITTED transaction to CONFIRMED under normal conditions', async () => {
    const payment = new Payment();
    payment.id = 'pay-101';
    payment.shipmentId = 'ship-1';
    payment.status = PaymentStatus.SUBMITTED;
    payment.transactionHash = 'tx_hash_confirmed_1';
    payment.retryCount = 0;
    payment.consecutiveNotFoundCount = 0;

    stellarContractService.setMockTxStatus('tx_hash_confirmed_1', {
      status: 'CONFIRMED',
    });

    const result = await pollerService.processPaymentPoll(payment);

    expect(result.status).toBe(PaymentStatus.CONFIRMED);
    expect(mockPaymentsGateway.emitPaymentEvent).toHaveBeenCalledWith(
      'confirmed',
      expect.objectContaining({ paymentId: 'pay-101' }),
    );
  });

  it('transitions a deliberately-rejected transaction to REJECTED and does not retry', async () => {
    const payment = new Payment();
    payment.id = 'pay-102';
    payment.shipmentId = 'ship-2';
    payment.status = PaymentStatus.SUBMITTED;
    payment.transactionHash = 'tx_hash_rejected_1';
    payment.retryCount = 0;
    payment.consecutiveNotFoundCount = 0;

    stellarContractService.setMockTxStatus('tx_hash_rejected_1', {
      status: 'REJECTED',
      error: 'HostError: Contract error 101',
    });

    const result = await pollerService.processPaymentPoll(payment);

    expect(result.status).toBe(PaymentStatus.REJECTED);
    expect(result.failureReason).toContain('Contract error 101');
    expect(pollerService.getAuditLogs()).toHaveLength(1);
    expect(pollerService.getAuditLogs()[0].type).toBe('payment_rejected');
  });

  it('requires N consecutive NOT_FOUND polls before marking transaction as FAILED', async () => {
    const payment = new Payment();
    payment.id = 'pay-103';
    payment.shipmentId = 'ship-3';
    payment.status = PaymentStatus.SUBMITTED;
    payment.transactionHash = 'tx_hash_not_found';
    payment.retryCount = 0;
    payment.consecutiveNotFoundCount = 0;

    stellarContractService.setMockTxStatus('tx_hash_not_found', {
      status: 'NOT_FOUND',
    });

    // Poll 1
    await pollerService.processPaymentPoll(payment);
    expect(payment.status).toBe(PaymentStatus.CONFIRMING);
    expect(payment.consecutiveNotFoundCount).toBe(1);

    // Poll 2
    await pollerService.processPaymentPoll(payment);
    expect(payment.status).toBe(PaymentStatus.CONFIRMING);
    expect(payment.consecutiveNotFoundCount).toBe(2);

    // Poll 3 (Threshold reached)
    const finalRes = await pollerService.processPaymentPoll(payment);
    expect(finalRes.status).toBe(PaymentStatus.FAILED);
    expect(finalRes.consecutiveNotFoundCount).toBe(3);
  });

  it('transitions to TIMED_OUT when max polling attempts are exhausted', async () => {
    const payment = new Payment();
    payment.id = 'pay-104';
    payment.shipmentId = 'ship-4';
    payment.status = PaymentStatus.SUBMITTED;
    payment.transactionHash = 'tx_hash_pending_forever';
    payment.retryCount = 4;
    payment.consecutiveNotFoundCount = 0;

    stellarContractService.setMockTxStatus('tx_hash_pending_forever', {
      status: 'PENDING',
    });

    const result = await pollerService.processPaymentPoll(payment);
    expect(result.status).toBe(PaymentStatus.TIMED_OUT);
    expect(result.failureReason).toContain('Max polling attempts');
  });
});
