import axios from 'axios';

/**
 * Service for interacting with the new STRING backend APIs
 * Replaces direct STRING API calls with our backend endpoints
 * 
 * Key Benefits:
 * - Intelligent caching (same gene set = instant response)
 * - Persistent storage of networks
 * - Better error handling and logging
 * - Consistent data format
 */
class StringBackendService {
  constructor() {
    // Backend API base URL
    const apiBase =
      import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api';
    this.baseURL = `${apiBase.replace(/\/$/, '')}/string`;
  }

  /**
   * Create a new STRING network from a gene set
   * Backend automatically handles caching - same gene set returns existing network instantly
   * @param {string} comparison - Dataset comparison name
   * @param {Array} geneSet - Array of gene names
   * @param {Object} options - Network options
   * @returns {Promise<Object>} Complete network data (cached or newly created)
   */
  async createNetwork(comparison, geneSet, options = {}) {
    try {
      const requestData = {
        comparison,
        geneSet,
        confidenceThreshold: options.confidenceThreshold || 400,
        networkType: options.networkType || 'full'
      };

      console.log(`Creating network for ${comparison} with ${geneSet.length} genes`);
      
      const response = await axios.post(`${this.baseURL}/networks`, requestData, {
        timeout: 120000 // 2 minute timeout for network creation
      });

      return response.data;
    } catch (error) {
      console.error('Error creating network:', error);
      throw new Error(`Failed to create network: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Resolve gene identifiers to STRING IDs
   * @param {Array} identifiers - Array of gene names
   * @param {string} fromFormat - Input format (default: 'symbol')
   * @returns {Promise<Object>} Resolution results with statistics
   */
  async resolveIdentifiers(identifiers, fromFormat = 'symbol') {
    try {
      const requestData = {
        identifiers,
        fromFormat,
        species: '10090' // Mus musculus (mouse)
      };

      console.log(`Resolving ${identifiers.length} identifiers from format: ${fromFormat}`);
      
      const response = await axios.post(`${this.baseURL}/resolve-identifiers`, requestData, {
        timeout: 30000 // 30 second timeout
      });

      return response.data;
    } catch (error) {
      console.error('Error resolving identifiers:', error);
      throw new Error(`Failed to resolve identifiers: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Query existing networks with filtering
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>} Paginated network results
   */
  async queryNetworks(queryParams = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add query parameters
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      console.log('Querying networks with params:', queryParams);
      
      const response = await axios.get(`${this.baseURL}/networks?${params.toString()}`, {
        timeout: 10000 // 10 second timeout
      });

      return response.data;
    } catch (error) {
      console.error('Error querying networks:', error);
      throw new Error(`Failed to query networks: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get a specific network by ID
   * @param {number} networkId - Network database ID
   * @param {boolean} includeData - Whether to include network data
   * @returns {Promise<Object>} Network data
   */
  async getNetworkById(networkId, includeData = false) {
    try {
      const params = includeData ? '?includeData=true' : '';
      
      console.log(`Getting network ${networkId}, includeData: ${includeData}`);
      
      const response = await axios.get(`${this.baseURL}/networks/${networkId}${params}`, {
        timeout: 10000 // 10 second timeout
      });

      return response.data;
    } catch (error) {
      console.error('Error getting network by ID:', error);
      throw new Error(`Failed to get network: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get STRING service statistics
   * @returns {Promise<Object>} Service statistics
   */
  async getStatistics() {
    try {
      const response = await axios.get(`${this.baseURL}/stats`, {
        timeout: 5000 // 5 second timeout
      });

      return response.data;
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw new Error(`Failed to get statistics: ${error.response?.data?.message || error.message}`);
    }
  }

}

// Export singleton instance
export default new StringBackendService();
