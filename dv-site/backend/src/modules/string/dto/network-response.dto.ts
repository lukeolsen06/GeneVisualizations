import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for STRING network response data
 * 
 * This DTO shapes the response data for network creation and retrieval operations.
 * It includes both network metadata and the actual network data (nodes and edges).
 */
export class NetworkResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the network',
    example: 123
  })
  id!: number;

  @ApiProperty({
    description: 'Dataset comparison name',
    example: 'eIF5A_DDvsWT_EC'
  })
  comparison!: string;

  @ApiProperty({
    description: 'Hash of the gene set used for this network',
    example: 'a1b2c3d4e5f6'
  })
  geneSetHash!: string;

  @ApiProperty({
    description: 'Original gene set used for network construction',
    example: ['Gnai3', 'Cdc45', 'Pcna']
  })
  geneSet!: string[];

  @ApiProperty({
    description: 'Confidence threshold used for network construction',
    example: 400
  })
  confidenceThreshold!: number;

  @ApiProperty({
    description: 'Type of network built',
    example: 'full'
  })
  networkType!: string;

  @ApiProperty({
    description: 'Number of nodes in the network',
    example: 15
  })
  nodeCount!: number;

  @ApiProperty({
    description: 'Number of edges in the network',
    example: 28
  })
  edgeCount!: number;

  @ApiProperty({
    description: 'Number of genes successfully resolved by STRING',
    example: 12
  })
  resolvedGeneCount!: number;

  @ApiProperty({
    description: 'Whether the network was successfully created',
    example: true
  })
  isSuccessful!: boolean;

  @ApiPropertyOptional({
    description: 'Error message if network creation failed',
    example: null
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Network creation timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Network last update timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Network nodes data',
    type: 'array',
    items: { $ref: '#/components/schemas/NetworkNodeDto' }
  })
  nodes?: NetworkNodeDto[];

  @ApiPropertyOptional({
    description: 'Network edges data',
    type: 'array',
    items: { $ref: '#/components/schemas/NetworkEdgeDto' }
  })
  edges?: NetworkEdgeDto[];
}

/**
 * DTO for network node data
 */
export class NetworkNodeDto {
  @ApiProperty({
    description: 'Unique identifier for the node',
    example: 456
  })
  id!: number;

  @ApiProperty({
    description: 'STRING database identifier',
    example: '10090.ENSMUSP00000000001'
  })
  stringId!: string;

  @ApiProperty({
    description: 'Preferred gene name for display',
    example: 'Gnai3'
  })
  preferredName!: string;

  @ApiPropertyOptional({
    description: 'Gene annotation from STRING database',
    example: 'G protein subunit alpha i3'
  })
  annotation?: string;

  @ApiPropertyOptional({
    description: 'Log2 fold change from RNA-seq analysis',
    example: 2.45
  })
  log2fc?: number;

  @ApiPropertyOptional({
    description: 'Adjusted p-value from RNA-seq analysis',
    example: 0.0012
  })
  padj?: number;

  @ApiPropertyOptional({
    description: 'Expression direction',
    example: 'upregulated'
  })
  expression?: string;

  @ApiPropertyOptional({
    description: 'Functional terms associated with this protein',
    example: [{ term: 'GO:0005634', description: 'nucleus' }]
  })
  functionalTerms?: Array<{term: string; description: string}>;

  @ApiPropertyOptional({
    description: 'Normalized degree centrality score',
    example: 0.75
  })
  normalizedDegreeCentrality?: number;

  @ApiPropertyOptional({
    description: 'Raw degree (number of connections)',
    example: 8
  })
  degree?: number;
}

/**
 * DTO for network edge data
 */
export class NetworkEdgeDto {
  @ApiProperty({
    description: 'Unique identifier for the edge',
    example: 789
  })
  id!: number;

  @ApiProperty({
    description: 'STRING ID of source protein',
    example: '10090.ENSMUSP00000000001'
  })
  sourceStringId!: string;

  @ApiProperty({
    description: 'STRING ID of target protein',
    example: '10090.ENSMUSP00000000002'
  })
  targetStringId!: string;

  @ApiProperty({
    description: 'Interaction confidence score (0-1000 scale)',
    example: 750
  })
  interactionScore!: number;

  @ApiProperty({
    description: 'Confidence level category',
    example: 'high'
  })
  confidenceLevel!: string;

  @ApiPropertyOptional({
    description: 'Type of interaction',
    example: 'physical'
  })
  interactionType?: string;

  @ApiPropertyOptional({
    description: 'Evidence sources for this interaction',
    example: ['experiments', 'databases']
  })
  evidenceSources?: string[];
}
