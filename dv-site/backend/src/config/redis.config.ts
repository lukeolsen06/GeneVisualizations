import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheOptionsFactory, CacheModuleOptions } from '@nestjs/cache-manager';

/**
 * Redis Cache Configuration Service
 * 
 * NestJS Caching Concepts:
 * - Injectable service that implements CacheOptionsFactory
 * - Configures Redis as the cache store
 * - Sets up cache TTL and connection settings
 * - Enables caching of STRING API responses and database queries
 */
@Injectable()
export class RedisConfig implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    // For now, we'll use in-memory caching until Redis is set up
    // This will be updated when we implement the caching layer
    return {
      ttl: this.configService.get<number>('CACHE_TTL', 3600), // 1 hour default
      max: this.configService.get<number>('CACHE_MAX', 1000), // Maximum number of items
    };
  }
}
