
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().required(),
        STELLAR_SECRET_KEY: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(6000),
        FRONTEND_URL: Joi.string().default('http://localhost:3000'),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().default(2525),
        MAIL_USER: Joi.string().required(),
        MAIL_PASS: Joi.string().required(),
        MAIL_FROM: Joi.string().default('noreply@freightflow.io'),
        UPLOAD_DIR: Joi.string().default('./uploads'),
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class EnvValidationModule {}