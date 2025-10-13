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
 * @param {number} score - Interaction score (0-1 scale from STRING API)
 * @returns {string} Confidence level
 */
export function getConfidenceLevel(score) {
  if (score >= 0.7) return 'high';    // 0.7 = 700/1000
  if (score >= 0.4) return 'medium';  // 0.4 = 400/1000
  return 'low';
}

/**
 * Convert network data to Cytoscape format
 * @param {Array} networkData - Network data from STRING API or backend
 * @param {Array} enrichedGenes - Enriched gene objects with all data
 * @returns {Object} Cytoscape-compatible data
 */
export function convertToCytoscapeFormat(networkData, enrichedGenes = []) {

  const nodes = new Map();
  const edges = [];

  // Create enriched genes lookup by STRING ID and gene name
  const geneLookup = new Map();
  enrichedGenes.forEach(gene => {
    if (gene.stringId) {
      geneLookup.set(gene.stringId, gene);
    }
    if (gene.geneName) {
      geneLookup.set(gene.geneName, gene);
    }
  });

  // Process network data to extract nodes and edges
  networkData.forEach(interaction => {
    // Handle both old STRING API format and new backend format
    let sourceId, targetId, score;
    
    if (interaction.sourceGeneName && interaction.targetGeneName) {
      // New backend format
      sourceId = interaction.sourceGeneName;
      targetId = interaction.targetGeneName;
      score = parseFloat(interaction.interactionScore) || 0;
    } else {
      // Old STRING API format
      sourceId = interaction['preferredName_A'] || interaction['stringId_A'];
      targetId = interaction['preferredName_B'] || interaction['stringId_B'];
      score = parseFloat(interaction['score']) || 0;
    }

    // Add source node
    if (!nodes.has(sourceId)) {
      // Try to find enriched gene data by gene name or STRING ID
      let enrichedGene = geneLookup.get(sourceId);
      if (!enrichedGene) {
        enrichedGene = geneLookup.get(interaction.sourceStringId || interaction['stringId_A']);
      }
      
      const nodeData = {
        data: {
          id: sourceId,
          stringId: interaction.sourceStringId || interaction['stringId_A'],
          ...(enrichedGene && {
            log2fc: enrichedGene.log2fc,
            padj: enrichedGene.padj,
            expression: enrichedGene.expression,
            annotation: enrichedGene.annotation,
            functionalTerms: enrichedGene.functionalTerms
          })
        }
      };
      
      nodes.set(sourceId, nodeData);
    }

    // Add target node
    if (!nodes.has(targetId)) {
      // Try to find enriched gene data by gene name or STRING ID
      let enrichedGene = geneLookup.get(targetId);
      if (!enrichedGene) {
        enrichedGene = geneLookup.get(interaction.targetStringId || interaction['stringId_B']);
      }
      
      nodes.set(targetId, {
        data: {
          id: targetId,
          stringId: interaction.targetStringId || interaction['stringId_B'],
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

/**
 * Calculate normalized degree centrality for each node in the network
 * @param {Object} cytoscapeInstance - The Cytoscape.js instance
 * @returns {Array} Array of objects with node ID and normalized degree centrality score
 */
export function calculateNormalizedDegreeCentrality(cytoscapeInstance) {
  if (!cytoscapeInstance || typeof cytoscapeInstance.nodes !== 'function') {
    console.error('Invalid Cytoscape instance provided');
    return [];
  }

  try {
    // Get all nodes from the Cytoscape instance
    const nodes = cytoscapeInstance.nodes();
    const edges = cytoscapeInstance.edges();
    
    console.log('Total nodes:', nodes.length);
    console.log('Total edges:', edges.length);
    
    // Check if nodes collection is valid
    if (nodes.length === 0) {
      console.error('No nodes found in the network');
      return [];
    }
    
    // Check if edges collection is valid
    if (edges.length === 0) {
      console.error('No edges found in the network');
      return [];
    }
    
    // Debug: Check edges and their weights
    if (edges.length > 0) {
      console.log('Sample edge data:', edges[0].data());
      console.log('Sample edge score:', edges[0].data('score'));
    }
    
    // Debug: Check nodes
    if (nodes.length > 0) {
      console.log('Sample node data:', nodes[0].data());
      console.log('Sample node connected edges:', nodes[0].connectedEdges().length);
    }
    
    // Manual degree centrality calculation since Cytoscape.js built-in functions are failing
    console.log('Calculating degree centrality manually...');
    
    const results = nodes.map(node => {
      const nodeId = node.id();
      const connectedEdges = node.connectedEdges();
      const degree = connectedEdges.length;
      
      // Calculate weighted degree centrality
      let weightedDegree = 0;
      connectedEdges.forEach(edge => {
        const score = parseFloat(edge.data('score')) || 0;
        weightedDegree += score;
      });
      
      // Normalize by total possible edges (n-1 for undirected graph)
      const totalNodes = nodes.length;
      const maxPossibleEdges = totalNodes - 1;
      const normalizedDegree = maxPossibleEdges > 0 ? degree / maxPossibleEdges : 0;
      
      // Calculate alpha-weighted centrality (alpha = 0.3 so confidence scores get 70% weight)
      const alpha = 0.3;
      const alphaWeightedCentrality = alpha * normalizedDegree + (1 - alpha) * (weightedDegree / connectedEdges.length || 0);
      
      console.log(`Node ${nodeId}: degree=${degree}, weightedDegree=${weightedDegree.toFixed(3)}, normalizedDegree=${normalizedDegree.toFixed(4)}, final=${alphaWeightedCentrality.toFixed(4)}`);
      
      return {
        id: nodeId,
        stringId: node.data('stringId'),
        normalizedDegreeCentrality: alphaWeightedCentrality,
        degree: degree
      };
    });

    console.log(results);

    // Sort by centrality score in descending order
    return results.sort((a, b) => b.normalizedDegreeCentrality - a.normalizedDegreeCentrality);
    
  } catch (error) {
    console.error('Error calculating normalized degree centrality:', error);
    return [];
  }
}

// Export all utility functions as named exports and as default object
export default {
  parseTsvResponse,
  getConfidenceLevel,
  convertToCytoscapeFormat,
  calculateNormalizedDegreeCentrality
};
