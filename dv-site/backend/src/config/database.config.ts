import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RnaSeqEntity } from '../modules/datasets/entities/rna-seq.entity';
import { EnrichmentEntity } from '../modules/enrichment/entities/enrichment.entity';

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
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.getOrThrow<string>('DB_USERNAME'),
      password: this.configService.getOrThrow<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      
      // Register entities explicitly
      // This ensures TypeORM can find and load entity metadata correctly
      entities: [RnaSeqEntity, EnrichmentEntity],
      
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
