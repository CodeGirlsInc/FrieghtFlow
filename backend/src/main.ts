import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';

async function bootstrap() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connected successfully!');

    // Start NestJS application
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1); 
  }
}

bootstrap();
