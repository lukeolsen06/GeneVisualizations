/**
 * Test file for StringApiService resolveIdentifiers method
 * Tests the STRING API identifier resolution functionality
 */

import StringApiService from '../../src/services/StringApiService.js';

// Test configuration
const TEST_CONFIG = {
  // Sample gene symbols for testing (mouse genes)
  testGeneSymbols: [
    'Eif5a',      // Eukaryotic translation initiation factor 5A
    'Actb',       // Actin beta
    'Gapdh',      // Glyceraldehyde-3-phosphate dehydrogenase
    'Tp53',       // Tumor protein p53
    'Mdm2',       // Mouse double minute 2
    'InvalidGene' // This should fail to resolve
  ],
  
  // Expected results for validation
  expectedResults: {
    shouldResolve: ['Eif5a', 'Actb', 'Gapdh', 'Tp53', 'Mdm2'],
    shouldFail: ['InvalidGene']
  }
};

/**
 * Test suite for resolveIdentifiers method
 */
class ResolveIdentifiersTest {
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
   * Test 1: Basic functionality with valid gene symbols
   */
  async testBasicResolution() {
    this.log('Starting Test 1: Basic resolution with valid gene symbols');
    
    try {
      const result = await this.stringApiService.resolveIdentifiers(
        TEST_CONFIG.testGeneSymbols.slice(0, 3), // Test first 3 genes
        'symbol'
      );
      
      // Validate response structure
      const isValidArray = Array.isArray(result);
      const hasValidEntries = result.length > 0;
      const hasRequiredFields = result.every(entry => 
        entry.queryItem && entry.stringId && entry.preferredName
      );
      
      if (isValidArray && hasValidEntries && hasRequiredFields) {
        this.recordResult(
          'Basic Resolution',
          true,
          `Resolved ${result.length} genes successfully`
        );
        
        // Log resolved genes
        result.forEach(gene => {
          this.log(`  Resolved: ${gene.queryItem} → ${gene.preferredName} (${gene.stringId})`);
        });
        
        return result;
      } else {
        this.recordResult('Basic Resolution', false, 'Invalid response structure');
        return null;
      }
    } catch (error) {
      this.recordResult('Basic Resolution', false, error.message);
      return null;
    }
  }

  /**
   * Test 2: Test with invalid gene symbols
   */
  async testInvalidResolution() {
    this.log('Starting Test 2: Resolution with invalid gene symbols');
    
    try {
      const invalidGenes = ['InvalidGene', 'NonExistentGene', 'FakeGene123'];
      const result = await this.stringApiService.resolveIdentifiers(
        invalidGenes,
        'symbol'
      );
      
      // For invalid genes, we expect empty results or failed resolutions
      const hasNoValidResults = result.length === 0 || 
        result.every(entry => !entry.stringId || entry.stringId === '');
      
      if (hasNoValidResults) {
        this.recordResult(
          'Invalid Resolution',
          true,
          'Correctly handled invalid gene symbols'
        );
      } else {
        this.recordResult(
          'Invalid Resolution',
          false,
          'Unexpectedly resolved invalid genes'
        );
      }
      
      return result;
    } catch (error) {
      // This is expected for invalid genes
      this.recordResult(
        'Invalid Resolution',
        true,
        `Correctly threw error for invalid genes: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Test 3: Test with mixed valid and invalid genes
   */
  async testMixedResolution() {
    this.log('Starting Test 3: Resolution with mixed valid and invalid genes');
    
    try {
      const mixedGenes = ['Eif5a', 'InvalidGene', 'Actb', 'FakeGene'];
      const result = await this.stringApiService.resolveIdentifiers(
        mixedGenes,
        'symbol'
      );
      
      // Should resolve valid genes and handle invalid ones gracefully
      const validResolutions = result.filter(entry => 
        entry.stringId && entry.stringId !== ''
      );
      
      const expectedValidCount = 2; // Eif5a and Actb
      const actualValidCount = validResolutions.length;
      
      if (actualValidCount >= expectedValidCount) {
        this.recordResult(
          'Mixed Resolution',
          true,
          `Resolved ${actualValidCount} valid genes out of ${mixedGenes.length} total`
        );
        
        validResolutions.forEach(gene => {
          this.log(`  Resolved: ${gene.queryItem} → ${gene.preferredName}`);
        });
      } else {
        this.recordResult(
          'Mixed Resolution',
          false,
          `Expected at least ${expectedValidCount} valid resolutions, got ${actualValidCount}`
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Mixed Resolution', false, error.message);
      return null;
    }
  }

  /**
   * Test 4: Test different input formats
   */
  async testDifferentFormats() {
    this.log('Starting Test 4: Test different input formats');
    
    try {
      // Test with Ensembl IDs (example mouse Ensembl IDs)
      const ensemblIds = ['ENSMUSG00000000001', 'ENSMUSG00000000003'];
      const result = await this.stringApiService.resolveIdentifiers(
        ensemblIds,
        'ensembl'
      );
      
      if (Array.isArray(result) && result.length > 0) {
        this.recordResult(
          'Different Formats',
          true,
          `Successfully resolved ${result.length} Ensembl IDs`
        );
      } else {
        this.recordResult(
          'Different Formats',
          false,
          'Failed to resolve Ensembl IDs'
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Different Formats', false, error.message);
      return null;
    }
  }

  /**
   * Test 5: Test API response parsing
   */
  async testResponseParsing() {
    this.log('Starting Test 5: Test TSV response parsing');
    
    try {
      const result = await this.stringApiService.resolveIdentifiers(
        ['Eif5a', 'Actb'],
        'symbol'
      );
      
      // Test the parseTsvResponse method indirectly
      const isValidParsedData = result.every(entry => {
        return typeof entry === 'object' && 
               entry.hasOwnProperty('queryItem') &&
               entry.hasOwnProperty('stringId') &&
               entry.hasOwnProperty('preferredName');
      });
      
      if (isValidParsedData) {
        this.recordResult(
          'Response Parsing',
          true,
          'TSV response correctly parsed into objects'
        );
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
   * Test 6: Performance test with larger dataset
   */
  async testPerformance() {
    this.log('Starting Test 6: Performance test with larger dataset');
    
    const startTime = Date.now();
    
    try {
      // Test with more genes to check performance
      const largeGeneSet = [
        'Eif5a', 'Actb', 'Gapdh', 'Tp53', 'Mdm2', 'Myc', 'Fos', 'Jun',
        'Cdk4', 'Rb1', 'Pten', 'Akt1', 'Mtor', 'Pik3ca', 'Kras'
      ];
      
      const result = await this.stringApiService.resolveIdentifiers(
        largeGeneSet,
        'symbol'
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const successRate = (result.length / largeGeneSet.length) * 100;
      
      if (duration < 10000 && successRate > 50) { // Less than 10 seconds and >50% success
        this.recordResult(
          'Performance Test',
          true,
          `Resolved ${result.length}/${largeGeneSet.length} genes in ${duration}ms (${successRate.toFixed(1)}% success)`
        );
      } else {
        this.recordResult(
          'Performance Test',
          false,
          `Performance issues: ${duration}ms, ${successRate.toFixed(1)}% success rate`
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Performance Test', false, error.message);
      return null;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.log('🧪 Starting StringApiService resolveIdentifiers Tests');
    this.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    // Run all tests
    await this.testBasicResolution();
    await this.testInvalidResolution();
    await this.testMixedResolution();
    await this.testDifferentFormats();
    await this.testResponseParsing();
    await this.testPerformance();
    
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
export default ResolveIdentifiersTest;

// If running directly, execute tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const testRunner = new ResolveIdentifiersTest();
  testRunner.runAllTests().catch(console.error);
}
