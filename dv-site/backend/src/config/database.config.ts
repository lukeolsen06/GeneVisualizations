import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RnaSeqEntity } from '../modules/datasets/entities/rna-seq.entity';
import { EnrichmentEntity } from '../modules/enrichment/entities/enrichment.entity';
import { StringNetworkEntity, StringNodeEntity, StringEdgeEntity } from '../modules/string/entities';

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
    const useSsl = this.configService.get<string>('DB_SSL') === 'true' || this.configService.get<boolean>('DB_SSL', false) === true;
    const sslMode = this.configService.get<string>('DB_SSLMODE');

    const extraOptions: Record<string, unknown> = {
      max: 10, // Maximum number of connections
      min: 2,  // Minimum number of connections
      acquire: 30000, // Maximum time to get connection
      idle: 10000,    // Maximum idle time
    };

    if (sslMode) {
      extraOptions.sslmode = sslMode;
    }

    const baseOptions: TypeOrmModuleOptions = {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: Number(this.configService.get<string>('DB_PORT', '5432')),
      username: this.configService.getOrThrow<string>('DB_USERNAME'),
      password: this.configService.getOrThrow<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME', 'gene_visualizations'),
      
      // Register entities explicitly
      // This ensures TypeORM can find and load entity metadata correctly
      entities: [
        RnaSeqEntity, 
        EnrichmentEntity,
        StringNetworkEntity,
        StringNodeEntity,
        StringEdgeEntity
      ],
      
      // Development settings
      synchronize: this.configService.get<string>('DB_SYNCHRONIZE') === 'true' || this.configService.get<boolean>('DB_SYNCHRONIZE', false) === true, // Don't auto-sync in production
      logging: this.configService.get<string>('DB_LOGGING') === 'true' || this.configService.get<boolean>('DB_LOGGING', false) === true,
      
      // Connection pool settings
      extra: extraOptions,
      ...(useSsl && {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    };

    return baseOptions;
  }
}
