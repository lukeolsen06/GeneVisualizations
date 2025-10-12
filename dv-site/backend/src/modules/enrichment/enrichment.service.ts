/**
 * Enrichment Service
 * 
 * Business logic layer for enrichment data operations.
 * Handles database queries, filtering, and data transformation.
 * 
 * Purpose:
 *   - Query enrichment data from PostgreSQL
 *   - Apply filters (comparison, database, FDR threshold)
 *   - Transform database entities to DTOs
 *   - Provide metadata endpoints (available comparisons, stats)
 * 
 * Architecture:
 *   Controller → Service → Database (via TypeORM Repository)
 *   
 * Usage:
 *   Injected into EnrichmentController to handle API requests
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrichmentEntity } from './entities/enrichment.entity';
import {
  GetEnrichmentDto,
  EnrichmentResponseDto,
  AvailableComparisonsDto,
  AvailableDatabasesDto,
  EnrichmentStatsDto,
} from './dto/enrichment.dto';

/**
 * Enrichment Service Class
 * 
 * Provides methods for querying and managing enrichment data.
 * Uses TypeORM repository pattern for database operations.
 */
@Injectable()
export class EnrichmentService {
  private readonly logger = new Logger(EnrichmentService.name);

  constructor(
    @InjectRepository(EnrichmentEntity)
    private enrichmentRepository: Repository<EnrichmentEntity>,
  ) {}

  /**
   * Get enrichment data with optional filtering
   * 
   * Main method for retrieving enrichment pathways based on query parameters.
   * Supports filtering by comparison, database, FDR threshold, and sorting.
   * 
   * Query Examples:
   *   - Get all KEGG pathways for eIF5A_DDvsWT_EC
   *   - Get significant pathways (FDR < 0.05) for any dataset
   *   - Get top 20 most enriched pathways across all databases
   * 
   * @param query - Query parameters (comparison, database, limit, etc.)
   * @returns Array of enrichment pathway records
   */
  async getEnrichmentData(
    query: GetEnrichmentDto,
  ): Promise<EnrichmentResponseDto[]> {
    try {
      // Build the query using TypeORM Query Builder
      const queryBuilder = this.enrichmentRepository
        .createQueryBuilder('enrichment')
        .select([
          'enrichment.comparison',
          'enrichment.database',
          'enrichment.termId',
          'enrichment.termDescription',
          'enrichment.genesMapped',
          'enrichment.enrichmentScore',
          'enrichment.direction',
          'enrichment.falseDiscoveryRate',
          'enrichment.method',
          'enrichment.matchingProteinIds',
          'enrichment.matchingProteinLabels',
        ]);

      // Apply filters based on query parameters

      // Filter by comparison (e.g., 'eIF5A_DDvsWT_EC')
      if (query.comparison) {
        queryBuilder.andWhere('enrichment.comparison = :comparison', {
          comparison: query.comparison,
        });
      }

      // Filter by database (e.g., 'KEGG', 'Reactome', 'WikiPathways')
      if (query.database) {
        queryBuilder.andWhere('enrichment.database = :database', {
          database: query.database,
        });
      }

      // Filter by FDR threshold (e.g., <= 0.05 for significant pathways)
      if (query.fdr_threshold !== undefined) {
        queryBuilder.andWhere(
          'enrichment.falseDiscoveryRate <= :fdrThreshold',
          { fdrThreshold: query.fdr_threshold },
        );
      }

      // Apply sorting
      const sortBy = query.sort_by || 'fdr';
      const sortOrder = (query.sort_order || 'ASC').toUpperCase() as 'ASC' | 'DESC';

      // Map sort field names to database columns
      const sortFieldMap: Record<string, string> = {
        fdr: 'enrichment.falseDiscoveryRate',
        enrichment_score: 'enrichment.enrichmentScore',
        genes_mapped: 'enrichment.genesMapped',
      };

      const sortField = sortFieldMap[sortBy] || sortFieldMap.fdr;
      queryBuilder.orderBy(sortField, sortOrder);

      // Apply limit (default: 100, max: 500)
      const limit = query.limit || 100;
      queryBuilder.limit(limit);

      // Execute query
      const results = await queryBuilder.getMany();

      // Transform entities to DTOs (exclude internal fields like id, timestamps)
      return results.map((entity) => this.transformToDto(entity));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching enrichment data: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get list of available dataset comparisons
   * 
   * Returns unique comparison names that have enrichment data.
   * Useful for populating dropdown menus in the frontend.
   * 
   * Example response:
   *   ['eIF5A_DDvsWT_EC', 'DHS_DOHHvsTar4_EC', 'K50A_DDvsWT_EC', ...]
   * 
   * @returns List of unique comparison names
   */
  async getAvailableComparisons(): Promise<AvailableComparisonsDto> {
    try {
      const results = await this.enrichmentRepository
        .createQueryBuilder('enrichment')
        .select('DISTINCT enrichment.comparison', 'comparison')
        .orderBy('enrichment.comparison', 'ASC')
        .getRawMany();

      const comparisons = results.map((row) => row.comparison);

      return { comparisons };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching available comparisons: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get list of available enrichment databases
   * 
   * Returns the databases that have enrichment data.
   * Should return: ['KEGG', 'Reactome', 'WikiPathways']
   * 
   * @returns List of database names
   */
  async getAvailableDatabases(): Promise<AvailableDatabasesDto> {
    try {
      const results = await this.enrichmentRepository
        .createQueryBuilder('enrichment')
        .select('enrichment.database')
        .distinct(true)
        .orderBy('enrichment.database', 'ASC')
        .getRawMany();

      const databases = results.map((row) => row.enrichment_database);

      return { databases };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching available databases: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get enrichment statistics
   * 
   * Provides summary statistics about the enrichment data:
   * - Total number of records
   * - Number of unique comparisons
   * - Records by database (KEGG, Reactome, WikiPathways)
   * - Records by comparison
   * 
   * Useful for:
   * - Admin dashboards
   * - Data quality checks
   * - User information displays
   * 
   * @returns Summary statistics
   */
  async getEnrichmentStats(): Promise<EnrichmentStatsDto> {
    try {
      // Get total record count
      const totalRecords = await this.enrichmentRepository.count();

      // Get unique comparison count
      const uniqueComparisonsResult = await this.enrichmentRepository
        .createQueryBuilder('enrichment')
        .select('COUNT(DISTINCT enrichment.comparison)', 'count')
        .getRawOne();
      const uniqueComparisons = parseInt(uniqueComparisonsResult.count, 10);

      // Get record counts by database
      const byDatabaseResults = await this.enrichmentRepository
        .createQueryBuilder('enrichment')
        .select('enrichment.database', 'database')
        .addSelect('COUNT(*)', 'count')
        .groupBy('enrichment.database')
        .orderBy('enrichment.database', 'ASC')
        .getRawMany();

      const recordsByDatabase: Record<string, number> = {};
      byDatabaseResults.forEach((row) => {
        recordsByDatabase[row.database] = parseInt(row.count, 10);
      });

      // Get record counts by comparison
      const byComparisonResults = await this.enrichmentRepository
        .createQueryBuilder('enrichment')
        .select('enrichment.comparison', 'comparison')
        .addSelect('COUNT(*)', 'count')
        .groupBy('enrichment.comparison')
        .orderBy('enrichment.comparison', 'ASC')
        .getRawMany();

      const recordsByComparison: Record<string, number> = {};
      byComparisonResults.forEach((row) => {
        recordsByComparison[row.comparison] = parseInt(row.count, 10);
      });

      return {
        totalRecords,
        uniqueComparisons,
        recordsByDatabase,
        recordsByComparison,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching enrichment stats: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Transform EnrichmentEntity to EnrichmentResponseDto
   * 
   * Converts database entity to DTO for API responses.
   * Excludes internal fields (id, timestamps) that clients don't need.
   * 
   * @param entity - Database entity
   * @returns DTO for API response
   */
  private transformToDto(entity: EnrichmentEntity): EnrichmentResponseDto {
    return {
      comparison: entity.comparison,
      database: entity.database,
      termId: entity.termId,
      termDescription: entity.termDescription,
      genesMapped: entity.genesMapped,
      enrichmentScore: entity.enrichmentScore,
      direction: entity.direction || null,
      falseDiscoveryRate: entity.falseDiscoveryRate,
      method: entity.method || null,
      matchingProteinIds: entity.matchingProteinIds || null,
      matchingProteinLabels: entity.matchingProteinLabels || null,
    };
  }
}

