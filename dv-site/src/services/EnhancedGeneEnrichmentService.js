import StringBackendService from './StringBackendService.js';
import { convertToCytoscapeFormat } from './StringDataUtils.js';

/**
 * Enhanced service for enriching gene objects with STRING data via backend APIs
 * 
 * Key Improvements over the old GeneEnrichmentService:
 * - Uses backend APIs with intelligent caching
 * - Network creation and storage in one step
 * - Better error handling and recovery
 * - Consistent data format from backend
 * - Network data included in enrichment results
 */
class EnhancedGeneEnrichmentService {
  constructor() {
    // Simple in-memory cache for enrichment results
    this.cache = new Map();
    // Cache for identifier resolution results (separate from enrichment cache)
    this.identifierCache = new Map();
  }

  // Generate cache key for enrichment results
  generateCacheKey(geneObjects, comparison, options) {
    const geneNames = geneObjects.map(g => g.geneName).sort();
    return `${comparison}:${geneNames.join(',')}:${options.confidenceThreshold || 400}:${options.networkType || 'full'}`;
  }

  // Generate cache key for identifier resolution
  generateIdentifierCacheKey(geneNames) {
    return geneNames.sort().join(',');
  }

  // Resolve identifiers in batches to handle large gene sets
  async resolveIdentifiersInBatches(geneNames, fromFormat = 'symbol', batchSize = 200) {
    const batches = [];
    for (let i = 0; i < geneNames.length; i += batchSize) {
      batches.push(geneNames.slice(i, i + batchSize));
    }

    console.log(`Processing ${batches.length} batches of up to ${batchSize} genes each`);

    const allMappings = [];
    let totalProcessed = 0;
    let resolvedCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} genes)`);
      
      try {
        const batchResult = await StringBackendService.resolveIdentifiers(batch, fromFormat);
        allMappings.push(...batchResult.mappings);
        totalProcessed += batchResult.totalProcessed;
        resolvedCount += batchResult.resolvedCount;
        
        // Small delay between batches to be respectful to the API
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error processing batch ${i + 1}:`, error);
        // Continue with other batches even if one fails
        totalProcessed += batch.length;
      }
    }

    const successRate = totalProcessed > 0 ? resolvedCount / totalProcessed : 0;
    
    console.log(`Batched resolution completed: ${resolvedCount}/${totalProcessed} genes resolved (${(successRate * 100).toFixed(1)}%)`);

    return {
      mappings: allMappings,
      totalProcessed,
      resolvedCount,
      successRate
    };
  }

  /**
   * Enrich gene objects with STRING data using backend APIs
   * @param {Array} geneObjects - Array of gene objects from GeneSetSelector
   * @param {string} comparison - Dataset comparison name
   * @param {Object} options - Network options
   * @returns {Promise<Object>} Enrichment results with network data
   */
  async enrichGenesWithStringData(geneObjects, comparison, options = {}) {
    // Check cache first
    const cacheKey = this.generateCacheKey(geneObjects, comparison, options);
    if (this.cache.has(cacheKey)) {
      console.log(`Using cached enrichment result for ${comparison}`);
      return this.cache.get(cacheKey);
    }

    console.log(`Starting enrichment for ${comparison} with ${geneObjects.length} genes`);

    if (geneObjects.length === 0) {
      console.log('No genes provided for enrichment');
      return {
        enrichedGenes: [],
        networkData: null,
        rawNetworkData: null,
        stats: {
          totalGenes: 0,
          resolvedGenes: 0,
          networkNodes: 0,
          networkEdges: 0,
          successRate: 0
        }
      };
    }

    // Check if we have enough genes for network creation
    if (geneObjects.length < 2) {
      console.log(`Only ${geneObjects.length} gene(s) provided. STRING networks require at least 2 genes.`);
      
      // Still try to resolve identifiers for the single gene
      try {
        const geneNames = geneObjects.map(gene => gene.geneName);
        const resolutionResult = await StringBackendService.resolveIdentifiers(geneNames, 'symbol');
        const enrichedGenes = this.createEnrichedGeneObjects(geneObjects, resolutionResult.mappings);
        
        const result = {
          enrichedGenes,
          networkData: null,
          rawNetworkData: null,
          stats: {
            totalGenes: geneObjects.length,
            resolvedGenes: resolutionResult.resolvedCount,
            successRate: resolutionResult.successRate,
            networkNodes: 0,
            networkEdges: 0,
            networkId: null,
            isFromCache: false,
            error: `Network creation skipped: Only ${geneObjects.length} gene(s) provided (minimum 2 required)`
          }
        };
        
        // Cache the result
        this.cache.set(cacheKey, result);
        return result;
      } catch (error) {
        console.error('Error resolving single gene:', error);
        return {
          enrichedGenes: geneObjects,
          networkData: null,
          rawNetworkData: null,
          stats: {
            totalGenes: geneObjects.length,
            resolvedGenes: 0,
            successRate: 0,
            networkNodes: 0,
            networkEdges: 0,
            networkId: null,
            isFromCache: false,
            error: `Failed to resolve gene: ${error.message}`
          }
        };
      }
    }

    try {
      console.log(`Enriching ${geneObjects.length} genes for comparison: ${comparison}`);
      
      // Step 1: Resolve gene identifiers to get STRING IDs and basic info
      const geneNames = geneObjects.map(gene => gene.geneName);
      
      // Check identifier cache first
      const identifierCacheKey = this.generateIdentifierCacheKey(geneNames);
      let resolutionResult;
      
      if (this.identifierCache.has(identifierCacheKey)) {
        console.log(`Using cached identifier resolution for ${geneNames.length} genes`);
        resolutionResult = this.identifierCache.get(identifierCacheKey);
      } else {
        console.log(`Resolving ${geneNames.length} identifiers (STRING API call)...`);
        
        // Handle batching if we have more than 200 genes
        if (geneNames.length > 200) {
          console.log(`Large gene set (${geneNames.length} genes), using batched resolution...`);
          resolutionResult = await this.resolveIdentifiersInBatches(geneNames, 'symbol');
        } else {
          resolutionResult = await StringBackendService.resolveIdentifiers(geneNames, 'symbol');
        }
        
        // Cache the identifier resolution result
        this.identifierCache.set(identifierCacheKey, resolutionResult);
        console.log(`Cached identifier resolution for ${geneNames.length} genes`);
      }
      
      console.log(`Resolved ${resolutionResult.resolvedCount}/${resolutionResult.totalProcessed} genes (${(resolutionResult.successRate * 100).toFixed(1)}%)`);
      
      // Step 2: Create enriched gene objects with resolution data
      const enrichedGenes = this.createEnrichedGeneObjects(geneObjects, resolutionResult.mappings);
      
      // Step 3: Create network using backend (handles caching automatically)
      const networkResult = await this.createNetworkWithBackend(comparison, geneNames, enrichedGenes, options);
      
      // Step 4: Convert network data to Cytoscape format if available
      let cytoscapeData = null;
      if (networkResult.networkData && networkResult.networkData.edges && networkResult.networkData.edges.length > 0) {
        cytoscapeData = convertToCytoscapeFormat(
          networkResult.networkData.edges, 
          enrichedGenes
        );
      }
      
      // Step 5: Calculate comprehensive statistics
      const stats = {
        totalGenes: geneObjects.length,
        resolvedGenes: resolutionResult.resolvedCount,
        successRate: resolutionResult.successRate,
        networkNodes: networkResult.networkData?.nodeCount || 0,
        networkEdges: networkResult.networkData?.edgeCount || 0,
        networkId: networkResult.networkData?.id || null,
        isFromCache: networkResult.isFromCache || false
      };
      
      console.log('Enrichment completed:', stats);
      
      const result = {
        enrichedGenes,
        networkData: cytoscapeData,
        rawNetworkData: networkResult.networkData,
        stats
      };

      // Cache the result for future use
      this.cache.set(cacheKey, result);
      console.log(`Cached enrichment result for ${comparison}`);
      
      return result;

    } catch (error) {
      console.error('Error enriching genes with STRING data:', error);
      
      // Return partial results with error information
      return {
        enrichedGenes: geneObjects, // Return original genes as fallback
        networkData: null,
        rawNetworkData: null,
        stats: {
          totalGenes: geneObjects.length,
          resolvedGenes: 0,
          networkNodes: 0,
          networkEdges: 0,
          successRate: 0,
          error: error.message
        }
      };
    }
  }

  /**
   * Create enriched gene objects with STRING resolution data
   * @param {Array} geneObjects - Original gene objects
   * @param {Array} mappings - Resolution mappings from backend
   * @returns {Array} Enriched gene objects
   */
  createEnrichedGeneObjects(geneObjects, mappings) {
    const mappingLookup = new Map();
    mappings.forEach(mapping => {
      mappingLookup.set(mapping.inputId, mapping);
    });

    return geneObjects.map(gene => {
      const mapping = mappingLookup.get(gene.geneName);
      
      if (mapping && mapping.isResolved) {
        return {
          ...gene, // Keep all original gene data (log2fc, padj, expression, etc.)
          stringId: mapping.stringId,
          preferredName: mapping.preferredName,
          isResolved: true
        };
      } else {
        return {
          ...gene, // Keep all original gene data
          stringId: null,
          preferredName: gene.geneName,
          isResolved: false,
          resolutionError: mapping?.errorMessage || 'Failed to resolve identifier'
        };
      }
    });
  }

  /**
   * Create network using backend API (handles caching automatically)
   * @param {string} comparison - Dataset comparison name
   * @param {Array} geneNames - Array of gene names
   * @param {Array} enrichedGenes - Enriched gene objects
   * @param {Object} options - Network options
   * @returns {Promise<Object>} Network data and metadata
   */
  async createNetworkWithBackend(comparison, geneNames, enrichedGenes, options) {
    try {
      console.log(`Creating network via backend API with ${geneNames.length} genes...`);
      
      // Handle batching if we have more than 200 genes
      if (geneNames.length > 200) {
        console.log(`Large gene set (${geneNames.length} genes), using batched network creation...`);
        return await this.createNetworkInBatches(comparison, geneNames, options);
      } else {
        // Call backend to create network (backend handles caching automatically)
        const networkData = await StringBackendService.createNetwork(
          comparison,
          geneNames,
          {
            confidenceThreshold: options.confidenceThreshold || 400,
            networkType: options.networkType || 'full'
          }
        );
        
        console.log(`Network created with ID: ${networkData.id}, Nodes: ${networkData.nodeCount}, Edges: ${networkData.edgeCount}`);
        
        return {
          networkData,
          isFromCache: false // Backend doesn't tell us if it was cached, but response time will be fast if cached
        };
      }
      
    } catch (error) {
      console.error('Error creating network via backend:', error);
      
      // Return empty network data on error
      return {
        networkData: null,
        isFromCache: false,
        error: error.message
      };
    }
  }

  // Create network in batches to handle large gene sets
  async createNetworkInBatches(comparison, geneNames, options, batchSize = 200) {
    const batches = [];
    for (let i = 0; i < geneNames.length; i += batchSize) {
      batches.push(geneNames.slice(i, i + batchSize));
    }

    console.log(`Creating network with ${batches.length} batches of up to ${batchSize} genes each`);

    // For network creation, we'll use the largest batch that has enough genes
    // This is a simplified approach - in practice, you might want to merge multiple smaller networks
    let bestNetwork = null;
    let bestBatchSize = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Attempting network creation with batch ${i + 1}/${batches.length} (${batch.length} genes)`);
      
      try {
        const networkData = await StringBackendService.createNetwork(
          comparison,
          batch,
          {
            confidenceThreshold: options.confidenceThreshold || 400,
            networkType: options.networkType || 'full'
          }
        );
        
        // Keep track of the best network (largest or most connected)
        if (!bestNetwork || networkData.edgeCount > bestNetwork.edgeCount) {
          bestNetwork = networkData;
          bestBatchSize = batch.length;
        }
        
        console.log(`Batch ${i + 1} successful: ${networkData.nodeCount} nodes, ${networkData.edgeCount} edges`);
        
        // Small delay between batches
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
      } catch (error) {
        console.error(`Error creating network for batch ${i + 1}:`, error);
        // Continue with other batches
      }
    }

    if (bestNetwork) {
      console.log(`Best network selected: ${bestNetwork.nodeCount} nodes, ${bestNetwork.edgeCount} edges (from batch of ${bestBatchSize} genes)`);
      return {
        networkData: bestNetwork,
        isFromCache: false
      };
    } else {
      throw new Error('Failed to create network from any batch');
    }
  }

  /**
   * Get enrichment statistics for display (backward compatibility)
   * @param {Array} originalGenes - Original gene objects
   * @param {Array} enrichedGenes - Enriched gene objects
   * @returns {Object} Enrichment statistics
   */
  getEnrichmentStats(originalGenes, enrichedGenes) {
    const totalGenes = originalGenes.length;
    const resolvedGenes = enrichedGenes.filter(gene => gene.isResolved).length;
    const successRate = totalGenes > 0 ? resolvedGenes / totalGenes : 0;
    
    return {
      totalGenes,
      resolvedGenes,
      unresolvedGenes: totalGenes - resolvedGenes,
      successRate: Math.round(successRate * 1000) / 1000 // Round to 3 decimal places
    };
  }

  /**
   * Get network statistics for a specific comparison
   * @param {string} comparison - Dataset comparison name
   * @returns {Promise<Object>} Network statistics
   */
  async getNetworkStats(comparison) {
    try {
      const queryResult = await StringBackendService.queryNetworks({
        comparison,
        isSuccessful: true,
        page: 1,
        limit: 100 // Get all networks for this comparison
      });
      
      const networks = queryResult.networks;
      const totalNetworks = networks.length;
      const totalNodes = networks.reduce((sum, net) => sum + (net.nodeCount || 0), 0);
      const totalEdges = networks.reduce((sum, net) => sum + (net.edgeCount || 0), 0);
      
      return {
        totalNetworks,
        totalNodes,
        totalEdges,
        averageNodes: totalNetworks > 0 ? Math.round(totalNodes / totalNetworks) : 0,
        averageEdges: totalNetworks > 0 ? Math.round(totalEdges / totalNetworks) : 0
      };
    } catch (error) {
      console.error('Error getting network stats:', error);
      return {
        totalNetworks: 0,
        totalNodes: 0,
        totalEdges: 0,
        averageNodes: 0,
        averageEdges: 0
      };
    }
  }
}

// Export singleton instance
export default new EnhancedGeneEnrichmentService();
