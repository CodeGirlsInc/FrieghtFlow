import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      rawBody: true,
    });

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.enableCors({
      origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'],
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle('FreightFlow')
      .setDescription('API Documentation for FreightFlow Project')
      .setVersion('1.0')
      .setTermsOfService('terms-of-service')
      .setLicense('MIT License', 'mit')
      .addServer('http://localhost:6006')
      .addBearerAuth()
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

void bootstrap();
