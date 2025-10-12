/**
 * Enrichment Module
 * 
 * NestJS module that encapsulates all enrichment-related functionality.
 * Groups together the entity, service, and controller for gene enrichment data.
 * 
 * Purpose:
 *   - Register TypeORM entity for database access
 *   - Provide EnrichmentService for business logic
 *   - Expose EnrichmentController for HTTP endpoints
 *   - Make EnrichmentService available to other modules (if needed)
 * 
 * Architecture:
 *   This module follows NestJS module pattern:
 *   1. Imports - External dependencies (TypeORM, other modules)
 *   2. Controllers - HTTP request handlers
 *   3. Providers - Services for business logic
 *   4. Exports - What other modules can use
 * 
 * Usage:
 *   Import this module in app.module.ts to enable enrichment endpoints
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrichmentEntity } from './entities/enrichment.entity';
import { EnrichmentService } from './enrichment.service';
import { EnrichmentController } from './enrichment.controller';

/**
 * Enrichment Module
 * 
 * Bundles all enrichment-related components into a cohesive module.
 * 
 * Module Structure:
 *   - Entity: EnrichmentEntity (maps to enrichment_data table)
 *   - Service: EnrichmentService (business logic)
 *   - Controller: EnrichmentController (HTTP endpoints)
 * 
 * API Endpoints Provided:
 *   GET /api/enrichment              - Query enrichment data
 *   GET /api/enrichment/comparisons  - List datasets
 *   GET /api/enrichment/databases    - List databases
 *   GET /api/enrichment/stats        - Get statistics
 */
@Module({
  /**
   * Imports - External dependencies
   * 
   * TypeOrmModule.forFeature():
   * - Registers EnrichmentEntity with TypeORM
   * - Makes Repository<EnrichmentEntity> available for injection
   * - Enables database operations for the enrichment_data table
   */
  imports: [
    TypeOrmModule.forFeature([EnrichmentEntity]),
  ],

  /**
   * Controllers - HTTP request handlers
   * 
   * Controllers registered here will be instantiated by NestJS
   * and their routes will be available at runtime.
   * 
   * EnrichmentController provides:
   * - GET /api/enrichment
   * - GET /api/enrichment/comparisons
   * - GET /api/enrichment/databases
   * - GET /api/enrichment/stats
   */
  controllers: [EnrichmentController],

  /**
   * Providers - Services and other injectable classes
   * 
   * Services listed here can be injected into controllers
   * and other services within this module.
   * 
   * EnrichmentService provides:
   * - Database query methods
   * - Business logic for enrichment operations
   * - Data transformation (entity → DTO)
   */
  providers: [EnrichmentService],

  /**
   * Exports - What other modules can use
   * 
   * By exporting EnrichmentService, other modules can import
   * EnrichmentModule and inject EnrichmentService.
   * 
   * Use case:
   * - If another module needs to query enrichment data
   * - For composing services across modules
   * 
   * Note: Controllers are never exported (they only handle HTTP)
   */
  exports: [EnrichmentService],
})
export class EnrichmentModule {}

