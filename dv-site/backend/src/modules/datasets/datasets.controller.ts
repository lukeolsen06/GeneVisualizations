import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { DatasetsService } from './datasets.service';
import { FilterGenesDto } from './dto/filter-genes.dto';
import { VolcanoPlotDto, VolcanoPlotResponse } from './dto/volcano-plot.dto';

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
   * GET /api/datasets/:comparison/genes/volcano
   * Returns lightweight gene data optimized for volcano plot visualizations
   * 
   * Volcano Plot Endpoint Purpose:
   * - Returns ALL genes (not just significant ones) for complete visualization
   * - Lightweight response: Only 5 fields vs 14 (80% smaller)
   * - Optimized for plotting: X-axis (log2fc), Y-axis (-log10 pvalue)
   * 
   * Key Differences from Other Endpoints:
   * - No filtering (volcano plots need all data points)
   * - Higher default limit (5000 vs 100)
   * - Minimal fields for performance
   * 
   * Frontend Usage:
   * - Plot all genes to show distribution
   * - Color-code by significance (padj < 0.05)
   * - Interactive tooltips with gene name
   * 
   * Example: GET /api/datasets/eIF5A_DDvsWT_EC/genes/volcano?limit=10000
   */
  @Get(':comparison/genes/volcano')
  @ApiOperation({ 
    summary: 'Get volcano plot data',
    description: 'Returns lightweight gene data optimized for volcano plot visualization'
  })
  @ApiParam({ 
    name: 'comparison', 
    description: 'Dataset comparison name',
    example: 'eIF5A_DDvsWT_EC'
  })
  async getVolcanoPlotData(
    @Param('comparison') comparison: string,
    @Query() options: VolcanoPlotDto,
  ): Promise<VolcanoPlotResponse[]> {
    return this.datasetsService.getVolcanoPlotData(comparison, options);
  }

  /*
   * GET /api/datasets/:comparison/genes/filtered
   * Returns filtered genes based on p-value, fold change, and direction
   * 
   * This endpoint uses our FilterGenesDto for automatic validation.
   * NestJS will automatically:
   * 1. Extract all query parameters
   * 2. Transform strings to proper types (string -> number)
   * 3. Validate against our DTO rules
   * 4. Return 400 error if validation fails
   * 
   * Example: GET /api/datasets/eIF5A_DDvsWT_EC/genes/filtered?padj=0.01&log2fc=2&direction=up&limit=50
   */
  @Get(':comparison/genes/filtered')
  @ApiOperation({ 
    summary: 'Get filtered genes from dataset',
    description: 'Filter genes by p-value, adjusted p-value, log2 fold change, and expression direction'
  })
  @ApiParam({ 
    name: 'comparison', 
    description: 'Dataset comparison name (e.g., eIF5A_DDvsWT_EC)',
    example: 'eIF5A_DDvsWT_EC'
  })
  async getFilteredGenes(
    @Param('comparison') comparison: string,
    @Query() filters: FilterGenesDto,  // ← This is where the magic happens!
  ) {
    // The filters parameter is already validated and typed!
    // No need for manual parsing or validation
    return this.datasetsService.getFilteredGenes(comparison, filters);
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
  async getGenes(
    @Param('comparison') comparison: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    return this.datasetsService.getGenes(comparison, limitNumber);
  }
}
