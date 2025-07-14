import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    // Start NestJS application
    const app = await NestFactory.create(AppModule);

    //GLOBAL VALIDATION PIPES
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // ENABLE CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    });

    // SWAGGER DOCUMENTATION
    const config = new DocumentBuilder()
      .setTitle('FreightFlow')
      .setDescription('Swagger API Docs for FreightFlow Project')
      .setTermsOfService('terms-of-service')
      .setLicense('MIT License', 'mit')
      .addServer('http://localhost:6000')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT ?? 6000);

    console.log(
      `Application is running on: http://localhost:${process.env.PORT ?? 6000}`,
    );
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

bootstrap();
