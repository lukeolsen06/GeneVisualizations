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
    console.log('DB host/port', process.env.DB_HOST, process.env.DB_PORT);
    const useSsl = this.configService.get<string>('DB_SSL') === 'true' || this.configService.get<boolean>('DB_SSL', false) === true;
    const sslMode = this.configService.get<string>('DB_SSLMODE');

    // Supabase connection pooler requires specific settings
    const extraOptions: Record<string, unknown> = {
      max: 5, // Reduced for Supabase free tier limits
      min: 1, // Minimum connections
      acquire: 60000, // Increased timeout for Supabase (60 seconds)
      idle: 20000, // Idle timeout (20 seconds)
      evict: 1000, // Check for idle connections every second
      // Connection timeout settings for Supabase pooler
      connectionTimeoutMillis: 10000, // 10 seconds to establish connection
      statement_timeout: 30000, // 30 seconds for queries
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
      
      // Connection pool settings optimized for Supabase
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
