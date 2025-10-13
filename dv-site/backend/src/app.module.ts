import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

// Import feature modules (we'll create these next)
import { DatasetsModule } from './modules/datasets/datasets.module';
import { EnrichmentModule } from './modules/enrichment/enrichment.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { UsersModule } from './modules/users/users.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { StringModule } from './modules/string/string.module';

// Import configuration
import { DatabaseConfig } from './config/database.config';
import { RedisConfig } from './config/redis.config';
import appConfig from './config/app.config';

/**
 * Root Application Module
 * 
 * NestJS Module Concepts:
 * - @Module() decorator defines a module
 * - imports: Other modules this module depends on
 * - providers: Services available for dependency injection
 * - controllers: Controllers that handle HTTP requests
 * - exports: Services that other modules can import
 */
@Module({
  imports: [
    // Configuration module - loads environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available everywhere
      envFilePath: ['.env.local', '.env'], // Loads .env files in order
      ignoreEnvFile: false, // Don't ignore .env files
      load: [appConfig], // Load our custom configuration
    }),

    // Database module - TypeORM configuration
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
      // Note: Individual entities are also registered in their respective modules
      // via TypeOrmModule.forFeature([Entity])
    }),

    // Cache module - Redis configuration for caching (temporarily disabled for testing)
    // CacheModule.registerAsync({
    //   useClass: RedisConfig,
    //   isGlobal: true, // Makes cache available everywhere
    // }),

    // Feature modules (we'll create these step by step)
    DatasetsModule,
    EnrichmentModule,
    AnalysisModule,
    UsersModule,
    SessionsModule,
    StringModule,
  ],
})
export class AppModule {}
