import { registerAs } from '@nestjs/config';

/**
 * Application Configuration
 * 
 * NestJS Config Concepts:
 * - registerAs() creates a namespaced configuration
 * - Groups related environment variables together
 * - Provides type safety and default values
 * - Makes configuration easily testable
 */
export default registerAs('app', () => ({
  // Application settings
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database settings (matches your existing PostgreSQL setup)
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5431', 10),
    username: process.env.DB_USERNAME || 'gene_admin',
    password: process.env.DB_PASSWORD || 'gene_password_2024',
    name: process.env.DB_NAME || 'gene_visualizations',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  
  // Redis settings (for caching)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  
  // Cache settings
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour
    max: parseInt(process.env.CACHE_MAX || '100', 10),
  },
  
  // STRING API settings
  stringApi: {
    baseUrl: process.env.STRING_API_BASE_URL || 'https://string-db.org/api',
    timeout: parseInt(process.env.STRING_API_TIMEOUT || '30000', 10),
  },
  
  // Rate limiting settings
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
}));
