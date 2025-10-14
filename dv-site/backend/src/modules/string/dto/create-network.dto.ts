import { IsString, IsArray, IsOptional, IsInt, IsIn, Min, Max, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new STRING network
 * 
 * This DTO validates incoming requests to create protein-protein interaction networks
 * from gene sets using the STRING database API.
 */
export class CreateNetworkDto {
  @ApiProperty({
    description: 'Dataset comparison name (e.g., "eIF5A_DDvsWT_EC")',
    example: 'eIF5A_DDvsWT_EC',
    minLength: 1,
    maxLength: 255
  })
  @IsString()
  comparison!: string;

  @ApiProperty({
    description: 'Array of gene names to build the network from',
    example: ['Gnai3', 'Cdc45', 'Pcna', 'Mcm6', 'Rrm2'],
    type: [String],
    minItems: 2,
    maxItems: 500
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2, { message: 'At least 2 genes are required to build a network' })
  @ArrayMaxSize(500, { message: 'Maximum 500 genes allowed per network request' })
  geneSet!: string[];

  @ApiPropertyOptional({
    description: 'Confidence threshold for interactions (0-1000 scale)',
    example: 400,
    minimum: 150,
    maximum: 1000,
    default: 400
  })
  @IsOptional()
  @IsInt()
  @Min(150, { message: 'Confidence threshold must be at least 150' })
  @Max(1000, { message: 'Confidence threshold cannot exceed 1000' })
  confidenceThreshold?: number = 400;

  @ApiPropertyOptional({
    description: 'Type of network to build',
    example: 'full',
    enum: ['full', 'physical', 'functional'],
    default: 'full'
  })
  @IsOptional()
  @IsString()
  @IsIn(['full', 'physical', 'functional'], { 
    message: 'Network type must be one of: full, physical, functional' 
  })
  networkType?: string = 'full';
}
