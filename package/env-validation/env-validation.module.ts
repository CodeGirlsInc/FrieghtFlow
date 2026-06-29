import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_HOST: Joi.string().default('localhost'),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USERNAME: Joi.string().default('postgres'),
        DATABASE_PASSWORD: Joi.string().default('postgres'),
        DATABASE_NAME: Joi.string().default('freightflow'),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        REDIS_URL: Joi.string().default('redis://localhost:6379'),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().optional().allow(''),
        FRONTEND_URL: Joi.string().default('http://localhost:3000'),
        CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
        CLOUDINARY_API_KEY: Joi.string().optional(),
        CLOUDINARY_API_SECRET: Joi.string().optional(),
        MAILER_HOST: Joi.string().optional(),
        MAILER_PORT: Joi.number().optional(),
        MAILER_USER: Joi.string().optional(),
        MAILER_PASS: Joi.string().optional(),
        TWILIO_ACCOUNT_SID: Joi.string().optional(),
        TWILIO_AUTH_TOKEN: Joi.string().optional(),
        TWILIO_PHONE_NUMBER: Joi.string().optional(),
        WEB_PUSH_PUBLIC_KEY: Joi.string().optional(),
        WEB_PUSH_PRIVATE_KEY: Joi.string().optional(),
        WEB_PUSH_EMAIL: Joi.string().optional(),
        STELLAR_SECRET: Joi.string().optional(),
        STELLAR_NETWORK: Joi.string().optional(),
        STELLAR_SHIPMENT_CONTRACT: Joi.string().optional(),
        STELLAR_ESCROW_CONTRACT: Joi.string().optional(),
        STELLAR_DOCUMENT_CONTRACT: Joi.string().optional(),
        STELLAR_REPUTATION_CONTRACT: Joi.string().optional(),
        STELLAR_IDENTITY_CONTRACT: Joi.string().optional(),
        PLATFORM_FEE_PERCENT: Joi.number().default(2.5),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
})
export class EnvValidationModule {}
