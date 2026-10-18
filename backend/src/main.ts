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
