import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

// Entities
import { StringNetworkEntity } from '../entities/string-network.entity';
import { StringNodeEntity } from '../entities/string-node.entity';
import { StringEdgeEntity } from '../entities/string-edge.entity';

// DTOs
import { 
  CreateNetworkDto, 
  NetworkResponseDto, 
  QueryNetworkDto,
  ResolveIdentifiersDto,
  ResolveIdentifiersResponseDto,
  IdentifierMappingDto
} from '../dto';

/**
 * STRING Service
 * 
 * This service handles all STRING database operations including:
 * - Network creation and caching
 * - Identifier resolution
 * - Data retrieval and filtering
 * - External STRING API integration
 */
@Injectable()
export class StringService {
  private readonly logger = new Logger(StringService.name);
  private readonly stringApiBaseUrl = 'https://string-db.org/api';
  private readonly defaultSpecies = '10090'; // Mus musculus (mouse)

  constructor(
    @InjectRepository(StringNetworkEntity)
    private readonly networkRepository: Repository<StringNetworkEntity>,
    
    @InjectRepository(StringNodeEntity)
    private readonly nodeRepository: Repository<StringNodeEntity>,
    
    @InjectRepository(StringEdgeEntity)
    private readonly edgeRepository: Repository<StringEdgeEntity>,
    
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new STRING network from a gene set
   * Includes caching logic to avoid duplicate API calls
   */
  async createNetwork(createNetworkDto: CreateNetworkDto): Promise<NetworkResponseDto> {
    const { comparison, geneSet, confidenceThreshold = 400, networkType = 'full' } = createNetworkDto;
    
    this.logger.log(`Creating network for comparison: ${comparison} with ${geneSet.length} genes`);
    
    // Step 1: Resolve gene identifiers to STRING IDs first
    const resolvedIdentifiers = await this.resolveIdentifiers({
      identifiers: geneSet,
      fromFormat: 'symbol'
    });
    
    const stringIds = resolvedIdentifiers.mappings
      .filter(mapping => mapping.isResolved && mapping.stringId)
      .map(mapping => mapping.stringId!);
    
    // Step 2: Generate cache key based on RESOLVED genes from the current filtered gene set
    const resolvedGeneNames = resolvedIdentifiers.mappings
      .filter(mapping => mapping.isResolved)
      .map(mapping => mapping.preferredName || mapping.inputId)
      .sort();
    
    const geneSetHash = this.generateGeneSetHash(resolvedGeneNames, confidenceThreshold, networkType);

    try {
      
      // Step 3: Check if network already exists (based on resolved genes)
      const existingNetwork = await this.findNetworkByHash(comparison, geneSetHash);
      if (existingNetwork) {
        this.logger.log(`Found existing network with hash: ${geneSetHash} for ${resolvedGeneNames.length} resolved genes`);
        return this.mapNetworkToResponseDto(existingNetwork, true); // includeData = true
      }
      
      // Step 4: Log the filtering context for debugging
      this.logger.log(`Creating new network: ${geneSet.length} input genes → ${resolvedGeneNames.length} resolved genes`);
      
      if (stringIds.length < 2) {
        throw new BadRequestException(
          `Only ${stringIds.length} gene(s) resolved to STRING IDs. At least 2 genes are required for network construction.`
        );
      }
      
      // Step 4: Fetch network data from STRING API
      const networkData = await this.fetchNetworkFromStringApi(stringIds, {
        confidenceThreshold,
        networkType
      });
      
      if (!networkData || networkData.length === 0) {
        throw new BadRequestException('No network data found for the provided gene set');
      }
      
      // Step 5: Store network in database
      const savedNetwork = await this.saveNetworkToDatabase({
        comparison,
        geneSet,
        geneSetHash,
        confidenceThreshold,
        networkType,
        networkData,
        resolvedIdentifiers
      });
      
      this.logger.log(`Successfully created network with ID: ${savedNetwork.id}`);
      return this.mapNetworkToResponseDto(savedNetwork, true);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to create network: ${errorMessage}`);
      
      // Store failed network attempt for debugging
      await this.saveFailedNetwork({
        comparison,
        geneSet,
        geneSetHash,
        confidenceThreshold,
        networkType,
        errorMessage
      });
      
      throw error;
    }
  }

  /**
   * Query existing networks with filtering and pagination
   */
  async queryNetworks(queryDto: QueryNetworkDto): Promise<{
    networks: NetworkResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      comparison,
      includeData = false,
      minNodes,
      maxNodes,
      confidenceThreshold,
      networkType,
      isSuccessful = true,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = queryDto;
    
    // Build query
    const queryBuilder = this.networkRepository.createQueryBuilder('network');
    
    // Apply filters
    if (comparison) {
      queryBuilder.andWhere('network.comparison = :comparison', { comparison });
    }
    
    if (minNodes !== undefined) {
      queryBuilder.andWhere('network.nodeCount >= :minNodes', { minNodes });
    }
    
    if (maxNodes !== undefined) {
      queryBuilder.andWhere('network.nodeCount <= :maxNodes', { maxNodes });
    }
    
    if (confidenceThreshold !== undefined) {
      queryBuilder.andWhere('network.confidenceThreshold = :confidenceThreshold', { confidenceThreshold });
    }
    
    if (networkType) {
      queryBuilder.andWhere('network.networkType = :networkType', { networkType });
    }
    
    queryBuilder.andWhere('network.isSuccessful = :isSuccessful', { isSuccessful });
    
    // Apply sorting
    const orderDirection = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    queryBuilder.orderBy(`network.${sortBy}`, orderDirection);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    // Include related data if requested
    if (includeData) {
      queryBuilder.leftJoinAndSelect('network.nodes', 'nodes');
      queryBuilder.leftJoinAndSelect('network.edges', 'edges');
    }
    
    // Execute query
    const [networks, total] = await queryBuilder.getManyAndCount();
    
    // Map to response DTOs
    const networkDtos = networks.map(network => 
      this.mapNetworkToResponseDto(network, includeData)
    );
    
    return {
      networks: networkDtos,
      total,
      page,
      limit
    };
  }

  /**
   * Get a specific network by ID
   */
  async getNetworkById(id: number, includeData = false): Promise<NetworkResponseDto> {
    const queryBuilder = this.networkRepository
      .createQueryBuilder('network')
      .where('network.id = :id', { id });
    
    if (includeData) {
      queryBuilder
        .leftJoinAndSelect('network.nodes', 'nodes')
        .leftJoinAndSelect('network.edges', 'edges');
    }
    
    const network = await queryBuilder.getOne();
    
    if (!network) {
      throw new NotFoundException(`Network with ID ${id} not found`);
    }
    
    return this.mapNetworkToResponseDto(network, includeData);
  }

  /**
   * Resolve gene identifiers to STRING IDs
   */
  async resolveIdentifiers(resolveDto: ResolveIdentifiersDto): Promise<ResolveIdentifiersResponseDto> {
    const { identifiers, fromFormat = 'symbol', species = this.defaultSpecies } = resolveDto;
    
    this.logger.log(`Resolving ${identifiers.length} identifiers from format: ${fromFormat}`);
    
    try {
      // Call STRING API to resolve identifiers
      const response = await axios.get(`${this.stringApiBaseUrl}/tsv/get_string_ids`, {
        params: {
          identifiers: identifiers.join('\n'),
          species,
          limit: 1,
          echo_query: 1,
          caller_identity: 'gene-viz-backend'
        },
        timeout: 30000 // 30 second timeout
      });
      
      // Parse TSV response
      const resolvedData = this.parseTsvResponse(response.data);
      
      // Map to our DTO format
      const mappings: IdentifierMappingDto[] = identifiers.map(inputId => {
        const resolved = resolvedData.find(item => 
          item.queryItem === inputId || item.queryItem === inputId.toLowerCase()
        );
        
        if (resolved && resolved.stringId) {
          return {
            inputId,
            stringId: resolved.stringId,
            preferredName: resolved.preferredName,
            isResolved: true
          };
        }
        
        return {
          inputId,
          isResolved: false,
          errorMessage: 'Identifier not found in STRING database'
        };
      });
      
      const resolvedCount = mappings.filter(m => m.isResolved).length;
      const successRate = resolvedCount / identifiers.length;
      
      this.logger.log(`Resolved ${resolvedCount}/${identifiers.length} identifiers (${(successRate * 100).toFixed(1)}%)`);
      
      return {
        mappings,
        totalProcessed: identifiers.length,
        resolvedCount,
        successRate
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to resolve identifiers: ${errorMessage}`);
      throw new BadRequestException(`Failed to resolve identifiers: ${errorMessage}`);
    }
  }

  /**
   * Generate a hash for gene set caching
   * This creates a unique identifier based on:
   * - Resolved gene names from the current filtered gene set (sorted for consistency)
   * - Confidence threshold
   * - Network type
   * 
   * Caching Strategy:
   * - When user changes log2fc/padj thresholds, they get different filtered genes
   * - Different filtered genes → different resolved genes → different hash → new network
   * - Same filtered genes (regardless of how they were filtered) → same resolved genes → same hash → cached network
   * 
   * Note: Expression data (log2fc, padj) is not included in the hash
   * because it doesn't affect network structure, only visualization styling.
   */
  private generateGeneSetHash(geneSet: string[], confidenceThreshold: number, networkType: string): string {
    const sortedGenes = [...geneSet].sort();
    const hashInput = `${sortedGenes.join(',')}|${confidenceThreshold}|${networkType}`;
    return crypto.createHash('md5').update(hashInput).digest('hex');
  }

  /**
   * Find existing network by hash
   */
  private async findNetworkByHash(comparison: string, geneSetHash: string): Promise<StringNetworkEntity | null> {
    return this.networkRepository.findOne({
      where: { comparison, geneSetHash },
      relations: ['nodes', 'edges'] // Load the relations for cached networks
    });
  }

  /**
   * Fetch network data from STRING API
   */
  private async fetchNetworkFromStringApi(stringIds: string[], options: {
    confidenceThreshold: number;
    networkType: string;
  }): Promise<any[]> {
    const { confidenceThreshold, networkType } = options;
    
    this.logger.log(`Fetching network from STRING API for ${stringIds.length} proteins`);
    
    try {
      const response = await axios.get(`${this.stringApiBaseUrl}/tsv/network`, {
        params: {
          identifiers: stringIds.join('\n'),
          species: this.defaultSpecies,
          required_score: confidenceThreshold,
          network_type: networkType,
          caller_identity: 'gene-viz-backend'
        },
        timeout: 60000 // 60 second timeout for network requests
      });
      
      return this.parseTsvResponse(response.data);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`STRING API network request failed: ${errorMessage}`);
      throw new BadRequestException(`Failed to fetch network from STRING API: ${errorMessage}`);
    }
  }

  /**
   * Save successful network to database
   */
  private async saveNetworkToDatabase(data: {
    comparison: string;
    geneSet: string[];
    geneSetHash: string;
    confidenceThreshold: number;
    networkType: string;
    networkData: any[];
    resolvedIdentifiers: ResolveIdentifiersResponseDto;
  }): Promise<StringNetworkEntity> {
    const { comparison, geneSet, geneSetHash, confidenceThreshold, networkType, networkData, resolvedIdentifiers } = data;
    
    // Create network entity
    const network = this.networkRepository.create({
      comparison,
      geneSetHash,
      geneSet,
      confidenceThreshold,
      networkType,
      nodeCount: 0, // Will be updated after nodes are saved
      edgeCount: 0, // Will be updated after edges are saved
      resolvedGeneCount: resolvedIdentifiers.resolvedCount,
      isSuccessful: true
    });
    
    const savedNetwork = await this.networkRepository.save(network);
    
    // Process and save nodes
    const nodeMap = new Map<string, StringNodeEntity>();
    const edgeSet = new Set<string>();
    for (const interaction of networkData) {
      const sourceId = interaction.stringId_A;
      const targetId = interaction.stringId_B;
      
      // Add source node
      if (!nodeMap.has(sourceId)) {
        const sourceNode = this.nodeRepository.create({
          networkId: savedNetwork.id,
          stringId: sourceId,
          preferredName: interaction.preferredName_A || sourceId
        });
        const savedSourceNode = await this.nodeRepository.save(sourceNode);
        nodeMap.set(sourceId, savedSourceNode);
      }
      
      // Add target node
      if (!nodeMap.has(targetId)) {
        const targetNode = this.nodeRepository.create({
          networkId: savedNetwork.id,
          stringId: targetId,
          preferredName: interaction.preferredName_B || targetId
        });
        const savedTargetNode = await this.nodeRepository.save(targetNode);
        nodeMap.set(targetId, savedTargetNode);
      }
      
      // Build a canonical edge key to avoid duplicates (STRING may return bidirectional rows)
      const edgeKey = `${sourceId}->${targetId}`;
      if (edgeSet.has(edgeKey)) {
        continue;
      }
      edgeSet.add(edgeKey);

      // Add edge
      const sourceNode = nodeMap.get(sourceId);
      const targetNode = nodeMap.get(targetId);

      if (!sourceNode || !targetNode) {
        this.logger.warn(
          `Skipping edge ${sourceId}->${targetId} due to missing node reference`,
        );
        continue;
      }
      const edge = this.edgeRepository.create({
        networkId: savedNetwork.id,
        sourceStringId: sourceId,
        sourceGeneName: sourceNode.preferredName,
        targetStringId: targetId,
        targetGeneName: targetNode.preferredName,
        interactionScore: parseFloat(interaction.score) || 0,
        confidenceLevel: this.getConfidenceLevel(parseFloat(interaction.score) || 0)
      });
      await this.edgeRepository.save(edge);
    }
    
    // Update network with final counts
    const finalNodeCount = nodeMap.size;
    const finalEdgeCount = edgeSet.size;
    
    await this.networkRepository.update(savedNetwork.id, {
      nodeCount: finalNodeCount,
      edgeCount: finalEdgeCount
    });
    
    // Reload network with updated counts
    return this.networkRepository.findOne({
      where: { id: savedNetwork.id },
      relations: ['nodes', 'edges']
    }) as Promise<StringNetworkEntity>;
  }

  /**
   * Save failed network attempt
   */
  private async saveFailedNetwork(data: {
    comparison: string;
    geneSet: string[];
    geneSetHash: string;
    confidenceThreshold: number;
    networkType: string;
    errorMessage: string;
  }): Promise<void> {
    const { comparison, geneSet, geneSetHash, confidenceThreshold, networkType, errorMessage } = data;
    
    const failedNetwork = this.networkRepository.create({
      comparison,
      geneSetHash,
      geneSet,
      confidenceThreshold,
      networkType,
      nodeCount: 0,
      edgeCount: 0,
      resolvedGeneCount: 0,
      isSuccessful: false,
      errorMessage
    });
    
    await this.networkRepository.save(failedNetwork);
  }

  /**
   * Parse TSV response from STRING API
   */
  private parseTsvResponse(tsvData: string): any[] {
    const lines = tsvData.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split('\t');
    
    return lines.slice(1).map(line => {
      const values = line.split('\t');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  }

  /**
   * Get confidence level from score
   */
  private getConfidenceLevel(score: number): string {
    if (score >= 700) return 'high';
    if (score >= 400) return 'medium';
    return 'low';
  }

  /**
   * Map network entity to response DTO
   */
  private mapNetworkToResponseDto(network: StringNetworkEntity, includeData = false): NetworkResponseDto {
    const dto: NetworkResponseDto = {
      id: network.id,
      comparison: network.comparison,
      geneSetHash: network.geneSetHash,
      geneSet: network.geneSet,
      confidenceThreshold: network.confidenceThreshold,
      networkType: network.networkType,
      nodeCount: network.nodeCount,
      edgeCount: network.edgeCount,
      resolvedGeneCount: network.resolvedGeneCount,
      isSuccessful: network.isSuccessful,
      errorMessage: network.errorMessage,
      createdAt: network.createdAt,
      updatedAt: network.updatedAt
    };
    
    if (includeData && network.nodes && network.edges) {
      dto.nodes = network.nodes.map(node => ({
        id: node.id,
        stringId: node.stringId,
        preferredName: node.preferredName,
        annotation: node.annotation,
        log2fc: node.log2fc,
        padj: node.padj,
        expression: node.expression,
        functionalTerms: node.functionalTerms,
        normalizedDegreeCentrality: node.normalizedDegreeCentrality,
        degree: node.degree
      }));
      
      dto.edges = network.edges.map(edge => ({
        id: edge.id,
        sourceStringId: edge.sourceStringId,
        sourceGeneName: edge.sourceGeneName,
        targetStringId: edge.targetStringId,
        targetGeneName: edge.targetGeneName,
        interactionScore: edge.interactionScore,
        confidenceLevel: edge.confidenceLevel,
        interactionType: edge.interactionType,
        evidenceSources: edge.evidenceSources
      }));
    }
    
    return dto;
  }
}
