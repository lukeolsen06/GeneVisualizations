import { IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Filter Genes DTO (Data Transfer Object)
 * 
 * This class defines the shape and validation rules for filtering gene queries.
 * DTOs provide type safety and automatic validation for API requests.
 * 
 * Key NestJS Concepts:
 * - DTOs separate API contracts from internal business logic
 * - class-validator decorators automatically validate incoming data
 * - class-transformer converts query strings to proper types
 * - Swagger decorators generate API documentation
 * 
 * Benefits:
 * - Type safety: Ensures data is correct type
 * - Validation: Automatically rejects invalid requests
 * - Documentation: Auto-generates API docs
 * - Reusability: Can be used across multiple endpoints
 */
export class FilterGenesDto {
  /**
   * p-value threshold for filtering genes
   * Example: ?pvalue=0.05
   */
  @ApiProperty({
    description: 'Filter genes by p-value threshold (genes with pvalue <= this value)',
    required: false,
    example: 0.05,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()  // This parameter is optional
  @Type(() => Number)  // Convert string from query to number
  @IsNumber()  // Must be a valid number
  @Min(0)  // Must be at least 0
  @Max(1)  // Must be at most 1
  pvalue?: number;

  /**
   * Adjusted p-value (padj) threshold for filtering
   * Example: ?padj=0.01
   */
  @ApiProperty({
    description: 'Filter genes by adjusted p-value threshold (genes with padj <= this value)',
    required: false,
    example: 0.01,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  padj?: number;

  /**
   * Log2 fold change threshold (absolute value)
   * Example: ?log2fc=1.0 means |log2FoldChange| >= 1.0
   */
  @ApiProperty({
    description: 'Filter genes by absolute log2 fold change (genes with |log2fc| >= this value)',
    required: false,
    example: 1.0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  log2fc?: number;

  /**
   * Direction of gene expression change
   * 'up' = upregulated (positive log2fc)
   * 'down' = downregulated (negative log2fc)
   * 'both' = all genes (default)
   */
  @ApiProperty({
    description: 'Filter by direction of gene expression',
    required: false,
    enum: ['up', 'down', 'both'],
    example: 'up',
  })
  @IsOptional()
  @IsIn(['up', 'down', 'both'])  // Must be one of these values
  direction?: 'up' | 'down' | 'both';

  /**
   * Maximum number of results to return
   * Example: ?limit=100
   */
  @ApiProperty({
    description: 'Maximum number of genes to return',
    required: false,
    example: 100,
    minimum: 1,
    maximum: 10000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10000)
  limit?: number;
}

