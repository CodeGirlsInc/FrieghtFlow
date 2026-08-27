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
  PORT: Joi.number().default(6000),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),
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
  SOROBAN_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
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
});
