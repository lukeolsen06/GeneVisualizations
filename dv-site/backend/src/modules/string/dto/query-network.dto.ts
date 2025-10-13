import { IsOptional, IsString, IsInt, IsBoolean, Min, Max, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * DTO for querying existing STRING networks
 * 
 * This DTO validates query parameters for retrieving and filtering
 * existing STRING networks from the database.
 */
export class QueryNetworkDto {
  @ApiPropertyOptional({
    description: 'Filter by dataset comparison name',
    example: 'eIF5A_DDvsWT_EC'
  })
  @IsOptional()
  @IsString()
  comparison?: string;

  @ApiPropertyOptional({
    description: 'Include network data (nodes and edges) in response',
    example: true,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  @IsBoolean()
  includeData?: boolean = false;

  @ApiPropertyOptional({
    description: 'Minimum number of nodes in the network',
    example: 5,
    minimum: 0
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  minNodes?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of nodes in the network',
    example: 50,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  maxNodes?: number;

  @ApiPropertyOptional({
    description: 'Filter by confidence threshold',
    example: 400,
    minimum: 150,
    maximum: 1000
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(150)
  @Max(1000)
  confidenceThreshold?: number;

  @ApiPropertyOptional({
    description: 'Filter by network type',
    example: 'full',
    enum: ['full', 'physical', 'functional']
  })
  @IsOptional()
  @IsString()
  @IsIn(['full', 'physical', 'functional'])
  networkType?: string;

  @ApiPropertyOptional({
    description: 'Filter by successful networks only',
    example: true,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  @IsBoolean()
  isSuccessful?: boolean = true;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'nodeCount', 'edgeCount', 'comparison']
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'nodeCount', 'edgeCount', 'comparison'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
