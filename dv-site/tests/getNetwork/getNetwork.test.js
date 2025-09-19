/**
 * Test file for StringApiService getNetwork method
 * Tests the STRING API network data fetching functionality
 */

import StringApiService from '../../src/services/StringApiService.js';
import { NETWORK_TEST_DATA } from './testData.js';

// Test configuration using data from testData.js
const TEST_CONFIG = {
  // Use gene names from testData.js
  testGeneNames: NETWORK_TEST_DATA.mouseGeneNames.valid,
  
  // Use network options from testData.js
  networkOptions: {
    lowConfidence: NETWORK_TEST_DATA.networkOptions.confidenceThresholds.low,
    mediumConfidence: NETWORK_TEST_DATA.networkOptions.confidenceThresholds.medium,
    highConfidence: NETWORK_TEST_DATA.networkOptions.confidenceThresholds.high,
    fullNetwork: NETWORK_TEST_DATA.networkOptions.networkTypes.full,
    physicalNetwork: NETWORK_TEST_DATA.networkOptions.networkTypes.physical
  },
  
  // Use validation schemas from testData.js
  validationSchemas: NETWORK_TEST_DATA.validationSchemas,
  
  // Use performance thresholds from testData.js
  performanceThresholds: NETWORK_TEST_DATA.performanceThresholds,
  
};

/**
 * Test suite for getNetwork method
 */
class GetNetworkTest {
  constructor() {
    this.stringApiService = StringApiService;
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * Log test results with formatting
   */
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  /**
   * Record test result
   */
  recordResult(testName, passed, details = '') {
    const result = {
      testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(result);
    
    if (passed) {
      this.passedTests++;
      this.log(`PASS: ${testName}${details ? ` - ${details}` : ''}`, 'success');
    } else {
      this.failedTests++;
      this.log(`FAIL: ${testName}${details ? ` - ${details}` : ''}`, 'error');
    }
  }

  /**
   * Test 1: Basic network functionality with gene names
   */
  async testBasicNetwork() {
    this.log('Starting Test 1: Basic network with gene names');
    
    try {
      // First resolve gene names to STRING IDs
      const geneNames = NETWORK_TEST_DATA.mouseGeneNames.small; // Use small test set
      const resolvedIds = await this.stringApiService.resolveIdentifiers(geneNames, 'symbol');
      
      if (!resolvedIds || resolvedIds.length === 0) {
        this.recordResult('Basic Network', false, 'Failed to resolve gene names to STRING IDs');
        return null;
      }
      
      // Extract STRING IDs from resolved data
      const stringIds = resolvedIds.map(item => item.stringId).filter(id => id);
      
      if (stringIds.length === 0) {
        this.recordResult('Basic Network', false, 'No valid STRING IDs found after resolution');
        return null;
      }
      
      // Get network data
      const result = await this.stringApiService.getNetwork(stringIds);
      
      // Validate response structure using schema from testData.js
      const isValidArray = Array.isArray(result);
      const hasValidEntries = result.length > 0;
      const requiredFields = TEST_CONFIG.validationSchemas.networkResponse.requiredFields;
      const hasRequiredFields = result.every(entry => 
        requiredFields.every(field => entry.hasOwnProperty(field) && entry[field] !== '')
      );
      
      if (isValidArray && hasValidEntries && hasRequiredFields) {
        this.recordResult(
          'Basic Network',
          true,
          `Retrieved ${result.length} interactions for ${geneNames.join(', ')}`
        );
        
        // Log sample interactions
        result.slice(0, 3).forEach(interaction => {
          this.log(`  Interaction: ${interaction.preferredName_A} ↔ ${interaction.preferredName_B} (score: ${interaction.score})`);
        });
        
        return result;
      } else {
        this.recordResult('Basic Network', false, 'Invalid response structure');
        return null;
      }
    } catch (error) {
      this.recordResult('Basic Network', false, error.message);
      return null;
    }
  }

  /**
   * Test 2: Test with different confidence thresholds
   */
  async testConfidenceThresholds() {
    this.log('Starting Test 2: Test different confidence thresholds');
    
    try {
      const geneNames = NETWORK_TEST_DATA.mouseGeneNames.small.slice(0, 2);
      
      // First resolve gene names to STRING IDs
      const resolvedIds = await this.stringApiService.resolveIdentifiers(geneNames, 'symbol');
      const stringIds = resolvedIds.map(item => item.stringId).filter(id => id);
      
      if (stringIds.length === 0) {
        this.recordResult('Confidence Thresholds', false, 'Failed to resolve gene names');
        return null;
      }
      
      // Test low confidence
      const lowConfResult = await this.stringApiService.getNetwork(
        stringIds,
        TEST_CONFIG.networkOptions.lowConfidence
      );
      
      // Test high confidence
      const highConfResult = await this.stringApiService.getNetwork(
        stringIds,
        TEST_CONFIG.networkOptions.highConfidence
      );
      
      const lowConfCount = lowConfResult.length;
      const highConfCount = highConfResult.length;
      
      // High confidence should return fewer or equal interactions
      if (highConfCount <= lowConfCount) {
        this.recordResult(
          'Confidence Thresholds',
          true,
          `Low conf: ${lowConfCount} interactions, High conf: ${highConfCount} interactions`
        );
      } else {
        this.recordResult(
          'Confidence Thresholds',
          false,
          'High confidence returned more interactions than low confidence'
        );
      }
      
      return { lowConfResult, highConfResult };
    } catch (error) {
      this.recordResult('Confidence Thresholds', false, error.message);
      return null;
    }
  }

  /**
   * Test 3: Test network type options
   */
  async testNetworkTypes() {
    this.log('Starting Test 3: Test different network types');
    
    try {
      const geneNames = NETWORK_TEST_DATA.mouseGeneNames.small.slice(0, 2);
      
      // First resolve gene names to STRING IDs
      const resolvedIds = await this.stringApiService.resolveIdentifiers(geneNames, 'symbol');
      const stringIds = resolvedIds.map(item => item.stringId).filter(id => id);
      
      if (stringIds.length === 0) {
        this.recordResult('Network Types', false, 'Failed to resolve gene names');
        return null;
      }
      
      // Test full network
      const fullNetworkResult = await this.stringApiService.getNetwork(
        stringIds,
        TEST_CONFIG.networkOptions.fullNetwork
      );
      
      // Test physical network
      const physicalNetworkResult = await this.stringApiService.getNetwork(
        stringIds,
        TEST_CONFIG.networkOptions.physicalNetwork
      );
      
      const fullCount = fullNetworkResult.length;
      const physicalCount = physicalNetworkResult.length;
      
      // Both should return valid results
      if (fullCount >= 0 && physicalCount >= 0) {
        this.recordResult(
          'Network Types',
          true,
          `Full network: ${fullCount} interactions, Physical network: ${physicalCount} interactions`
        );
      } else {
        this.recordResult('Network Types', false, 'Invalid network type results');
      }
      
      return { fullNetworkResult, physicalNetworkResult };
    } catch (error) {
      this.recordResult('Network Types', false, error.message);
      return null;
    }
  }

  /**
   * Test 4: Test Cytoscape format conversion
   */
  async testCytoscapeConversion() {
    this.log('Starting Test 4: Test Cytoscape format conversion');
    
    try {
      const geneNames = NETWORK_TEST_DATA.mouseGeneNames.small;
      
      // First resolve gene names to STRING IDs
      const resolvedIds = await this.stringApiService.resolveIdentifiers(geneNames, 'symbol');
      const stringIds = resolvedIds.map(item => item.stringId).filter(id => id);
      
      if (stringIds.length === 0) {
        this.recordResult('Cytoscape Conversion', false, 'Failed to resolve gene names');
        return null;
      }
      
      const networkData = await this.stringApiService.getNetwork(stringIds);
      
      const cytoscapeData = this.stringApiService.convertToCytoscapeFormat(networkData);
      
      // Validate Cytoscape format using schema from testData.js
      const hasNodes = Array.isArray(cytoscapeData.nodes) && cytoscapeData.nodes.length > 0;
      const hasEdges = Array.isArray(cytoscapeData.edges) && cytoscapeData.edges.length > 0;
      
      const nodeRequiredFields = TEST_CONFIG.validationSchemas.cytoscapeFormat.nodes.requiredFields;
      const nodesHaveValidStructure = cytoscapeData.nodes.every(node => 
        node.data && nodeRequiredFields.every(field => node.data.hasOwnProperty(field))
      );
      
      const edgeRequiredFields = TEST_CONFIG.validationSchemas.cytoscapeFormat.edges.requiredFields;
      const edgesHaveValidStructure = cytoscapeData.edges.every(edge => 
        edge.data && edgeRequiredFields.every(field => edge.data.hasOwnProperty(field))
      );
      
      if (hasNodes && hasEdges && nodesHaveValidStructure && edgesHaveValidStructure) {
        this.recordResult(
          'Cytoscape Conversion',
          true,
          `Converted to ${cytoscapeData.nodes.length} nodes and ${cytoscapeData.edges.length} edges`
        );
        
        // Log sample node and edge
        if (cytoscapeData.nodes.length > 0) {
          this.log(`  Sample node: ${JSON.stringify(cytoscapeData.nodes[0].data, null, 2)}`);
        }
        if (cytoscapeData.edges.length > 0) {
          this.log(`  Sample edge: ${JSON.stringify(cytoscapeData.edges[0].data, null, 2)}`);
        }
      } else {
        this.recordResult('Cytoscape Conversion', false, 'Invalid Cytoscape format structure');
      }
      
      return cytoscapeData;
    } catch (error) {
      this.recordResult('Cytoscape Conversion', false, error.message);
      return null;
    }
  }


  /**
   * Test 5: Performance test with larger dataset
   */
  async testPerformance() {
    this.log('Starting Test 5: Performance test with larger dataset');
    
    const startTime = Date.now();
    
    try {
      const geneNames = NETWORK_TEST_DATA.mouseGeneNames.large;
      
      // First resolve gene names to STRING IDs
      const resolvedIds = await this.stringApiService.resolveIdentifiers(geneNames, 'symbol');
      const stringIds = resolvedIds.map(item => item.stringId).filter(id => id);
      
      if (stringIds.length === 0) {
        this.recordResult('Performance Test', false, 'Failed to resolve gene names');
        return null;
      }
      
      // Test with all available STRING IDs
      const result = await this.stringApiService.getNetwork(stringIds);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (duration < TEST_CONFIG.performanceThresholds.maxResponseTime && result.length >= TEST_CONFIG.performanceThresholds.minInteractions) {
        this.recordResult(
          'Performance Test',
          true,
          `Retrieved ${result.length} interactions for ${geneNames.length} genes in ${duration}ms`
        );
      } else {
        this.recordResult(
          'Performance Test',
          false,
          `Performance issues: ${duration}ms for ${result.length} interactions`
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Performance Test', false, error.message);
      return null;
    }
  }
  
  /**
   * Test 6: Test response parsing
   */
  async testResponseParsing() {
    this.log('Starting Test 6: Test TSV response parsing');
    
    try {
      const geneNames = NETWORK_TEST_DATA.mouseGeneNames.small.slice(0, 2);
      
      // First resolve gene names to STRING IDs
      const resolvedIds = await this.stringApiService.resolveIdentifiers(geneNames, 'symbol');
      const stringIds = resolvedIds.map(item => item.stringId).filter(id => id);
      
      if (stringIds.length === 0) {
        this.recordResult('Response Parsing', false, 'Failed to resolve gene names');
        return null;
      }
      
      const result = await this.stringApiService.getNetwork(stringIds);
      
      // Test the parseTsvResponse method using validation schema
      const requiredFields = TEST_CONFIG.validationSchemas.networkResponse.requiredFields;
      const typeChecks = TEST_CONFIG.validationSchemas.networkResponse.typeChecks;
      
      const isValidParsedData = result.every(entry => {
        return typeof entry === 'object' && 
               requiredFields.every(field => entry.hasOwnProperty(field)) &&
               Object.entries(typeChecks).every(([field, expectedType]) => {
                 if (expectedType === 'number') return typeof parseFloat(entry[field]) === 'number';
                 return typeof entry[field] === expectedType;
               });
      });
      
      if (isValidParsedData) {
        this.recordResult(
          'Response Parsing',
          true,
          'TSV response correctly parsed into objects'
        );
        
        // Log sample parsed data
        if (result.length > 0) {
          this.log(`  Sample interaction: ${JSON.stringify(result[0], null, 2)}`);
        }
      } else {
        this.recordResult(
          'Response Parsing',
          false,
          'TSV response parsing failed'
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Response Parsing', false, error.message);
      return null;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.log('🧪 Starting StringApiService getNetwork Tests');
    this.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    // Run all tests
    await this.testBasicNetwork();
    await this.testConfidenceThresholds();
    await this.testNetworkTypes();
    await this.testCytoscapeConversion();
    await this.testPerformance();
    await this.testResponseParsing();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // Print summary
    this.log('=' .repeat(60));
    this.log('📊 Test Summary');
    this.log(`Total Tests: ${this.testResults.length}`);
    this.log(`Passed: ${this.passedTests}`);
    this.log(`Failed: ${this.failedTests}`);
    this.log(`Success Rate: ${((this.passedTests / this.testResults.length) * 100).toFixed(1)}%`);
    this.log(`Total Duration: ${totalDuration}ms`);
    
    if (this.failedTests === 0) {
      this.log('🎉 All tests passed!', 'success');
    } else {
      this.log(`⚠️  ${this.failedTests} test(s) failed`, 'error');
    }
    
    return {
      totalTests: this.testResults.length,
      passed: this.passedTests,
      failed: this.failedTests,
      duration: totalDuration,
      results: this.testResults
    };
  }
}

// Export for use in other files
export default GetNetworkTest;

// If running directly, execute tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const testRunner = new GetNetworkTest();
  testRunner.runAllTests().catch(console.error);
}
