import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { 
  StringNetworkEntity, 
  StringNodeEntity, 
  StringEdgeEntity 
} from './entities';

// Services
import { StringService } from './services';

// Controllers
import { StringController } from './controllers';

/**
 * STRING Module
 * 
 * This module provides comprehensive STRING database integration for protein-protein
 * interaction networks. It includes network creation, caching, querying, and
 * identifier resolution capabilities.
 * 
 * Features:
 * - Network creation and management
 * - Intelligent caching to avoid duplicate API calls
 * - Advanced querying and filtering
 * - Gene identifier resolution
 * - Comprehensive error handling and logging
 * - Auto-generated API documentation
 */
@Module({
  imports: [
    // Import TypeORM entities for database integration
    TypeOrmModule.forFeature([
      StringNetworkEntity,
      StringNodeEntity,
      StringEdgeEntity
    ]),
    
    // Import ConfigModule for environment variables
    ConfigModule
  ],
  
  // Register services for dependency injection
  providers: [
    StringService
  ],
  
  // Register controllers for HTTP endpoints
  controllers: [
    StringController
  ],
  
  // Export services for use in other modules
  exports: [
    StringService,
    TypeOrmModule
  ]
})
export class StringModule {}
