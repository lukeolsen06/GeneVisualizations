/**
 * Test data for StringApiService getNetwork tests
 * Contains sample gene names and expected results for network testing
 */

export const NETWORK_TEST_DATA = {
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
      'Rb1'         // Retinoblastoma 1
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
    ]
  },
  
  // Network options for testing
  networkOptions: {
    confidenceThresholds: {
      low: { confidenceThreshold: 150 },
      medium: { confidenceThreshold: 400 },
      high: { confidenceThreshold: 700 },
      veryHigh: { confidenceThreshold: 900 }
    },
    
    networkTypes: {
      full: { networkType: 'full' },
      physical: { networkType: 'physical' },
      functional: { networkType: 'functional' }
    },
    
    combined: {
      lowConfPhysical: { 
        confidenceThreshold: 150, 
        networkType: 'physical' 
      },
      highConfFull: { 
        confidenceThreshold: 700, 
        networkType: 'full' 
      }
    }
  },
  
  // Expected network response structure
  expectedNetworkFields: {
    required: [
      'stringId_A',
      'stringId_B', 
      'score',
      'preferredName_A',
      'preferredName_B'
    ],
    optional: [
      'annotation_A',
      'annotation_B',
      'description_A',
      'description_B',
      'chromosome_A',
      'chromosome_B'
    ]
  },
  
  // Expected Cytoscape format structure
  expectedCytoscapeStructure: {
    nodes: {
      required: ['id', 'label', 'stringId'],
      optional: ['description', 'chromosome', 'annotation']
    },
    edges: {
      required: ['id', 'source', 'target', 'score', 'confidence']
    }
  },
  
  
  // Performance thresholds
  performanceThresholds: {
    maxResponseTime: 15000, // 15 seconds
    minInteractions: 0,     // At least 0 interactions (could be none for high confidence)
    maxMemoryUsage: 100     // 100MB (if available)
  },
  
  // Validation schemas
  validationSchemas: {
    networkResponse: {
      requiredFields: ['stringId_A', 'stringId_B', 'score'],
      optionalFields: ['preferredName_A', 'preferredName_B', 'annotation_A', 'annotation_B'],
      typeChecks: {
        stringId_A: 'string',
        stringId_B: 'string',
        score: 'number'
      }
    },
    
    cytoscapeFormat: {
      nodes: {
        requiredFields: ['id', 'label', 'stringId'],
        optionalFields: ['description', 'chromosome', 'annotation'],
        typeChecks: {
          id: 'string',
          label: 'string',
          stringId: 'string'
        }
      },
      edges: {
        requiredFields: ['id', 'source', 'target', 'score'],
        optionalFields: ['confidence'],
        typeChecks: {
          id: 'string',
          source: 'string',
          target: 'string',
          score: 'number'
        }
      }
    }
  }
};

export default NETWORK_TEST_DATA;
