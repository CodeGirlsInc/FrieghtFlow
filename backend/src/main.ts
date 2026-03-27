import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Start NestJS application
    const app = await NestFactory.create(AppModule);

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

    // ENABLE CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'],
      credentials: true,
    });

    // SWAGGER DOCUMENTATION
    const config = new DocumentBuilder()
      .setTitle('FreightFlow')
      .setDescription('API Documentation for FreightFlow Project')
      .setVersion('1.0')
      .setTermsOfService('terms-of-service')
      .setLicense('MIT License', 'mit')
      .addServer('http://localhost:6006')
      .addBearerAuth() // 🚀 for future auth-secured endpoints
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const port = process.env.PORT ?? 6006;
    await app.listen(port);

    logger.log(`🚀 Application running on: http://localhost:${port}`);
    logger.log(`📘 Swagger docs: http://localhost:${port}/docs`);
  } catch (error) {
    console.error('❌ Application startup error:', error);
    process.exit(1);
  }
}

bootstrap();
