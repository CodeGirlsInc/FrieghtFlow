import { appConfigValidationSchema } from './config/app-config.validation';

describe('appConfigValidationSchema', () => {
  const validEnvironment = {
    DATABASE_HOST: 'localhost',
    DATABASE_NAME: 'freightflow',
    DATABASE_USERNAME: 'postgres',
    DATABASE_PASSWORD: 'postgres',
    JWT_SECRET: 'x'.repeat(32),
    JWT_REFRESH_SECRET: 'y'.repeat(32),
    MAIL_HOST: 'localhost',
    MAIL_USER: 'user',
    MAIL_PASS: 'pass',
  };

  it('rejects an invalid environment when Soroban is enabled', () => {
    const result = appConfigValidationSchema.validate({
      ...validEnvironment,
      SOROBAN_ENABLED: true,
    });

    expect(result.error).toBeDefined();
  });

  it('accepts a complete valid environment', () => {
    const result = appConfigValidationSchema.validate(validEnvironment);

    expect(result.error).toBeUndefined();
  });

  it('rejects duplicate JWT secrets', () => {
    const result = appConfigValidationSchema.validate({
      ...validEnvironment,
      JWT_SECRET: 'duplicate-secret-1234567890',
      JWT_REFRESH_SECRET: 'duplicate-secret-1234567890',
    });

    expect(result.error).toBeDefined();
  });

  it('rejects unknown environment variables', () => {
    const result = appConfigValidationSchema.validate({
      ...validEnvironment,
      DATABSE_HOST: 'localhost',
    });

    expect(result.error).toBeDefined();
  });

  it('defaults and validates the per-user webhook limit', () => {
    const defaultResult = appConfigValidationSchema.validate(validEnvironment);
    expect(defaultResult.error).toBeUndefined();
    expect(
      (defaultResult.value as Record<string, unknown>).WEBHOOK_MAX_PER_USER,
    ).toBe(10);

    expect(
      appConfigValidationSchema.validate({
        ...validEnvironment,
        WEBHOOK_MAX_PER_USER: 3,
      }).error,
    ).toBeUndefined();
    expect(
      appConfigValidationSchema.validate({
        ...validEnvironment,
        WEBHOOK_MAX_PER_USER: 0,
      }).error,
    ).toBeDefined();
    expect(
      appConfigValidationSchema.validate({
        ...validEnvironment,
        WEBHOOK_MAX_PER_USER: 101,
      }).error,
    ).toBeDefined();
  });
});
