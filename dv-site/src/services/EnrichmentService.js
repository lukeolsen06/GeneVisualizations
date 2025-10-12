/**
 * Enrichment Service
 * 
 * This service handles all communication with the NestJS backend API
 * for gene enrichment data operations (KEGG, Reactome, WikiPathways).
 * 
 * Purpose:
 * - Centralized API communication for enrichment data
 * - Replaces static JSON imports from barCharts enrichment JSON files
 * - Provides methods for querying pathway enrichment results
 * - Consistent error handling across all enrichment API calls
 * 
 * Key Concepts:
 * - Single source of truth for enrichment API endpoints
 * - Easy to mock for testing
 * - Consistent error handling
 * - JSDoc documentation for IDE autocomplete
 * 
 * Usage Example:
 *   import EnrichmentService from './services/EnrichmentService';
 *   
 *   // Get KEGG pathways for a specific comparison
 *   const pathways = await EnrichmentService.getEnrichmentData(
 *     'eIF5A_DDvsWT_EC', 
 *     'KEGG'
 *   );
 *   
 *   // Get available datasets
 *   const datasets = await EnrichmentService.getAvailableComparisons();
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Base URL for the API
 * 
 * In development: http://localhost:3001/api
 * In production: This would be your deployed backend URL
 * 
 * You can use environment variables to switch between environments:
 * const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
 */
const API_BASE_URL = 'http://localhost:3001/api';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generic fetch wrapper with error handling
 * 
 * This function:
 * 1. Makes the HTTP request
 * 2. Handles network errors
 * 3. Parses JSON response
 * 4. Throws user-friendly errors
 * 
 * @param {string} endpoint - API endpoint (e.g., '/enrichment')
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} If request fails or returns non-2xx status
 */
async function apiFetch(endpoint, options = {}) {
  try {
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Check if response is ok (status 200-299)
    if (!response.ok) {
      // Try to parse error message from backend
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    // Parse and return JSON
    return await response.json();
  } catch (error) {
    // Network error or JSON parsing error
    console.error('API Request failed:', error);
    throw new Error(`Failed to fetch enrichment data: ${error.message}`);
  }
}

// ============================================================================
// PUBLIC API METHODS
// ============================================================================

/**
 * Enrichment Service API
 * 
 * All methods are async and return Promises.
 * Use try/catch or .catch() to handle errors in your components.
 */
const EnrichmentService = {
  
  /**
   * Get enrichment data with optional filtering
   * 
   * Retrieves gene enrichment analysis results (pathways) for a specific
   * dataset comparison and database. Supports filtering by FDR threshold
   * and sorting options.
   * 
   * Example Response:
   *   [
   *     {
   *       comparison: "eIF5A_DDvsWT_EC",
   *       database: "KEGG",
   *       termId: "mmu03010",
   *       termDescription: "Ribosome",
   *       genesMapped: 73,
   *       enrichmentScore: 1.47706,
   *       direction: "bottom",
   *       falseDiscoveryRate: 0.0000000000000000000000000584,
   *       method: "ks",
   *       matchingProteinLabels: "Rpl13,Mrpl2,Mrpl4,..."
   *     },
   *     // ... more pathways
   *   ]
   * 
   * Usage:
   *   // Get all KEGG pathways for a comparison
   *   const pathways = await EnrichmentService.getEnrichmentData(
   *     'eIF5A_DDvsWT_EC', 
   *     'KEGG'
   *   );
   *   
   *   // Get significant pathways (FDR < 0.05)
   *   const significant = await EnrichmentService.getEnrichmentData(
   *     'eIF5A_DDvsWT_EC',
   *     'KEGG',
   *     { fdr_threshold: 0.05, limit: 20 }
   *   );
   * 
   * @param {string} comparison - Dataset comparison name (e.g., 'eIF5A_DDvsWT_EC')
   * @param {string} database - Enrichment database ('KEGG', 'Reactome', 'WikiPathways')
   * @param {Object} [options] - Optional filtering/sorting parameters
   * @param {number} [options.fdr_threshold] - Maximum FDR value (e.g., 0.05)
   * @param {string} [options.sort_by] - Sort field ('fdr', 'enrichment_score', 'genes_mapped')
   * @param {string} [options.sort_order] - Sort order ('ASC', 'DESC')
   * @param {number} [options.limit] - Maximum results (default 100, max 500)
   * @returns {Promise<Array>} Array of enrichment pathway objects
   */
  async getEnrichmentData(comparison, database, options = {}) {
    const params = new URLSearchParams();
    
    // Add required parameters
    if (comparison) params.append('comparison', comparison);
    if (database) params.append('database', database);
    
    // Add optional filtering parameters
    if (options.fdr_threshold !== undefined) {
      params.append('fdr_threshold', options.fdr_threshold.toString());
    }
    if (options.sort_by) params.append('sort_by', options.sort_by);
    if (options.sort_order) params.append('sort_order', options.sort_order);
    if (options.limit) params.append('limit', options.limit.toString());
    
    return await apiFetch(`/enrichment?${params}`);
  },

  /**
   * Get list of available dataset comparisons
   * 
   * Returns all dataset comparisons that have enrichment data.
   * Useful for populating dropdown menus or validating user input.
   * 
   * Example Response:
   *   {
   *     comparisons: [
   *       "eIF5A_DDvsWT_EC",
   *       "DHS_DOHHvsTar4_EC",
   *       "K50A_DDvsWT_EC",
   *       ...
   *     ]
   *   }
   * 
   * Usage:
   *   const { comparisons } = await EnrichmentService.getAvailableComparisons();
   *   // Use in dropdown: comparisons.map(name => <option value={name}>{name}</option>)
   * 
   * @returns {Promise<{comparisons: string[]}>} Object with comparisons array
   */
  async getAvailableComparisons() {
    return await apiFetch('/enrichment/comparisons');
  },

  /**
   * Get list of available enrichment databases
   * 
   * Returns the databases that have enrichment data.
   * Should return: ['KEGG', 'Reactome', 'WikiPathways']
   * 
   * Example Response:
   *   {
   *     databases: ["KEGG", "Reactome", "WikiPathways"]
   *   }
   * 
   * Usage:
   *   const { databases } = await EnrichmentService.getAvailableDatabases();
   *   // Use for filter buttons or validation
   * 
   * @returns {Promise<{databases: string[]}>} Object with databases array
   */
  async getAvailableDatabases() {
    return await apiFetch('/enrichment/databases');
  },

  /**
   * Get enrichment data statistics
   * 
   * Returns summary information about the enrichment data,
   * including total records, counts by database, and counts by comparison.
   * 
   * Example Response:
   *   {
   *     totalRecords: 704,
   *     uniqueComparisons: 13,
   *     recordsByDatabase: {
   *       KEGG: 243,
   *       Reactome: 400,
   *       WikiPathways: 61
   *     },
   *     recordsByComparison: {
   *       "eIF5A_DDvsWT_EC": 56,
   *       "DHS_DOHHvsTar4_EC": 79,
   *       ...
   *     }
   *   }
   * 
   * Usage:
   *   const stats = await EnrichmentService.getEnrichmentStats();
   *   console.log(`Total pathways: ${stats.totalRecords}`);
   *   console.log(`KEGG pathways: ${stats.recordsByDatabase.KEGG}`);
   * 
   * @returns {Promise<Object>} Statistics object
   */
  async getEnrichmentStats() {
    return await apiFetch('/enrichment/stats');
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export default EnrichmentService;
