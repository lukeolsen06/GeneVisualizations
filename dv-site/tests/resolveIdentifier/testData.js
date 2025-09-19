/**
 * Test data for StringApiService tests
 * Contains sample gene identifiers and expected results
 */

export const TEST_DATA = {
  // Mouse gene symbols for testing
  mouseGeneSymbols: {
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
      'Mtor',       // Mechanistic target of rapamycin
      'Pik3ca',     // Phosphatidylinositol-4,5-bisphosphate 3-kinase catalytic subunit alpha
      'Kras'        // KRAS proto-oncogene
    ],
    
    invalid: [
      'InvalidGene',
      'NonExistentGene',
      'FakeGene123',
      'TestGeneXYZ',
      'DummyGene'
    ],
    
    mixed: [
      'Eif5a',      // Valid
      'InvalidGene', // Invalid
      'Actb',       // Valid
      'FakeGene',   // Invalid
      'Gapdh'       // Valid
    ]
  },
  
  // Mouse Ensembl IDs for testing
  mouseEnsemblIds: {
    valid: [
      'ENSMUSG00000000001', // Eif5a
      'ENSMUSG00000000003', // Actb
      'ENSMUSG00000000028', // Gapdh
      'ENSMUSG00000000040', // Tp53
      'ENSMUSG00000000046'  // Mdm2
    ],
    
    invalid: [
      'ENSMUSG00000099999',
      'INVALID_ENSEMBL_ID',
      'ENSMUSG00000000000'
    ]
  },
  
  // Expected STRING IDs for validation
  expectedStringIds: {
    'Eif5a': '10090.ENSMUSP00000000001',
    'Actb': '10090.ENSMUSP00000000003',
    'Gapdh': '10090.ENSMUSP00000000028',
    'Tp53': '10090.ENSMUSP00000000040',
    'Mdm2': '10090.ENSMUSP00000000046'
  },
  
  // Test configurations
  testConfigs: {
    small: {
      genes: ['Eif5a', 'Actb', 'Gapdh'],
      description: 'Small test set with 3 genes'
    },
    
    medium: {
      genes: ['Eif5a', 'Actb', 'Gapdh', 'Tp53', 'Mdm2', 'Myc', 'Fos', 'Jun'],
      description: 'Medium test set with 8 genes'
    },
    
    large: {
      genes: [
        'Eif5a', 'Actb', 'Gapdh', 'Tp53', 'Mdm2', 'Myc', 'Fos', 'Jun',
        'Cdk4', 'Rb1', 'Pten', 'Akt1', 'Mtor', 'Pik3ca', 'Kras'
      ],
      description: 'Large test set with 15 genes'
    },
    
    performance: {
      genes: [
        'Eif5a', 'Actb', 'Gapdh', 'Tp53', 'Mdm2', 'Myc', 'Fos', 'Jun',
        'Cdk4', 'Rb1', 'Pten', 'Akt1', 'Mtor', 'Pik3ca', 'Kras',
        'Bcl2', 'Bax', 'Casp3', 'Casp8', 'Casp9', 'P21', 'P27', 'Cycd1',
        'Cyce1', 'Cyca1', 'Cycb1', 'Wee1', 'Cdc25a', 'Cdc25b', 'Cdc25c'
      ],
      description: 'Performance test set with 30 genes'
    }
  },
  
  // API response validation schemas
  validationSchemas: {
    resolveIdentifiersResponse: {
      requiredFields: ['queryItem', 'stringId', 'preferredName'],
      optionalFields: ['annotation', 'description', 'chromosome'],
      typeChecks: {
        queryItem: 'string',
        stringId: 'string',
        preferredName: 'string'
      }
    }
  },
  
  // Performance thresholds
  performanceThresholds: {
    maxResponseTime: 10000, // 10 seconds
    minSuccessRate: 50,     // 50%
    maxMemoryUsage: 100     // 100MB (if available)
  }
};

export default TEST_DATA;
