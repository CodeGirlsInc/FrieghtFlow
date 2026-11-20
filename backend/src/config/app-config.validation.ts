import * as Joi from 'joi';

export const appConfigValidationSchema = Joi.object({
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(6006),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),
  /**
   * How many reverse proxies sit in front of this app, so `request.ip` (and
   * therefore every IP-based rate limit) resolves to the real client rather than
   * to the proxy's address (issue #1667).
   *
   * `false` means the app is exposed directly and nothing is trusted — the safe
   * default, and correct for local development. `true` trusts the whole
   * `X-Forwarded-For` chain and is only safe when the outermost proxy *replaces*
   * that header, because a client that can set it can then spoof its own IP and
   * walk straight through the rate limits. A hop count (`1`) is the middle
   * ground for a known single-proxy deployment.
   */
  TRUST_PROXY: Joi.alternatives()
    .try(
      Joi.boolean().truthy('true').falsy('false'),
      Joi.number().integer().min(0),
    )
    .default(false),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().default(2525),
  MAIL_USER: Joi.string().required(),
  MAIL_PASS: Joi.string().required(),
  MAIL_FROM: Joi.string().default('noreply@freightflow.io'),
  UPLOAD_DIR: Joi.string().default('./uploads'),
  WEBHOOK_MAX_PER_USER: Joi.number().integer().min(1).max(100).default(10),
  SOROBAN_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
  SOROBAN_CONFIRMATION_TIMEOUT_MS: Joi.number()
    .integer()
    .min(5_000)
    .max(120_000)
    .default(60_000),
  SOROBAN_RPC_URL: Joi.string().when('SOROBAN_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  STELLAR_NETWORK_PASSPHRASE: Joi.string().when('SOROBAN_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ESCROW_CONTRACT_ADDRESS: Joi.string().when('SOROBAN_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  IDENTITY_CONTRACT_ADDRESS: Joi.string().when('SOROBAN_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DOCUMENT_CONTRACT_ADDRESS: Joi.string().when('SOROBAN_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  SHIPMENT_CONTRACT_ADDRESS: Joi.string().when('SOROBAN_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  REPUTATION_CONTRACT_ADDRESS: Joi.string().when('SOROBAN_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  TOKEN_CONTRACT_ADDRESS: Joi.string().when('SOROBAN_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  PLATFORM_ADMIN_SECRET: Joi.string().when('SOROBAN_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ALLOW_TEST_SIGNING: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
}).custom((value, helpers) => {
  if (value.JWT_SECRET && value.JWT_REFRESH_SECRET && value.JWT_SECRET === value.JWT_REFRESH_SECRET) {
    return helpers.message({
      custom: 'JWT_SECRET and JWT_REFRESH_SECRET must be different values',
    });
  }

  return value;
});
