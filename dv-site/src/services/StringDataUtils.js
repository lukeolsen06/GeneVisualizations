/**
 * Utility functions for STRING API data processing
 * Contains helper functions for parsing, converting, and processing STRING API responses
 */

/**
 * Parse TSV response from STRING API
 * @param {string} tsvData - TSV formatted data
 * @returns {Array} Parsed data as array of objects
 */
export function parseTsvResponse(tsvData) {
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
 * Get confidence level based on score
 * @param {number} score - Interaction score
 * @returns {string} Confidence level
 */
export function getConfidenceLevel(score) {
  if (score >= 700) return 'high';
  if (score >= 400) return 'medium';
  return 'low';
}

/**
 * Convert network data to Cytoscape format
 * @param {Array} networkData - Network data from STRING API
 * @param {Array} proteinInfo - Protein info data - empty at start but nodes with protein info will be added to this array
 * @returns {Object} Cytoscape-compatible data
 */
export function convertToCytoscapeFormat(networkData, proteinInfo = []) {
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
        confidence: getConfidenceLevel(score)
      }
    });
  });

  return {
    nodes: Array.from(nodes.values()),
    edges: edges
  };
}

// Export all utility functions as named exports and as default object
export default {
  parseTsvResponse,
  getConfidenceLevel,
  convertToCytoscapeFormat
};
