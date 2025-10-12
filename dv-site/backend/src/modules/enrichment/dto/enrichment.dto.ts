/**
 * Enrichment DTOs (Data Transfer Objects)
 * 
 * DTOs define the structure of data coming into and going out of the API.
 * They provide:
 * - Request validation (using class-validator decorators)
 * - Type safety for API parameters
 * - Swagger documentation
 * - Response structure definition
 * 
 * Purpose:
 *   - Validate query parameters for enrichment endpoints
 *   - Define response shape for API consumers
 *   - Generate OpenAPI/Swagger documentation
 * 
 * Usage:
 *   - Used in controller methods to validate incoming requests
 *   - Used to shape response data before sending to client
 */

import { IsString, IsOptional, IsInt, Min, Max, IsIn, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for querying enrichment data
 * 
 * Used in GET /api/enrichment endpoints
 * 
 * Example usage:
 *   GET /api/enrichment?comparison=eIF5A_DDvsWT_EC&database=KEGG&limit=20&fdr_threshold=0.05
 */
export class GetEnrichmentDto {
  /**
   * Dataset comparison name
   * 
   * Example: 'eIF5A_DDvsWT_EC', 'DHS_DOHHvsTar4_EC'
   * Optional: If omitted, returns enrichment data for all comparisons
   */
  @ApiPropertyOptional({
    description: 'Dataset comparison name to filter by',
    example: 'eIF5A_DDvsWT_EC',
    type: String,
  })
  @IsOptional()
  @IsString()
  comparison?: string;

  /**
   * Source database name
   * 
   * Values: 'KEGG', 'Reactome', 'WikiPathways'
   * Optional: If omitted, returns data from all databases
   */
  @ApiPropertyOptional({
    description: 'Enrichment database to filter by',
    example: 'KEGG',
    enum: ['KEGG', 'Reactome', 'WikiPathways'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['KEGG', 'Reactome', 'WikiPathways'], {
    message: 'database must be one of: KEGG, Reactome, WikiPathways',
  })
  database?: string;

  /**
   * Maximum number of results to return
   * 
   * Range: 1 to 500
   * Default: 100 (handled in service layer)
   */
  @ApiPropertyOptional({
    description: 'Maximum number of enrichment records to return',
    example: 20,
    minimum: 1,
    maximum: 500,
    default: 100,
  })
  @IsOptional()
  @Type(() => Number)  // Transform string query param to number
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;

  /**
   * False Discovery Rate (FDR) threshold
   * 
   * Range: 0.0 to 1.0
   * Default: 1.0 (no filtering - handled in service layer)
   * 
   * Only returns pathways with FDR <= threshold
   * Common thresholds: 0.05 (5%), 0.01 (1%)
   */
  @ApiPropertyOptional({
    description: 'Maximum false discovery rate (FDR) threshold for filtering significant pathways',
    example: 0.05,
    minimum: 0,
    maximum: 1,
    default: 1.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  fdr_threshold?: number;

  /**
   * Sort field
   * 
   * Options: 'fdr', 'enrichment_score', 'genes_mapped'
   * Default: 'fdr' (handled in service layer)
   */
  @ApiPropertyOptional({
    description: 'Field to sort results by',
    example: 'fdr',
    enum: ['fdr', 'enrichment_score', 'genes_mapped'],
    default: 'fdr',
  })
  @IsOptional()
  @IsString()
  @IsIn(['fdr', 'enrichment_score', 'genes_mapped'], {
    message: 'sort_by must be one of: fdr, enrichment_score, genes_mapped',
  })
  sort_by?: string;

  /**
   * Sort order
   * 
   * Options: 'ASC', 'DESC'
   * Default: 'ASC' (handled in service layer)
   */
  @ApiPropertyOptional({
    description: 'Sort order (ascending or descending)',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'], {
    message: 'sort_order must be one of: ASC, DESC',
  })
  sort_order?: string;
}

/**
 * DTO for enrichment response data
 * 
 * Defines the structure of enrichment data returned by the API.
 * This is a simplified version of EnrichmentEntity, excluding timestamps
 * and internal IDs that clients don't need.
 * 
 * Example response:
 *   {
 *     "comparison": "eIF5A_DDvsWT_EC",
 *     "database": "KEGG",
 *     "termId": "mmu03010",
 *     "termDescription": "Ribosome",
 *     "genesMapped": 73,
 *     "enrichmentScore": 1.47706,
 *     "direction": "bottom",
 *     "falseDiscoveryRate": 0.0000000000000000000000000584,
 *     "method": "ks",
 *     "matchingProteinLabels": "Rpl13,Mrpl2,Mrpl4,Rps11,..."
 *   }
 */
export class EnrichmentResponseDto {
  @ApiProperty({
    description: 'Dataset comparison name',
    example: 'eIF5A_DDvsWT_EC',
  })
  comparison!: string;

  @ApiProperty({
    description: 'Source database',
    example: 'KEGG',
    enum: ['KEGG', 'Reactome', 'WikiPathways'],
  })
  database!: string;

  @ApiProperty({
    description: 'Pathway/term identifier',
    example: 'mmu03010',
  })
  termId!: string;

  @ApiProperty({
    description: 'Human-readable pathway name',
    example: 'Ribosome',
  })
  termDescription!: string;

  @ApiProperty({
    description: 'Number of genes mapped to this pathway',
    example: 73,
  })
  genesMapped!: number;

  @ApiProperty({
    description: 'Statistical enrichment score',
    example: 1.47706,
  })
  enrichmentScore!: number;

  @ApiProperty({
    description: 'Direction of enrichment (bottom/top/both ends)',
    example: 'bottom',
    required: false,
  })
  direction!: string | null;

  @ApiProperty({
    description: 'False Discovery Rate (lower = more significant)',
    example: 0.0000000000000000000000000584,
  })
  falseDiscoveryRate!: number;

  @ApiProperty({
    description: 'Statistical method used (ks/afc)',
    example: 'ks',
    required: false,
  })
  method!: string | null;

  @ApiProperty({
    description: 'Comma-separated list of matching protein IDs',
    example: '10090.ENSMUSP00000000756,10090.ENSMUSP00000002844,...',
    required: false,
  })
  matchingProteinIds!: string | null;

  @ApiProperty({
    description: 'Comma-separated list of matching gene names',
    example: 'Rpl13,Mrpl2,Mrpl4,Rps11,Rplp1,Rpl19,...',
    required: false,
  })
  matchingProteinLabels!: string | null;
}

/**
 * DTO for getting available comparisons
 * 
 * Response structure for GET /api/enrichment/comparisons
 * Returns list of unique dataset comparisons that have enrichment data
 */
export class AvailableComparisonsDto {
  @ApiProperty({
    description: 'List of available dataset comparisons',
    example: ['eIF5A_DDvsWT_EC', 'DHS_DOHHvsTar4_EC', 'K50A_DDvsWT_EC'],
    type: [String],
  })
  comparisons!: string[];
}

/**
 * DTO for getting available databases
 * 
 * Response structure for GET /api/enrichment/databases
 * Returns list of databases with enrichment data
 */
export class AvailableDatabasesDto {
  @ApiProperty({
    description: 'List of available enrichment databases',
    example: ['KEGG', 'Reactome', 'WikiPathways'],
    type: [String],
  })
  databases!: string[];
}

/**
 * DTO for enrichment statistics
 * 
 * Response structure for GET /api/enrichment/stats
 * Provides summary statistics about enrichment data
 */
export class EnrichmentStatsDto {
  @ApiProperty({
    description: 'Total number of enrichment records',
    example: 704,
  })
  totalRecords!: number;

  @ApiProperty({
    description: 'Number of unique comparisons',
    example: 13,
  })
  uniqueComparisons!: number;

  @ApiProperty({
    description: 'Count of records by database',
    example: { KEGG: 243, Reactome: 400, WikiPathways: 61 },
  })
  recordsByDatabase!: Record<string, number>;

  @ApiProperty({
    description: 'Count of records by comparison',
    example: { 'eIF5A_DDvsWT_EC': 56, 'DHS_DOHHvsTar4_EC': 79 },
  })
  recordsByComparison!: Record<string, number>;
}

