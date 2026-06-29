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
        JWT_SECRET: Joi.string().default('secret'),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        REDIS_URL: Joi.string().default('redis://localhost:6379'),
        CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
        CLOUDINARY_API_KEY: Joi.string().optional(),
        CLOUDINARY_API_SECRET: Joi.string().optional(),
        MAILER_HOST: Joi.string().optional(),
        MAILER_PORT: Joi.number().optional(),
        MAILER_USER: Joi.string().optional(),
        MAILER_PASS: Joi.string().optional(),
        STELLAR_SECRET: Joi.string().optional(),
        STELLAR_NETWORK: Joi.string().optional(),
      }),
      validationOptions: { abortEarly: false },
    }),
  ],
})
export class EnvValidationModule {}
