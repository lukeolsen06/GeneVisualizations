import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database Configuration Service
 * 
 * NestJS Configuration Concepts:
 * - Injectable service that implements TypeOrmOptionsFactory
 * - Uses ConfigService to read environment variables
 * - Returns TypeORM configuration object
 * - Handles database connection settings
 */
@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5431),
      username: this.configService.get<string>('DB_USERNAME', 'gene_admin'),
      password: this.configService.get<string>('DB_PASSWORD', 'gene_password_2024'),
      database: this.configService.get<string>('DB_NAME', 'gene_visualizations'),
      
      // Auto-load entities from the entities directory
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      
      // Development settings
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', false), // Don't auto-sync in production
      logging: this.configService.get<boolean>('DB_LOGGING', true),
      
      // Connection pool settings
      extra: {
        max: 10, // Maximum number of connections
        min: 2,  // Minimum number of connections
        acquire: 30000, // Maximum time to get connection
        idle: 10000,    // Maximum idle time
      },
    };
  }
}
