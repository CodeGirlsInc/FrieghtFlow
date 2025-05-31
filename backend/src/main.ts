import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    // Attach dummy user for example; in real life, pull from auth token
    req.user = { id: 'user-123', email: 'user@example.com' };
    next();
  }
}

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
      .setTitle('Nestjs Blog App Api Tutorial')
      .setDescription(
        'rhfbejberhberjhkfberjhfberjhbgerhbgrjgbrhge rjlvge rvjhrebgerjh vherervherberhvkefgeufyegoeuhuhfuhrufho3uihf3u4',
      )
      .setTermsOfService('terms-of-service')
      .setLicense('MIT License', 'mit')
      .addServer('http://localhost:3000')
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
