import { appConfigValidationSchema } from './config/app-config.validation';

describe('appConfigValidationSchema', () => {
  it('rejects an invalid environment when Soroban is enabled', () => {
    const result = appConfigValidationSchema.validate({
      SOROBAN_ENABLED: true,
      DATABASE_HOST: 'localhost',
      DATABASE_NAME: 'freightflow',
      DATABASE_USERNAME: 'postgres',
      DATABASE_PASSWORD: 'postgres',
      JWT_SECRET: 'x'.repeat(32),
      JWT_REFRESH_SECRET: 'y'.repeat(32),
      MAIL_HOST: 'localhost',
      MAIL_USER: 'user',
      MAIL_PASS: 'pass',
    });

    expect(result.error).toBeDefined();
  });

  it('accepts a complete valid environment', () => {
    const result = appConfigValidationSchema.validate({
      DATABASE_HOST: 'localhost',
      DATABASE_NAME: 'freightflow',
      DATABASE_USERNAME: 'postgres',
      DATABASE_PASSWORD: 'postgres',
      JWT_SECRET: 'x'.repeat(32),
      JWT_REFRESH_SECRET: 'y'.repeat(32),
      MAIL_HOST: 'localhost',
      MAIL_USER: 'user',
      MAIL_PASS: 'pass',
    });

    expect(result.error).toBeUndefined();
  });
});
