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

    if (geneObjects.length === 0) {
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
        resolutionResult = await StringBackendService.resolveIdentifiers(geneNames, 'symbol');
        
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
      console.log('Creating network via backend API...');
      
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
