import { CarrierCertificationExpiryScheduler } from './carrier-certification-expiry.scheduler';
import { CarrierCertificationsService } from './carrier-certifications.service';

describe('CarrierCertificationExpiryScheduler', () => {
  it('runs the expiry sweep when the module starts and on schedule', async () => {
    const certificationsService = {
      revokeExpiredCertifications: jest.fn().mockResolvedValue(2),
    } as unknown as CarrierCertificationsService;
    const scheduler = new CarrierCertificationExpiryScheduler(
      certificationsService,
    );

    await scheduler.onModuleInit();
    await scheduler.sweep();

    expect(
      certificationsService.revokeExpiredCertifications,
    ).toHaveBeenCalledTimes(2);
  });

  it('contains sweep failures so the scheduler remains alive', async () => {
    const certificationsService = {
      revokeExpiredCertifications: jest
        .fn()
        .mockRejectedValue(new Error('db down')),
    } as unknown as CarrierCertificationsService;
    const scheduler = new CarrierCertificationExpiryScheduler(
      certificationsService,
    );

    await expect(scheduler.sweep()).resolves.toBeUndefined();
  });
});
