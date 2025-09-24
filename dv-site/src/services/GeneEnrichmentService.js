import StringApiService from './StringApiService.js';

/**
 * Service for enriching gene objects with STRING API data
 * Handles the data preprocessing pipeline:
 * 1. Resolve gene identifiers to get STRING IDs and annotations
 * 2. Get functional annotations for resolved genes
 * 3. Map all data into enriched gene objects
 */
class GeneEnrichmentService {
  /**
   * Enrich gene objects with STRING API data
   * @param {Array} geneObjects - Array of gene objects from GeneSetSelector
   * @returns {Promise<Array>} Enriched gene objects with STRING data
   */
  async enrichGenesWithStringData(geneObjects) {
    if (geneObjects.length === 0) return [];

    try {
      // Extract gene names for STRING API calls
      const geneNames = geneObjects.map(gene => gene.geneName);

      // Step 1: Resolve gene identifiers to get STRING IDs and annotations
      console.log('Resolving gene identifiers...');
      const resolvedIds = await StringApiService.resolveIdentifiers(geneNames, 'symbol');
      
      // Create a lookup map for resolved identifiers
      const resolvedLookup = new Map();
      resolvedIds.forEach(item => {
        resolvedLookup.set(item.preferredName?.toLowerCase(), item);
      });

      // Step 2: Get functional annotations for resolved genes
      console.log('Getting functional annotations...');
      let functionalAnnotations = [];
      
      // Extract STRING IDs from resolved identifiers
      const stringIds = resolvedIds
        .filter(item => item.stringId)
        .map(item => item.stringId);
      
      if (stringIds.length > 0) {
        console.log(`Getting functional annotations for ${stringIds.length} STRING IDs`);
        functionalAnnotations = await StringApiService.getFunctionalAnnotation(stringIds);
      }

      // Create a lookup map for functional annotations
      // Map STRING IDs to functional terms
      const functionalLookup = new Map();
      functionalAnnotations.forEach(annotation => {
        const stringId = annotation.stringId || annotation.inputGenes;
        if (stringId) {
          if (!functionalLookup.has(stringId)) {
            functionalLookup.set(stringId, []);
          }
          functionalLookup.get(stringId).push({
            term: annotation.term,
            description: annotation.description
          });
        }
      });

      // Step 3: Enrich gene objects with STRING data
      const enrichedGenes = geneObjects.map(gene => {
        const resolved = resolvedLookup.get(gene.geneName);
        const functionalTerms = resolved?.stringId ? functionalLookup.get(resolved.stringId) || [] : [];

        return {
          ...gene, // Keep all original gene data (log2fc, padj, expression, etc.)
          stringId: resolved?.stringId || null,
          annotation: resolved?.annotation || null,
          functionalTerms: functionalTerms
        };
      });

      console.log(`Enriched ${enrichedGenes.length} genes with STRING data`);
      console.log(`Functional annotations retrieved: ${functionalAnnotations.length}`);
      console.log(`Genes with functional terms: ${enrichedGenes.filter(gene => gene.functionalTerms.length > 0).length}`);
      
      return enrichedGenes;

    } catch (error) {
      console.error('Error enriching genes with STRING data:', error);
      throw new Error(`Failed to enrich genes with STRING data: ${error.message}`);
    }
  }

  /**
   * Get enrichment statistics
   * @param {Array} originalGenes - Original gene objects
   * @param {Array} enrichedGenes - Enriched gene objects
   * @returns {Object} Statistics about the enrichment process
   */
  getEnrichmentStats(originalGenes, enrichedGenes) {
    const resolvedCount = enrichedGenes.filter(gene => gene.stringId).length;
    const withAnnotations = enrichedGenes.filter(gene => gene.annotation).length;
    const withFunctionalTerms = enrichedGenes.filter(gene => gene.functionalTerms.length > 0).length;

    return {
      totalGenes: originalGenes.length,
      resolvedGenes: resolvedCount,
      withAnnotations: withAnnotations,
      withFunctionalTerms: withFunctionalTerms,
      resolutionRate: originalGenes.length > 0 ? (resolvedCount / originalGenes.length) * 100 : 0
    };
  }
}

// Export singleton instance
export default new GeneEnrichmentService();
