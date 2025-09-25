import axios from 'axios';
import { parseTsvResponse, getConfidenceLevel, convertToCytoscapeFormat } from './StringDataUtils.js';

/**
 * Service class for interacting with STRING API
 * Handles network data fetching, identifier resolution, and enrichment analysis
 */
class StringApiService {
  constructor() {
    // STRING API base URL
    this.baseURL = 'https://string-db.org/api';
    
    // Default parameters for API calls
    this.defaultParams = {
      species: 10090, // Mus musculus (mouse)
      format: 'json',
      required_score: 400, // Medium confidence threshold (0-1000 scale for API)
    };
  }

  /**
   * Resolve gene identifiers to STRING IDs
   * @param {Array} identifiers - Array of gene identifiers
   * @param {string} fromFormat - Input format (e.g., 'symbol', 'ensembl')
   * @returns {Promise<Object>} Resolved identifiers
   */
  async resolveIdentifiers(identifiers, fromFormat = 'symbol') {
    try {
      const response = await axios.get(`${this.baseURL}/tsv/get_string_ids`, {
        params: {
          identifiers: identifiers.join('\n'), // Use newlines, not commas
          species: this.defaultParams.species,
          limit: 1,
          echo_query: 1,
          caller_identity: 'eif5a-visualization-app'
        }
      });
      
      return parseTsvResponse(response.data);
    } catch (error) {
      console.error('Error resolving identifiers:', error);
      throw new Error(`Failed to resolve identifiers: ${error.message}`);
    }
  }

  /**
   * Get protein-protein interaction network
   * @param {Array} identifiers - Array of STRING identifiers
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Network data
   */
  async getNetwork(identifiers, options = {}) {
    try {
      const params = {
        identifiers: identifiers.join('\n'),
        species: this.defaultParams.species,
        required_score: options.confidenceThreshold || this.defaultParams.required_score,
        network_type: options.networkType || 'full',
        caller_identity: 'eif5a-visualization-app'
      };

      const response = await axios.get(`${this.baseURL}/tsv/network`, {
        params
      });

      return parseTsvResponse(response.data);
    } catch (error) {
      console.error('Error fetching network:', error);
      throw new Error(`Failed to fetch network: ${error.message}`);
    }
  }

  /**
   * Get functional enrichment analysis
   * @param {Array} identifiers - Array of STRING identifiers
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Enrichment data
   */
  async getEnrichment(identifiers, options = {}) {
    try {
      const params = {
        identifiers: identifiers.join('\n'),
        species: this.defaultParams.species,
        caller_identity: 'eif5a-visualization-app'
      };

      const response = await axios.get(`${this.baseURL}/tsv/enrichment`, {
        params
      });

      return parseTsvResponse(response.data);
    } catch (error) {
      console.error('Error fetching enrichment:', error);
      throw new Error(`Failed to fetch enrichment: ${error.message}`);
    }
  }

  /**
   * Get protein information
   * @param {Array} identifiers - Array of STRING identifiers
   * @returns {Promise<Object>} Protein information
   */
  async getFunctionalAnnotation(identifiers) {
    try {
      const params = {
        identifiers: identifiers.join('\n'),
        species: this.defaultParams.species,
        caller_identity: 'eif5a-visualization-app'
      };

      const response = await axios.get(`${this.baseURL}/tsv/functional_annotation`, {
        params
      });

      return parseTsvResponse(response.data);
    } catch (error) {
      console.error('Error fetching protein info:', error);
      throw new Error(`Failed to fetch protein info: ${error.message}`);
    }
  }

}

// Export singleton instance
export default new StringApiService();
