import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { securityHeaders } from './common/security-headers.middleware';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Start NestJS application
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // SECURITY HEADERS
    app.use(securityHeaders);

    // CONSISTENT ERROR RESPONSES
    app.useGlobalFilters(new AllExceptionsFilter());

    // GLOBAL PREFIX (optional, keeps API versioned/clean)
    app.setGlobalPrefix('api/v1');

    // TRUST PROXY (issue #1667)
    //
    // Without this, `request.ip` is the address of the nearest proxy for every
    // single client behind it, so the default and `auth` throttlers — and the IP
    // fallback in `shipmentCreateTracker` — all key on one shared bucket. Either
    // every user locks everyone else out together, or the limit stops meaning
    // anything.
    //
    // Only set when TRUST_PROXY is configured: leaving it unset is the safe
    // default, because `trust proxy: true` also lets a client spoof
    // `X-Forwarded-For` and bypass the very limits this fixes.
    const rawTrustProxy = configService.get<string | number | boolean>(
      'TRUST_PROXY',
      false,
    );
    // Normalised explicitly rather than via Number(), because `Number(true)` is
    // 1 — and Express reads `1` as "trust one hop", which is not the same
    // setting as `true`.
    const trustProxy: boolean | number | string =
      typeof rawTrustProxy === 'boolean'
        ? rawTrustProxy
        : rawTrustProxy === 'true'
          ? true
          : rawTrustProxy === 'false' || rawTrustProxy === '0'
            ? false
            : Number.isNaN(Number(rawTrustProxy))
              ? rawTrustProxy
              : Number(rawTrustProxy);

    if (trustProxy) {
      app.set('trust proxy', trustProxy);
      logger.log(`🔀 trust proxy enabled (${String(trustProxy)})`);
    }

    // GLOBAL VALIDATION PIPES
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const frontendOrigins = configService
      .get<string>('FRONTEND_URL', 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    // ENABLE CORS
    app.enableCors({
      origin: frontendOrigins,
      credentials: true,
    });

    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    // SWAGGER DOCUMENTATION
    if (nodeEnv !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('FreightFlow')
        .setDescription('API Documentation for FreightFlow Project')
        .setVersion('1.0')
        .setTermsOfService('terms-of-service')
        .setLicense('MIT License', 'mit')
        .addServer(`http://localhost:${configService.get<number>('PORT', 6006)}`)
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document);
      logger.log(`📘 Swagger docs: http://localhost:${configService.get<number>('PORT', 6006)}/docs`);
    }

    const port = configService.get<number>('PORT', 6006);
    await app.listen(port);

    logger.log(`🚀 Application running on: http://localhost:${port}`);
  } catch (error) {
    console.error('❌ Application startup error:', error);
    process.exit(1);
  }
}

void bootstrap();
