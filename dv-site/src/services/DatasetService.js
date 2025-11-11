/**
 * Dataset Service
 * 
 * This service handles all communication with the NestJS backend API
 * for RNA-seq dataset operations. It replaces static JSON imports
 * with dynamic API calls.
 * 
 * Key Concepts:
 * - Centralized API communication
 * - Consistent error handling
 * - Easy to mock for testing
 * - Single source of truth for API endpoints
 * 
 * Usage Example:
 *   import DatasetService from './services/DatasetService';
 *   
 *   const datasets = await DatasetService.getAvailableDatasets();
 *   const volcanoData = await DatasetService.getVolcanoPlotData('eIF5A_DDvsWT_EC');
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
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'
).replace(/\/$/, '');

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
 * @param {string} endpoint - API endpoint (e.g., '/datasets')
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
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
}

// ============================================================================
// PUBLIC API METHODS
// ============================================================================

/**
 * Dataset Service API
 * 
 * All methods are async and return Promises.
 * Use try/catch or .catch() to handle errors in your components.
 */
const DatasetService = {
  
  /**
   * Get list of all available datasets
   * 
   * This replaces the hardcoded dropdown options in your components.
   * 
   * Example Response:
   *   ["eIF5A_DDvsWT_EC", "DHS_DOHHvsTar4_EC", ...]
   * 
   * Usage:
   *   const datasets = await DatasetService.getAvailableDatasets();
   *   // Use in dropdown: datasets.map(name => <option value={name}>{name}</option>)
   * 
   * @returns {Promise<string[]>} Array of dataset names
   */
  async getAvailableDatasets() {
    return await apiFetch('/datasets');
  },

  /**
   * Get metadata about a specific dataset
   * 
   * Useful for displaying dataset information before loading full data.
   * 
   * Example Response:
   *   {
   *     name: "eIF5A_DDvsWT_EC",
   *     totalGenes: 4562
   *   }
   * 
   * Usage:
   *   const info = await DatasetService.getDatasetInfo('eIF5A_DDvsWT_EC');
   *   console.log(`Dataset has ${info.totalGenes} genes`);
   * 
   * @param {string} comparison - Dataset comparison name
   * @returns {Promise<{name: string, totalGenes: number}>}
   */
  async getDatasetInfo(comparison) {
    return await apiFetch(`/datasets/${comparison}`);
  },

  /**
   * Get volcano plot data for a specific dataset
   * 
   * This is the main method that replaces your static JSON imports.
   * Returns lightweight data optimized for plotting (only 5 fields).
   * 
   * Example Response:
   *   [
   *     {
   *       geneId: "ENSMUSG00000028393",
   *       geneName: "Prl",
   *       log2FoldChange: 7.564789568,
   *       pvalue: 0.0000000677,
   *       padj: 0.000396986
   *     },
   *     // ... more genes
   *   ]
   * 
   * Usage:
   *   const data = await DatasetService.getVolcanoPlotData('eIF5A_DDvsWT_EC', 5000);
   *   // Use data for Plotly or D3 visualization
   * 
   * @param {string} comparison - Dataset comparison name
   * @param {number} [limit=5000] - Maximum number of genes to return
   * @returns {Promise<Array>} Array of gene objects with volcano plot fields
   */
  async getVolcanoPlotData(comparison, limit = 5000) {
    const params = new URLSearchParams({ limit: limit.toString() });
    return await apiFetch(`/datasets/${comparison}/genes/volcano?${params}`);
  },

  /**
   * Search for genes by name
   * 
   * Useful for autocomplete, quick lookup, or finding specific genes.
   * Case-insensitive partial matching.
   * 
   * Example Response:
   *   [
   *     {
   *       geneId: "ENSMUSG00000021342",
   *       geneName: "Prl",
   *       geneChr: "13",
   *       log2FoldChange: 7.564789568,
   *       pvalue: 0.0000000677,
   *       padj: 0.000396986,
   *       // ... full gene entity
   *     }
   *   ]
   * 
   * Usage:
   *   const results = await DatasetService.searchGenes('eIF5A_DDvsWT_EC', 'Prl', 10);
   *   // Display results in dropdown or list
   * 
   * @param {string} comparison - Dataset comparison name
   * @param {string} query - Gene name to search for
   * @param {number} [limit=20] - Maximum results to return
   * @returns {Promise<Array>} Array of matching genes (full entities)
   */
  async searchGenes(comparison, query, limit = 20) {
    const params = new URLSearchParams({ query, limit: limit.toString() });
    return await apiFetch(`/datasets/${comparison}/genes/search?${params}`);
  },

  /**
   * Get filtered genes based on criteria
   * 
   * Advanced filtering for finding significant genes, upregulated genes, etc.
   * 
   * Example Response:
   *   [
   *     {
   *       geneId: "ENSMUSG00000021342",
   *       geneName: "Prl",
   *       log2FoldChange: 7.564789568,
   *       pvalue: 0.0000000677,
   *       padj: 0.000396986,
   *       // ... full gene entity
   *     }
   *   ]
   * 
   * Usage:
   *   const significantGenes = await DatasetService.getFilteredGenes('eIF5A_DDvsWT_EC', {
   *     padj: 0.05,
   *     log2fc: 2,
   *     direction: 'up',
   *     limit: 100
   *   });
   * 
   * @param {string} comparison - Dataset comparison name
   * @param {Object} filters - Filter criteria
   * @param {number} [filters.pvalue] - P-value threshold
   * @param {number} [filters.padj] - Adjusted p-value threshold
   * @param {number} [filters.log2fc] - Log2 fold change threshold (absolute value)
   * @param {string} [filters.direction] - 'up', 'down', or 'both'
   * @param {number} [filters.limit] - Maximum results
   * @returns {Promise<Array>} Array of filtered genes (full entities)
   */
  async getFilteredGenes(comparison, filters = {}) {
    const params = new URLSearchParams();
    
    // Add each filter to query params if provided
    if (filters.pvalue !== undefined) params.append('pvalue', filters.pvalue);
    if (filters.padj !== undefined) params.append('padj', filters.padj);
    if (filters.log2fc !== undefined) params.append('log2fc', filters.log2fc);
    if (filters.direction) params.append('direction', filters.direction);
    if (filters.limit) params.append('limit', filters.limit);

    return await apiFetch(`/datasets/${comparison}/genes/filtered?${params}`);
  },

  /**
   * Get basic gene list with pagination
   * 
   * Returns full gene entities (14 fields). Use this when you need
   * complete gene information including genomic coordinates, biotype, etc.
   * 
   * Example Response:
   *   [
   *     {
   *       geneId: "ENSMUSG00000028393",
   *       geneName: "Alad",
   *       geneChr: "4",
   *       geneStart: "60387984",
   *       geneEnd: "60403682",
   *       geneStrand: "+",
   *       geneLength: 5437,
   *       geneBiotype: "protein_coding",
   *       geneDescription: "aminolevulinate, delta-, dehydratase...",
   *       tfFamily: "-",
   *       log2FoldChange: 0.95255163,
   *       pvalue: 0.0000000123,
   *       padj: 0.00022605,
   *       log10Padj: 3.6458
   *     }
   *   ]
   * 
   * @param {string} comparison - Dataset comparison name
   * @param {number} [limit=100] - Maximum results
   * @returns {Promise<Array>} Array of gene objects (full entities)
   */
  async getGenes(comparison, limit = 100) {
    const params = new URLSearchParams({ limit: limit.toString() });
    return await apiFetch(`/datasets/${comparison}/genes?${params}`);
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export default DatasetService;

