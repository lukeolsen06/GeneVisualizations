import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DatasetsService } from './datasets.service';

/**
 * Datasets Controller
 * 
 * This controller handles HTTP requests for RNA-seq dataset operations.
 * It exposes service methods as REST API endpoints.
 * 
 * Key NestJS Concepts:
 * - @Controller() defines the base route for all endpoints in this controller
 * - @Get() defines HTTP GET endpoints
 * - @Param() extracts route parameters (e.g., :comparison)
 * - @Query() extracts query parameters (e.g., ?limit=100)
 * - Constructor injection of the service
 */
@ApiTags('datasets') // Groups endpoints in Swagger documentation
@Controller('datasets') // Base route: /api/datasets (api prefix from main.ts)
export class DatasetsController {
  constructor(private readonly datasetsService: DatasetsService) {}

  /**
   * GET /api/datasets
   * Returns list of available dataset comparisons
   * 
   * This replaces your static chartDataMapping keys
   */
  @Get()
  @ApiOperation({ summary: 'Get all available datasets' })
  async getAvailableDatasets(): Promise<string[]> {
    return this.datasetsService.getAvailableDatasets();
  }

  /**
   * GET /api/datasets/:comparison
   * Returns basic information about a specific dataset
   * 
   * Example: GET /api/datasets/eIF5A_DDvsWT_EC
   */
  @Get(':comparison')
  @ApiOperation({ summary: 'Get dataset information' })
  @ApiParam({ name: 'comparison', description: 'Dataset comparison name' })
  async getDatasetInfo(@Param('comparison') comparison: string) {
    return this.datasetsService.getDatasetInfo(comparison);
  }

  /**
   * GET /api/datasets/:comparison/genes
   * Returns genes from a specific dataset with optional pagination
   * 
   * Example: GET /api/datasets/eIF5A_DDvsWT_EC/genes?limit=100
   */
  @Get(':comparison/genes')
  @ApiOperation({ summary: 'Get genes from dataset' })
  @ApiParam({ name: 'comparison', description: 'Dataset comparison name' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of genes to return' })
  async getGenes(
    @Param('comparison') comparison: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    return this.datasetsService.getGenes(comparison, limitNumber);
  }
}
