/**
 * Test data for StringApiService getEnrichment tests
 * Contains sample gene names and expected results for enrichment analysis testing
 */

export const ENRICHMENT_TEST_DATA = {
  // Mouse gene names for testing (what users will input)
  mouseGeneNames: {
    valid: [
      'Eif5a',      // Eukaryotic translation initiation factor 5A
      'Actb',       // Actin beta
      'Gapdh',      // Glyceraldehyde-3-phosphate dehydrogenase
      'Tp53',       // Tumor protein p53
      'Mdm2',       // Mouse double minute 2
      'Myc',        // MYC proto-oncogene
      'Fos',        // FBJ osteosarcoma oncogene
      'Jun',        // Jun proto-oncogene
      'Cdk4',       // Cyclin-dependent kinase 4
      'Rb1',        // Retinoblastoma 1
      'Pten',       // Phosphatase and tensin homolog
      'Akt1',       // AKT serine/threonine kinase 1
      'Mtor',       // Mechanistic target of rapamycin kinase
      'Pik3ca',     // Phosphatidylinositol-4,5-bisphosphate 3-kinase catalytic subunit alpha
      'Kras'        // KRAS proto-oncogene
    ],
    
    // Small test set for basic functionality
    small: [
      'Eif5a',      // Eif5a
      'Actb',       // Actb
      'Gapdh'       // Gapdh
    ],
    
    // Medium test set for performance testing
    medium: [
      'Eif5a',      // Eif5a
      'Actb',       // Actb
      'Gapdh',      // Gapdh
      'Tp53',       // Tp53
      'Mdm2'        // Mdm2
    ],
    
    // Large test set for comprehensive testing
    large: [
      'Eif5a',      // Eif5a
      'Actb',       // Actb
      'Gapdh',      // Gapdh
      'Tp53',       // Tp53
      'Mdm2',       // Mdm2
      'Myc',        // Myc
      'Fos',        // Fos
      'Jun',        // Jun
      'Cdk4',       // Cdk4
      'Rb1'         // Rb1
    ],
    
    // Cancer-related genes for pathway enrichment testing
    cancerRelated: [
      'Tp53',       // Tumor suppressor
      'Mdm2',       // Oncogene
      'Myc',        // Oncogene
      'Pten',       // Tumor suppressor
      'Akt1',       // Oncogene
      'Rb1'         // Tumor suppressor
    ],
    
    // Translation-related genes
    translationRelated: [
      'Eif5a',      // Translation initiation factor
      'Eif2s1',     // Translation initiation factor
      'Eif4e',      // Translation initiation factor
      'Rps6',       // Ribosomal protein
      'Rpl7'        // Ribosomal protein
    ]
  },
  
  // Enrichment options for testing
  enrichmentOptions: {
    default: {},
    withLimit: { limit: 10 },
    withPvalue: { pvalue_threshold: 0.05 },
    withFDR: { fdr_threshold: 0.1 },
    combined: { 
      limit: 20, 
      pvalue_threshold: 0.01, 
      fdr_threshold: 0.05 
    }
  },
  
  // Expected enrichment response structure
  expectedEnrichmentFields: {
    required: [
      'term',
      'description',
      'number_of_genes',
      'number_of_genes_in_background',
      'fdr',
      'p_value',
      'category'
    ],
    optional: [
      'genes',
      'category',
      'source',
      'inputGenes'
    ]
  },
  
  // Expected pathway categories
  expectedPathwayCategories: [
    'GO_Biological_Process',
    'GO_Molecular_Function', 
    'GO_Cellular_Component',
    'KEGG',
    'Reactome',
    'WikiPathways'
  ],
  
  // Performance thresholds
  performanceThresholds: {
    maxResponseTime: 20000, // 20 seconds (enrichment can take longer)
    minEnrichments: 1,      // At least 1 enrichment result
    maxMemoryUsage: 100     // 100MB (if available)
  },
  
  // Validation schemas
  validationSchemas: {
    enrichmentResponse: {
      requiredFields: [
        'term',
        'description', 
        'number_of_genes',
        'fdr',
        'p_value'
      ],
      optionalFields: [
        'genes',
        'category',
        'source',
        'number_of_genes_in_background',
        'inputGenes'
      ],
      typeChecks: {
        term: 'string',
        description: 'string',
        number_of_genes: 'number',
        fdr: 'number',
        p_value: 'number'
      }
    }
  },
  
  // Sample enrichment results for validation
  sampleEnrichmentResults: {
    validStructure: {
      term: 'GO:0006412~translation',
      description: 'translation',
      number_of_genes: 5,
      number_of_genes_in_background: 15000,
      fdr: 0.001,
      p_value: 0.0001,
      genes: ['Eif5a', 'Eif2s1', 'Eif4e'],
      category: 'GO_Biological_Process'
    },
    
    minimalStructure: {
      term: 'KEGG:04110~Cell cycle',
      description: 'Cell cycle',
      number_of_genes: 3,
      fdr: 0.05,
      p_value: 0.01
    }
  }
};

export default ENRICHMENT_TEST_DATA;
