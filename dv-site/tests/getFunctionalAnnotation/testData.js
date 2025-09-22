/**
 * Test data for StringApiService getFunctionalAnnotation tests
 * Contains sample gene names and expected results for functional annotation testing
 */

export const FUNCTIONAL_ANNOTATION_TEST_DATA = {
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
    
    // Translation-related genes for functional annotation testing
    translationRelated: [
      'Eif5a',      // Translation initiation factor
      'Eif2s1',     // Translation initiation factor
      'Eif4e',      // Translation initiation factor
      'Rps6',       // Ribosomal protein
      'Rpl7'        // Ribosomal protein
    ],
    
    // Cancer-related genes for functional annotation testing
    cancerRelated: [
      'Tp53',       // Tumor suppressor
      'Mdm2',       // Oncogene
      'Myc',        // Oncogene
      'Pten',       // Tumor suppressor
      'Akt1',       // Oncogene
      'Rb1'         // Tumor suppressor
    ],
    
    // Metabolic genes for functional annotation testing
    metabolicRelated: [
      'Gapdh',      // Glycolysis
      'Pkm',        // Glycolysis
      'Pfk1',       // Glycolysis
      'Hk2',        // Glycolysis
      'Ldha'        // Glycolysis
    ]
  },
  
  // Functional annotation options for testing
  functionalAnnotationOptions: {
    default: {},
    withLimit: { limit: 5 },
    withSpecies: { species: 10090 }, // Mouse
    withFormat: { format: 'json' }
  },
  
  // Expected functional annotation response structure
  expectedFunctionalAnnotationFields: {
    required: [
      'category',
      'term',
      'description',
      'preferredNames'
    ],
    optional: [
      'number_of_genes',
      'ratio_in_set',
      'ncbiTaxonId',
      'inputGenes'
    ]
  },
  
  // Expected annotation types
  expectedAnnotationTypes: [
    'GO_Biological_Process',
    'GO_Molecular_Function',
    'GO_Cellular_Component',
    'KEGG',
    'Reactome',
    'WikiPathways',
    'Pfam',
    'InterPro',
    'SMART'
  ],
  
  // Performance thresholds
  performanceThresholds: {
    maxResponseTime: 10000, // 10 seconds
    minAnnotations: 1,      // At least 1 annotation result
    maxMemoryUsage: 50      // 50MB (if available)
  },
  
  // Validation schemas
  validationSchemas: {
    functionalAnnotationResponse: {
      requiredFields: [
        'category',
        'term',
        'description',
        'preferredNames'
      ],
      optionalFields: [
        'number_of_genes',
        'ratio_in_set',
        'ncbiTaxonId',
        'inputGenes'
      ],
      typeChecks: {
        category: 'string',
        term: 'string',
        description: 'string',
        preferredNames: 'string'
      }
    }
  },
  
  // Sample functional annotation results for validation
  sampleFunctionalAnnotationResults: {
    validStructure: {
      category: 'COMPARTMENTS',
      term: 'GOCC:0005622',
      description: 'Intracellular',
      preferredNames: 'Eif5a',
      number_of_genes: '1',
      ratio_in_set: '1.0',
      ncbiTaxonId: '10090',
      inputGenes: 'Eif5a'
    },
    
    minimalStructure: {
      category: 'COMPARTMENTS',
      term: 'GOCC:0005634',
      description: 'Nucleus',
      preferredNames: 'Actb'
    }
  },
  
  // Expected functional categories for validation
  expectedFunctionalCategories: {
    translation: [
      'translation',
      'protein synthesis',
      'ribosome',
      'translation initiation',
      'translation elongation'
    ],
    
    cancer: [
      'cell cycle',
      'apoptosis',
      'tumor suppressor',
      'oncogene',
      'DNA repair',
      'cell proliferation'
    ],
    
    metabolism: [
      'glycolysis',
      'metabolic process',
      'glucose metabolism',
      'energy production',
      'ATP synthesis'
    ],
    
    cytoskeleton: [
      'actin',
      'cytoskeleton',
      'cell motility',
      'muscle contraction',
      'cell structure'
    ]
  }
};

export default FUNCTIONAL_ANNOTATION_TEST_DATA;
