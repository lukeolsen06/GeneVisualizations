import { IsOptional, IsString, MinLength, MaxLength, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Search Genes DTO (Data Transfer Object)
 * 
 * This DTO defines the parameters for searching genes by name.
 * 
 * Use Cases:
 * - User wants to find a specific gene (e.g., "Prl")
 * - User wants to find genes starting with a prefix (e.g., "Gm6*")
 * - Autocomplete functionality in the frontend
 * 
 * Key Features:
 * - Case-insensitive search
 * - Partial matching (finds "insulin" in "insulin-like")
 * - Validates search term length (prevents abuse)
 */
export class SearchGenesDto {
  /**
   * Search query string
   * Example: ?query=Prl or ?query=insulin
   * 
   * Validation:
   * - Minimum 1 character (prevent empty searches)
   * - Maximum 50 characters (reasonable gene name length)
   */
  @ApiProperty({
    description: 'Gene name or partial gene name to search for (case-insensitive)',
    required: true,
    example: 'Prl',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1, { message: 'Search query must be at least 1 character' })
  @MaxLength(50, { message: 'Search query must not exceed 50 characters' })
  query!: string;

  /**
   * Maximum number of results to return
   * Default: 20 (reasonable for search results)
   * 
   * Why 20? Most users won't scroll through hundreds of search results.
   * If they need more specific results, they should refine their query.
   */
  @ApiProperty({
    description: 'Maximum number of search results to return',
    required: false,
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

