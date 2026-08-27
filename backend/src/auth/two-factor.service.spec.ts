import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';

describe('TwoFactorService', () => {
  let service: TwoFactorService;

  beforeEach(() => {
    service = new TwoFactorService();
  });

  it('generates, verifies, and then rejects reused OTPs', () => {
    const code = service.generateOtp('user-1');
    expect(code).toHaveLength(6);

    service.verifyOtp('user-1', code);

    expect(() => service.verifyOtp('user-1', code)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects invalid OTPs', () => {
    service.generateOtp('user-1');

    expect(() => service.verifyOtp('user-1', '000000')).toThrow(
      BadRequestException,
    );
  });

  it('tracks enable and disable state', () => {
    expect(service.isEnabled('user-1')).toBe(false);
    service.enable('user-1');
    expect(service.isEnabled('user-1')).toBe(true);
    service.disable('user-1');
    expect(service.isEnabled('user-1')).toBe(false);
  });
});
