import axios from 'axios';

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
      required_score: 400, // Medium confidence threshold
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
      
      return this.parseTsvResponse(response.data);
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
        identifiers: identifiers.join(','),
        species: this.defaultParams.species,
        required_score: options.confidenceThreshold || this.defaultParams.required_score,
        network_type: options.networkType || 'full',
        caller_identity: 'eif5a-visualization-app'
      };

      const response = await axios.get(`${this.baseURL}/tsv/network`, {
        params
      });

      return this.parseTsvResponse(response.data);
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
        identifiers: identifiers.join(','),
        species: this.defaultParams.species,
        caller_identity: 'eif5a-visualization-app'
      };

      const response = await axios.get(`${this.baseURL}/tsv/enrichment`, {
        params
      });

      return this.parseTsvResponse(response.data);
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
  async getProteinInfo(identifiers) {
    try {
      const params = {
        identifiers: identifiers.join(','),
        species: this.defaultParams.species,
        caller_identity: 'eif5a-visualization-app'
      };

      const response = await axios.get(`${this.baseURL}/tsv/protein_info`, {
        params
      });

      return this.parseTsvResponse(response.data);
    } catch (error) {
      console.error('Error fetching protein info:', error);
      throw new Error(`Failed to fetch protein info: ${error.message}`);
    }
  }

  /**
   * Parse TSV response from STRING API
   * @param {string} tsvData - TSV formatted data
   * @returns {Array} Parsed data as array of objects
   */
  parseTsvResponse(tsvData) {
    const lines = tsvData.trim().split('\n');
    const headers = lines[0].split('\t');
    
    return lines.slice(1).map(line => {
      const values = line.split('\t');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  }

  /**
   * Convert network data to Cytoscape format
   * @param {Array} networkData - Network data from STRING API
   * @param {Array} proteinInfo - Protein information data
   * @returns {Object} Cytoscape-compatible data
   */
  convertToCytoscapeFormat(networkData, proteinInfo = []) {
    const nodes = new Map();
    const edges = [];

    // Create protein info lookup
    const proteinLookup = new Map();
    proteinInfo.forEach(protein => {
      proteinLookup.set(protein.stringId, protein);
    });

    // Process network data to extract nodes and edges
    networkData.forEach(interaction => {
      const sourceId = interaction['preferredName_A'] || interaction['stringId_A'];
      const targetId = interaction['preferredName_B'] || interaction['stringId_B'];
      const score = parseFloat(interaction['score']) || 0;

      // Add source node
      if (!nodes.has(sourceId)) {
        const protein = proteinLookup.get(interaction['stringId_A']);
        nodes.set(sourceId, {
          data: {
            id: sourceId,
            label: sourceId,
            stringId: interaction['stringId_A'],
            ...(protein && {
              description: protein.description,
              chromosome: protein.chromosome,
              annotation: protein.annotation
            })
          }
        });
      }

      // Add target node
      if (!nodes.has(targetId)) {
        const protein = proteinLookup.get(interaction['stringId_B']);
        nodes.set(targetId, {
          data: {
            id: targetId,
            label: targetId,
            stringId: interaction['stringId_B'],
            ...(protein && {
              description: protein.description,
              chromosome: protein.chromosome,
              annotation: protein.annotation
            })
          }
        });
      }

      // Add edge
      edges.push({
        data: {
          id: `${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          score: score,
          confidence: this.getConfidenceLevel(score)
        }
      });
    });

    return {
      nodes: Array.from(nodes.values()),
      edges: edges
    };
  }

  /**
   * Get confidence level based on score
   * @param {number} score - Interaction score
   * @returns {string} Confidence level
   */
  getConfidenceLevel(score) {
    if (score >= 700) return 'high';
    if (score >= 400) return 'medium';
    return 'low';
  }
}

// Export singleton instance
export default new StringApiService();
