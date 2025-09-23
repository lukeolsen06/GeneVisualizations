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
 * @param {Array} enrichedGenes - Enriched gene objects with all data
 * @returns {Object} Cytoscape-compatible data
 */
export function convertToCytoscapeFormat(networkData, enrichedGenes = []) {
  const nodes = new Map();
  const edges = [];

  // Create enriched genes lookup by STRING ID
  const geneLookup = new Map();
  enrichedGenes.forEach(gene => {
    if (gene.stringId) {
      geneLookup.set(gene.stringId, gene);
    }
  });

  // Process network data to extract nodes and edges
  networkData.forEach(interaction => {
    const sourceId = interaction['preferredName_A'] || interaction['stringId_A']; // if there is a preferred name, use it, otherwise use the string id
    const targetId = interaction['preferredName_B'] || interaction['stringId_B'];
    const score = parseFloat(interaction['score']) || 0;

    // Add source node
    if (!nodes.has(sourceId)) {
      const enrichedGene = geneLookup.get(interaction['stringId_A']);
      nodes.set(sourceId, {
        data: {
          id: sourceId,
          stringId: interaction['stringId_A'],
          ...(enrichedGene && {
            log2fc: enrichedGene.log2fc,
            padj: enrichedGene.padj,
            expression: enrichedGene.expression,
            annotation: enrichedGene.annotation,
            functionalTerms: enrichedGene.functionalTerms
          })
        }
      });
    }

    // Add target node
    if (!nodes.has(targetId)) {
      const enrichedGene = geneLookup.get(interaction['stringId_B']);
      nodes.set(targetId, {
        data: {
          id: targetId,
          stringId: interaction['stringId_B'],
          ...(enrichedGene && {
            log2fc: enrichedGene.log2fc,
            padj: enrichedGene.padj,
            expression: enrichedGene.expression,
            annotation: enrichedGene.annotation,
            functionalTerms: enrichedGene.functionalTerms
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
