/**
 * Enrichment Controller
 * 
 * HTTP request handler for enrichment data endpoints.
 * Defines API routes and delegates business logic to EnrichmentService.
 * 
 * Purpose:
 *   - Define RESTful API endpoints for enrichment data
 *   - Validate incoming requests using DTOs
 *   - Handle HTTP responses and status codes
 *   - Generate Swagger/OpenAPI documentation
 * 
 * Architecture:
 *   Client → Controller → Service → Database
 *   
 * Base Route: /api/enrichment
 * 
 * Available Endpoints:
 *   GET  /api/enrichment                  - Get enrichment data with filters
 *   GET  /api/enrichment/comparisons      - Get list of available datasets
 *   GET  /api/enrichment/databases        - Get list of available databases
 *   GET  /api/enrichment/stats            - Get enrichment statistics
 */

import { Controller, Get, Query, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EnrichmentService } from './enrichment.service';
import {
  GetEnrichmentDto,
  EnrichmentResponseDto,
  AvailableComparisonsDto,
  AvailableDatabasesDto,
  EnrichmentStatsDto,
} from './dto/enrichment.dto';

/**
 * Enrichment Controller Class
 * 
 * Handles all HTTP requests related to gene enrichment data.
 * Routes are automatically prefixed with /api/enrichment
 */
@ApiTags('enrichment')
@Controller('enrichment')
export class EnrichmentController {
  private readonly logger = new Logger(EnrichmentController.name);

  constructor(private readonly enrichmentService: EnrichmentService) {}

  /**
   * GET /api/enrichment
   * 
   * Get enrichment data with optional filtering.
   * 
   * Query Parameters:
   *   - comparison: Filter by dataset (e.g., 'eIF5A_DDvsWT_EC')
   *   - database: Filter by source database ('KEGG', 'Reactome', 'WikiPathways')
   *   - fdr_threshold: Maximum FDR value (e.g., 0.05 for significant pathways)
   *   - sort_by: Field to sort by ('fdr', 'enrichment_score', 'genes_mapped')
   *   - sort_order: Sort order ('ASC', 'DESC')
   *   - limit: Maximum results (1-500, default 100)
   * 
   * Example Requests:
   *   GET /api/enrichment?comparison=eIF5A_DDvsWT_EC&database=KEGG
   *   GET /api/enrichment?fdr_threshold=0.05&limit=20
   *   GET /api/enrichment?comparison=DHS_DOHHvsTar4_EC&sort_by=enrichment_score&sort_order=DESC
   * 
   * @param query - Query parameters (validated by GetEnrichmentDto)
   * @returns Array of enrichment pathway records
   */
  @Get()
  @ApiOperation({
    summary: 'Get enrichment data',
    description: `
      Retrieve gene enrichment analysis results with optional filtering.
      
      Use this endpoint to:
      - Get all pathways for a specific dataset comparison
      - Filter by enrichment database (KEGG, Reactome, WikiPathways)
      - Find significant pathways using FDR threshold
      - Sort results by enrichment score or FDR
      
      The data comes from gene set enrichment analysis (GSEA) performed on
      RNA-seq differential expression data.
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved enrichment data',
    type: [EnrichmentResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  @ApiQuery({
    name: 'comparison',
    required: false,
    description: 'Dataset comparison name to filter by',
    example: 'eIF5A_DDvsWT_EC',
  })
  @ApiQuery({
    name: 'database',
    required: false,
    description: 'Enrichment database to filter by',
    enum: ['KEGG', 'Reactome', 'WikiPathways'],
  })
  @ApiQuery({
    name: 'fdr_threshold',
    required: false,
    description: 'Maximum false discovery rate threshold',
    example: 0.05,
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    description: 'Field to sort results by',
    enum: ['fdr', 'enrichment_score', 'genes_mapped'],
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results',
    example: 100,
  })
  async getEnrichmentData(
    @Query() query: GetEnrichmentDto,
  ): Promise<EnrichmentResponseDto[]> {
    this.logger.log(
      `GET /enrichment - Query: ${JSON.stringify(query)}`,
    );
    return this.enrichmentService.getEnrichmentData(query);
  }

  /**
   * GET /api/enrichment/comparisons
   * 
   * Get list of available dataset comparisons.
   * 
   * Returns all unique comparison names that have enrichment data.
   * Useful for populating dropdown menus in the frontend.
   * 
   * Example Response:
   *   {
   *     "comparisons": [
   *       "DHS_DOHHvsTar4_EC",
   *       "DHS_DOHHvsWT_EC",
   *       "eIF5A_DDvsWT_EC",
   *       ...
   *     ]
   *   }
   * 
   * @returns List of comparison names
   */
  @Get('comparisons')
  @ApiOperation({
    summary: 'Get available dataset comparisons',
    description: `
      Returns a list of all dataset comparisons that have enrichment data.
      
      Use this endpoint to:
      - Populate dropdown menus in the UI
      - Validate comparison names before querying
      - Show users what data is available
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved comparison list',
    type: AvailableComparisonsDto,
  })
  async getAvailableComparisons(): Promise<AvailableComparisonsDto> {
    this.logger.log('GET /enrichment/comparisons');
    return this.enrichmentService.getAvailableComparisons();
  }

  /**
   * GET /api/enrichment/databases
   * 
   * Get list of available enrichment databases.
   * 
   * Returns the source databases that have enrichment data.
   * Should return: ['KEGG', 'Reactome', 'WikiPathways']
   * 
   * Example Response:
   *   {
   *     "databases": ["KEGG", "Reactome", "WikiPathways"]
   *   }
   * 
   * @returns List of database names
   */
  @Get('databases')
  @ApiOperation({
    summary: 'Get available enrichment databases',
    description: `
      Returns a list of enrichment databases with available data.
      
      Use this endpoint to:
      - Show users which databases can be queried
      - Populate database filter options
      - Validate database names
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved database list',
    type: AvailableDatabasesDto,
  })
  async getAvailableDatabases(): Promise<AvailableDatabasesDto> {
    this.logger.log('GET /enrichment/databases');
    return this.enrichmentService.getAvailableDatabases();
  }

  /**
   * GET /api/enrichment/stats
   * 
   * Get enrichment data statistics.
   * 
   * Returns summary information about the enrichment data:
   * - Total number of enrichment records
   * - Number of unique comparisons
   * - Record counts by database (KEGG, Reactome, WikiPathways)
   * - Record counts by comparison
   * 
   * Example Response:
   *   {
   *     "totalRecords": 704,
   *     "uniqueComparisons": 13,
   *     "recordsByDatabase": {
   *       "KEGG": 243,
   *       "Reactome": 400,
   *       "WikiPathways": 61
   *     },
   *     "recordsByComparison": {
   *       "eIF5A_DDvsWT_EC": 56,
   *       "DHS_DOHHvsTar4_EC": 79,
   *       ...
   *     }
   *   }
   * 
   * @returns Statistics about enrichment data
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get enrichment data statistics',
    description: `
      Returns summary statistics about the enrichment data.
      
      Use this endpoint to:
      - Display data availability information
      - Create admin dashboards
      - Monitor data quality
      - Show users data coverage
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved enrichment statistics',
    type: EnrichmentStatsDto,
  })
  async getEnrichmentStats(): Promise<EnrichmentStatsDto> {
    this.logger.log('GET /enrichment/stats');
    return this.enrichmentService.getEnrichmentStats();
  }
}

