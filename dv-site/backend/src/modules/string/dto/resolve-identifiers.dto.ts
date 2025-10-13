import { IsString, IsArray, IsOptional, IsIn, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for resolving gene identifiers to STRING IDs
 * 
 * This DTO validates requests to convert gene names or other identifiers
 * to STRING database identifiers for network construction.
 */
export class ResolveIdentifiersDto {
  @ApiProperty({
    description: 'Array of gene identifiers to resolve',
    example: ['Gnai3', 'Cdc45', 'Pcna', 'Mcm6', 'Rrm2'],
    type: [String],
    minItems: 1,
    maxItems: 200
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'At least 1 identifier is required' })
  @ArrayMaxSize(200, { message: 'Maximum 200 identifiers allowed per request' })
  identifiers!: string[];

  @ApiPropertyOptional({
    description: 'Input format of the identifiers',
    example: 'symbol',
    enum: ['symbol', 'ensembl', 'uniprot', 'entrez'],
    default: 'symbol'
  })
  @IsOptional()
  @IsString()
  @IsIn(['symbol', 'ensembl', 'uniprot', 'entrez'], {
    message: 'Input format must be one of: symbol, ensembl, uniprot, entrez'
  })
  fromFormat?: string = 'symbol';

  @ApiPropertyOptional({
    description: 'Species identifier (NCBI taxonomy ID)',
    example: 10090,
    default: 10090
  })
  @IsOptional()
  @IsString()
  species?: string = '10090'; // Mus musculus (mouse)
}

/**
 * DTO for identifier resolution response
 */
export class ResolveIdentifiersResponseDto {
  @ApiProperty({
    description: 'Array of resolved identifier mappings',
    type: 'array',
    items: { $ref: '#/components/schemas/IdentifierMappingDto' }
  })
  mappings!: IdentifierMappingDto[];

  @ApiProperty({
    description: 'Total number of identifiers processed',
    example: 15
  })
  totalProcessed!: number;

  @ApiProperty({
    description: 'Number of identifiers successfully resolved',
    example: 12
  })
  resolvedCount!: number;

  @ApiProperty({
    description: 'Resolution success rate (0-1)',
    example: 0.8
  })
  successRate!: number;
}

/**
 * DTO for individual identifier mapping
 */
export class IdentifierMappingDto {
  @ApiProperty({
    description: 'Original input identifier',
    example: 'Gnai3'
  })
  inputId!: string;

  @ApiPropertyOptional({
    description: 'Resolved STRING ID',
    example: '10090.ENSMUSP00000000001'
  })
  stringId?: string;

  @ApiPropertyOptional({
    description: 'Preferred name from STRING database',
    example: 'Gnai3'
  })
  preferredName?: string;

  @ApiProperty({
    description: 'Whether the identifier was successfully resolved',
    example: true
  })
  isResolved!: boolean;

  @ApiPropertyOptional({
    description: 'Error message if resolution failed',
    example: null
  })
  errorMessage?: string;
}
