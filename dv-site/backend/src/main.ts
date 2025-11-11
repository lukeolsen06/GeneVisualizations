import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application
 * 
 * Key NestJS Concepts:
 * - NestFactory.create() creates the application instance
 * - ValidationPipe automatically validates incoming requests
 * - SwaggerModule creates API documentation
 * - Global pipes and configurations are applied here
 */
async function bootstrap() {
  // Create the NestJS application
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  const corsOriginEnv = process.env.FRONTEND_ORIGIN;
  const corsOrigins = corsOriginEnv
    ? corsOriginEnv.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
      ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global validation pipe - automatically validates DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error for unknown properties
      transform: true,        // Transform payloads to DTO instances
    }),
  );

  // API prefix - all routes will be prefixed with /api
  app.setGlobalPrefix('api');

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Gene Visualizations API')
    .setDescription('Backend API for Gene Visualizations application')
    .setVersion('1.0')
    .addTag('datasets', 'RNA-seq dataset management')
    .addTag('analysis', 'Gene analysis and enrichment')
    .addTag('users', 'User management')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  console.log(process.env.DB_HOST, process.env.DB_PORT)
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
