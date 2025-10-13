import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Param, 
  ParseIntPipe, 
  HttpCode, 
  HttpStatus,
  Logger
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';

// Services
import { StringService } from '../services';

// DTOs
import { 
  CreateNetworkDto, 
  NetworkResponseDto, 
  QueryNetworkDto,
  ResolveIdentifiersDto,
  ResolveIdentifiersResponseDto
} from '../dto';

/**
 * STRING Controller
 * 
 * This controller exposes REST endpoints for STRING protein-protein interaction network operations.
 * It provides endpoints for network creation, querying, identifier resolution, and data retrieval.
 * 
 * Base Path: /api/string
 */
@ApiTags('STRING Networks')
@Controller('string')
export class StringController {
  private readonly logger = new Logger(StringController.name);

  constructor(private readonly stringService: StringService) {}

  /**
   * Create a new STRING network from a gene set
   * 
   * This endpoint creates a protein-protein interaction network using the STRING database.
   * It includes intelligent caching to avoid duplicate API calls for the same gene sets.
   * 
   * Example URL: POST /api/string/networks
   */
  @Post('networks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new STRING network',
    description: `
      Creates a protein-protein interaction network from a provided gene set.
      
      **Features:**
      - Intelligent caching (same gene set = instant response)
      - Batch processing (up to 200 genes)
      - Automatic identifier resolution
      - Confidence threshold filtering
      
      **Process:**
      1. Resolve gene names to STRING IDs
      2. Fetch network data from STRING API
      3. Store in database with caching
      4. Return complete network data
    `
  })
  @ApiBody({
    type: CreateNetworkDto,
    description: 'Gene set and network parameters',
    examples: {
      basic: {
        summary: 'Basic network creation',
        value: {
          comparison: 'eIF5A_DDvsWT_EC',
          geneSet: ['Gnai3', 'Cdc45', 'Pcna', 'Mcm6', 'Rrm2'],
          confidenceThreshold: 400,
          networkType: 'full'
        }
      },
      highConfidence: {
        summary: 'High confidence network',
        value: {
          comparison: 'eIF5A_DDvsWT_EC',
          geneSet: ['Gnai3', 'Cdc45', 'Pcna'],
          confidenceThreshold: 700,
          networkType: 'physical'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Network successfully created',
    type: NetworkResponseDto,
    example: {
      id: 123,
      comparison: 'eIF5A_DDvsWT_EC',
      geneSetHash: 'a1b2c3d4e5f6',
      geneSet: ['Gnai3', 'Cdc45', 'Pcna'],
      confidenceThreshold: 400,
      networkType: 'full',
      nodeCount: 15,
      edgeCount: 28,
      resolvedGeneCount: 12,
      isSuccessful: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      nodes: [
        {
          id: 456,
          stringId: '10090.ENSMUSP00000000001',
          preferredName: 'Gnai3',
          annotation: 'G protein subunit alpha i3'
        }
      ],
      edges: [
        {
          id: 789,
          sourceStringId: '10090.ENSMUSP00000000001',
          targetStringId: '10090.ENSMUSP00000000002',
          interactionScore: 750,
          confidenceLevel: 'high'
        }
      ]
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or network creation failed',
    example: {
      statusCode: 400,
      message: 'Only 1 gene(s) resolved to STRING IDs. At least 2 genes are required for network construction.',
      error: 'Bad Request'
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during network creation',
    example: {
      statusCode: 500,
      message: 'Failed to fetch network from STRING API: Connection timeout',
      error: 'Internal Server Error'
    }
  })
  async createNetwork(@Body() createNetworkDto: CreateNetworkDto): Promise<NetworkResponseDto> {
    this.logger.log(`Creating network for comparison: ${createNetworkDto.comparison}`);
    return this.stringService.createNetwork(createNetworkDto);
  }

  /**
   * Query existing STRING networks with filtering and pagination
   * 
   * This endpoint allows searching and filtering through existing networks
   * with advanced query parameters and pagination support.
   * 
   * Example URL: GET /api/string/networks?comparison=eIF5A_DDvsWT_EC&page=1&limit=10&includeData=true
   */
  @Get('networks')
  @ApiOperation({
    summary: 'Query existing STRING networks',
    description: `
      Search and filter existing STRING networks with advanced query capabilities.
      
      **Features:**
      - Multiple filter options (comparison, size, confidence, type)
      - Pagination support
      - Flexible sorting
      - Optional data inclusion
      
      **Use Cases:**
      - Browse all networks for a specific comparison
      - Find networks within size ranges
      - Filter by confidence levels
      - Paginated network listing
    `
  })
  @ApiQuery({
    name: 'comparison',
    required: false,
    description: 'Filter by dataset comparison name',
    example: 'eIF5A_DDvsWT_EC'
  })
  @ApiQuery({
    name: 'includeData',
    required: false,
    type: Boolean,
    description: 'Include network data (nodes and edges) in response',
    example: true
  })
  @ApiQuery({
    name: 'minNodes',
    required: false,
    type: Number,
    description: 'Minimum number of nodes in the network',
    example: 5
  })
  @ApiQuery({
    name: 'maxNodes',
    required: false,
    type: Number,
    description: 'Maximum number of nodes in the network',
    example: 50
  })
  @ApiQuery({
    name: 'confidenceThreshold',
    required: false,
    type: Number,
    description: 'Filter by confidence threshold',
    example: 400
  })
  @ApiQuery({
    name: 'networkType',
    required: false,
    enum: ['full', 'physical', 'functional'],
    description: 'Filter by network type',
    example: 'full'
  })
  @ApiQuery({
    name: 'isSuccessful',
    required: false,
    type: Boolean,
    description: 'Filter by successful networks only',
    example: true
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of results per page',
    example: 10
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'nodeCount', 'edgeCount', 'comparison'],
    description: 'Sort field',
    example: 'createdAt'
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
    example: 'DESC'
  })
  @ApiResponse({
    status: 200,
    description: 'Networks successfully retrieved',
    example: {
      networks: [
        {
          id: 123,
          comparison: 'eIF5A_DDvsWT_EC',
          nodeCount: 15,
          edgeCount: 28,
          isSuccessful: true,
          createdAt: '2024-01-15T10:30:00Z'
        }
      ],
      total: 25,
      page: 1,
      limit: 10
    }
  })
  async queryNetworks(@Query() queryDto: QueryNetworkDto): Promise<{
    networks: NetworkResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.log(`Querying networks with filters: ${JSON.stringify(queryDto)}`);
    return this.stringService.queryNetworks(queryDto);
  }

  /**
   * Get a specific network by ID
   * 
   * Retrieves detailed information about a specific STRING network,
   * optionally including the complete network data (nodes and edges).
   * 
   * Example URL: GET /api/string/networks/123?includeData=true
   */
  @Get('networks/:id')
  @ApiOperation({
    summary: 'Get network by ID',
    description: `
      Retrieve a specific STRING network by its database ID.
      
      **Features:**
      - Optional data inclusion for performance
      - Complete network metadata
      - Detailed error handling
      
      **Use Cases:**
      - Network details page
      - Visualization data loading
      - Network analysis
    `
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Network database ID',
    example: 123
  })
  @ApiQuery({
    name: 'includeData',
    required: false,
    type: Boolean,
    description: 'Include network data (nodes and edges)',
    example: true
  })
  @ApiResponse({
    status: 200,
    description: 'Network successfully retrieved',
    type: NetworkResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Network not found',
    example: {
      statusCode: 404,
      message: 'Network with ID 123 not found',
      error: 'Not Found'
    }
  })
  async getNetworkById(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeData') includeData?: boolean
  ): Promise<NetworkResponseDto> {
    this.logger.log(`Retrieving network with ID: ${id}, includeData: ${includeData}`);
    return this.stringService.getNetworkById(id, includeData || false);
  }

  /**
   * Resolve gene identifiers to STRING IDs
   * 
   * Converts human-readable gene names to STRING database identifiers
   * required for network construction and analysis.
   * 
   * Example URL: POST /api/string/resolve-identifiers
   */
  @Post('resolve-identifiers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resolve gene identifiers to STRING IDs',
    description: `
      Convert gene names or other identifiers to STRING database identifiers.
      
      **Features:**
      - Batch processing (up to 200 identifiers)
      - Multiple input formats (symbol, ensembl, uniprot, entrez)
      - Detailed resolution statistics
      - Species-specific resolution
      
      **Process:**
      1. Send identifiers to STRING API
      2. Parse and validate responses
      3. Calculate success rates
      4. Return detailed mapping results
    `
  })
  @ApiBody({
    type: ResolveIdentifiersDto,
    description: 'Identifiers to resolve',
    examples: {
      geneSymbols: {
        summary: 'Gene symbol resolution',
        value: {
          identifiers: ['Gnai3', 'Cdc45', 'Pcna', 'Mcm6', 'Rrm2'],
          fromFormat: 'symbol',
          species: '10090'
        }
      },
      ensemblIds: {
        summary: 'Ensembl ID resolution',
        value: {
          identifiers: ['ENSMUSG00000000001', 'ENSMUSG00000000002'],
          fromFormat: 'ensembl',
          species: '10090'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Identifiers successfully resolved',
    type: ResolveIdentifiersResponseDto,
    example: {
      mappings: [
        {
          inputId: 'Gnai3',
          stringId: '10090.ENSMUSP00000000001',
          preferredName: 'Gnai3',
          isResolved: true
        },
        {
          inputId: 'UnknownGene',
          isResolved: false,
          errorMessage: 'Identifier not found in STRING database'
        }
      ],
      totalProcessed: 5,
      resolvedCount: 4,
      successRate: 0.8
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or resolution failed',
    example: {
      statusCode: 400,
      message: 'Failed to resolve identifiers: STRING API timeout',
      error: 'Bad Request'
    }
  })
  async resolveIdentifiers(@Body() resolveDto: ResolveIdentifiersDto): Promise<ResolveIdentifiersResponseDto> {
    this.logger.log(`Resolving ${resolveDto.identifiers.length} identifiers from format: ${resolveDto.fromFormat}`);
    return this.stringService.resolveIdentifiers(resolveDto);
  }

  /**
   * Get STRING service statistics
   * 
   * Provides overview statistics about networks, success rates, and usage patterns.
   * 
   * Example URL: GET /api/string/stats
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get STRING service statistics',
    description: `
      Retrieve comprehensive statistics about STRING network operations.
      
      **Statistics Include:**
      - Total networks created
      - Success/failure rates
      - Popular comparisons
      - Network size distributions
      - Recent activity
    `
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics successfully retrieved',
    example: {
      totalNetworks: 150,
      successfulNetworks: 142,
      failedNetworks: 8,
      successRate: 0.947,
      averageNodes: 23.5,
      averageEdges: 45.2,
      popularComparisons: [
        { comparison: 'eIF5A_DDvsWT_EC', count: 25 },
        { comparison: 'eIF5A_DDvsTar4_EC', count: 18 }
      ],
      networkSizeDistribution: {
        small: 45,
        medium: 67,
        large: 30
      },
      recentActivity: {
        last24Hours: 12,
        last7Days: 45,
        last30Days: 150
      }
    }
  })
  async getStatistics(): Promise<any> {
    this.logger.log('Retrieving STRING service statistics');
    
    // Get basic statistics from database
    const totalNetworks = await this.stringService.queryNetworks({
      page: 1,
      limit: 1
    });
    
    const successfulNetworks = await this.stringService.queryNetworks({
      isSuccessful: true,
      page: 1,
      limit: 1
    });
    
    const failedNetworks = await this.stringService.queryNetworks({
      isSuccessful: false,
      page: 1,
      limit: 1
    });
    
    const successRate = totalNetworks.total > 0 ? successfulNetworks.total / totalNetworks.total : 0;
    
    return {
      totalNetworks: totalNetworks.total,
      successfulNetworks: successfulNetworks.total,
      failedNetworks: failedNetworks.total,
      successRate: Math.round(successRate * 1000) / 1000, // Round to 3 decimal places
      message: 'Additional statistics can be added here (popular comparisons, size distributions, etc.)'
    };
  }
}
