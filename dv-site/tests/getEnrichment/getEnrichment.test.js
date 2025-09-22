/**
 * Test file for StringApiService getEnrichment method
 * Tests the STRING API enrichment analysis functionality
 */

import StringApiService from '../../src/services/StringApiService.js';
import { ENRICHMENT_TEST_DATA } from './testData.js';

// Test configuration using data from testData.js
const TEST_CONFIG = {
  // Use gene names from testData.js
  testGeneNames: ENRICHMENT_TEST_DATA.mouseGeneNames.valid,
  
  // Use enrichment options from testData.js
  enrichmentOptions: ENRICHMENT_TEST_DATA.enrichmentOptions,
  
  // Use validation schemas from testData.js
  validationSchemas: ENRICHMENT_TEST_DATA.validationSchemas,
  
  // Use performance thresholds from testData.js
  performanceThresholds: ENRICHMENT_TEST_DATA.performanceThresholds,
  
  // Use expected pathway categories
  expectedPathwayCategories: ENRICHMENT_TEST_DATA.expectedPathwayCategories,
};

/**
 * Test suite for getEnrichment method
 */
class GetEnrichmentTest {
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
   * Test 1: Basic enrichment functionality with gene names
   */
  async testBasicEnrichment() {
    this.log('Starting Test 1: Basic enrichment with gene names');
    
    try {
      // Use gene names directly (STRING API handles mapping internally)
      const geneNames = ENRICHMENT_TEST_DATA.mouseGeneNames.small;
      
      // Get enrichment data directly with gene names
      const result = await this.stringApiService.getEnrichment(geneNames);
      
      // Validate response structure using schema from testData.js
      const isValidArray = Array.isArray(result);
      const hasValidEntries = result.length > 0;
      const requiredFields = TEST_CONFIG.validationSchemas.enrichmentResponse.requiredFields;
      const hasRequiredFields = result.every(entry => 
        requiredFields.every(field => entry.hasOwnProperty(field) && entry[field] !== '')
      );
      
      if (isValidArray && hasValidEntries && hasRequiredFields) {
        this.recordResult(
          'Basic Enrichment',
          true,
          `Retrieved ${result.length} enriched pathways for ${geneNames.join(', ')}`
        );
        
        // Log sample enrichments
        result.slice(0, 3).forEach(enrichment => {
          this.log(`  Pathway: ${enrichment.term} (${enrichment.number_of_genes} genes, FDR: ${enrichment.fdr})`);
        });
        
        return result;
      } else {
        this.recordResult('Basic Enrichment', false, 'Invalid response structure');
        return null;
      }
    } catch (error) {
      this.recordResult('Basic Enrichment', false, error.message);
      return null;
    }
  }

  /**
   * Test 2: Test with different enrichment options
   */
  async testEnrichmentOptions() {
    this.log('Starting Test 2: Test different enrichment options');
    
    try {
      const geneNames = ENRICHMENT_TEST_DATA.mouseGeneNames.small;
      
      // Test with default options
      const defaultResult = await this.stringApiService.getEnrichment(geneNames);
      
      // Test with limit option
      const limitedResult = await this.stringApiService.getEnrichment(
        geneNames,
        TEST_CONFIG.enrichmentOptions.withLimit
      );
      
      // Test with p-value threshold
      const pvalueResult = await this.stringApiService.getEnrichment(
        geneNames,
        TEST_CONFIG.enrichmentOptions.withPvalue
      );
      
      const defaultCount = defaultResult.length;
      const limitedCount = limitedResult.length;
      const pvalueCount = pvalueResult.length;
      
      // Limited results should have fewer or equal entries
      if (limitedCount <= defaultCount && pvalueCount <= defaultCount) {
        this.recordResult(
          'Enrichment Options',
          true,
          `Default: ${defaultCount}, Limited: ${limitedCount}, P-value filtered: ${pvalueCount}`
        );
      } else {
        this.recordResult(
          'Enrichment Options',
          false,
          'Options filtering did not work as expected'
        );
      }
      
      return { defaultResult, limitedResult, pvalueResult };
    } catch (error) {
      this.recordResult('Enrichment Options', false, error.message);
      return null;
    }
  }

  /**
   * Test 3: Test with cancer-related genes for pathway enrichment
   */
  async testCancerPathways() {
    this.log('Starting Test 3: Test cancer-related pathway enrichment');
    
    try {
      const cancerGenes = ENRICHMENT_TEST_DATA.mouseGeneNames.cancerRelated;
      
      const result = await this.stringApiService.getEnrichment(cancerGenes);
      
      // Look for cancer-related pathways in results
      const cancerRelatedTerms = result.filter(enrichment => 
        enrichment.term.toLowerCase().includes('cancer') ||
        enrichment.term.toLowerCase().includes('tumor') ||
        enrichment.term.toLowerCase().includes('cell cycle') ||
        enrichment.term.toLowerCase().includes('apoptosis') ||
        enrichment.description.toLowerCase().includes('cancer') ||
        enrichment.description.toLowerCase().includes('tumor')
      );
      
      if (result.length > 0 && cancerRelatedTerms.length > 0) {
        this.recordResult(
          'Cancer Pathways',
          true,
          `Found ${cancerRelatedTerms.length} cancer-related pathways out of ${result.length} total`
        );
        
        // Log cancer-related pathways
        cancerRelatedTerms.slice(0, 3).forEach(pathway => {
          this.log(`  Cancer pathway: ${pathway.term} (FDR: ${pathway.fdr})`);
        });
      } else {
        this.recordResult(
          'Cancer Pathways',
          false,
          'No cancer-related pathways found in enrichment results'
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Cancer Pathways', false, error.message);
      return null;
    }
  }

  /**
   * Test 4: Test with translation-related genes
   */
  async testTranslationPathways() {
    this.log('Starting Test 4: Test translation-related pathway enrichment');
    
    try {
      const translationGenes = ENRICHMENT_TEST_DATA.mouseGeneNames.translationRelated;
      
      const result = await this.stringApiService.getEnrichment(translationGenes);
      
      // Look for translation-related pathways
      const translationTerms = result.filter(enrichment => 
        enrichment.term.toLowerCase().includes('translation') ||
        enrichment.term.toLowerCase().includes('ribosome') ||
        enrichment.term.toLowerCase().includes('protein synthesis') ||
        enrichment.description.toLowerCase().includes('translation') ||
        enrichment.description.toLowerCase().includes('ribosome')
      );
      
      if (result.length > 0) {
        this.recordResult(
          'Translation Pathways',
          true,
          `Found ${translationTerms.length} translation-related pathways out of ${result.length} total`
        );
        
        // Log translation-related pathways
        translationTerms.slice(0, 3).forEach(pathway => {
          this.log(`  Translation pathway: ${pathway.term} (FDR: ${pathway.fdr})`);
        });
      } else {
        this.recordResult('Translation Pathways', false, 'No enrichment results found');
      }
      
      return result;
    } catch (error) {
      this.recordResult('Translation Pathways', false, error.message);
      return null;
    }
  }

  /**
   * Test 5: Test pathway category diversity
   */
  async testPathwayCategories() {
    this.log('Starting Test 5: Test pathway category diversity');
    
    try {
      const geneNames = ENRICHMENT_TEST_DATA.mouseGeneNames.medium;
      
      const result = await this.stringApiService.getEnrichment(geneNames);
      
      // Extract pathway categories from results
      const categories = new Set();
      result.forEach(enrichment => {
        if (enrichment.category) {
          categories.add(enrichment.category);
        } else if (enrichment.term) {
          // Try to infer category from term prefix
          const prefix = enrichment.term.split(':')[0];
          if (prefix) {
            categories.add(prefix);
          }
        }
      });
      
      const categoryArray = Array.from(categories);
      
      if (categoryArray.length >= 2) {
        this.recordResult(
          'Pathway Categories',
          true,
          `Found ${categoryArray.length} different pathway categories: ${categoryArray.join(', ')}`
        );
        
        // Log categories found
        categoryArray.forEach(category => {
          this.log(`  Category: ${category}`);
        });
      } else {
        this.recordResult(
          'Pathway Categories',
          false,
          `Only found ${categoryArray.length} pathway categories`
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Pathway Categories', false, error.message);
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
      const geneNames = ENRICHMENT_TEST_DATA.mouseGeneNames.large;
      
      const result = await this.stringApiService.getEnrichment(geneNames);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (duration < TEST_CONFIG.performanceThresholds.maxResponseTime && 
          result.length >= TEST_CONFIG.performanceThresholds.minEnrichments) {
        this.recordResult(
          'Performance Test',
          true,
          `Retrieved ${result.length} enrichments for ${geneNames.length} genes in ${duration}ms`
        );
      } else {
        this.recordResult(
          'Performance Test',
          false,
          `Performance issues: ${duration}ms for ${result.length} enrichments`
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Performance Test', false, error.message);
      return null;
    }
  }
  
  /**
   * Test 7: Test response parsing
   */
  async testResponseParsing() {
    this.log('Starting Test 7: Test TSV response parsing');
    
    try {
      const geneNames = ENRICHMENT_TEST_DATA.mouseGeneNames.small.slice(0, 2);
      
      const result = await this.stringApiService.getEnrichment(geneNames);
      
      // Test the parseTsvResponse method using validation schema
      const requiredFields = TEST_CONFIG.validationSchemas.enrichmentResponse.requiredFields;
      const typeChecks = TEST_CONFIG.validationSchemas.enrichmentResponse.typeChecks;
      
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
          this.log(`  Sample enrichment: ${JSON.stringify(result[0], null, 2)}`);
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
   * Test 8: Test FDR and p-value validation
   */
  async testStatisticalValidation() {
    this.log('Starting Test 8: Test statistical validation');
    
    try {
      const geneNames = ENRICHMENT_TEST_DATA.mouseGeneNames.medium;
      
      const result = await this.stringApiService.getEnrichment(geneNames);
      
      // Validate statistical values
      const validFDR = result.every(entry => {
        const fdr = parseFloat(entry.fdr);
        return fdr >= 0 && fdr <= 1;
      });
      
      const validPValue = result.every(entry => {
        const pValue = parseFloat(entry.p_value);
        return pValue >= 0 && pValue <= 1;
      });
      
      const validGeneCounts = result.every(entry => {
        const geneCount = parseInt(entry.number_of_genes);
        return geneCount > 0 && geneCount <= geneNames.length;
      });
      
      if (validFDR && validPValue && validGeneCounts) {
        this.recordResult(
          'Statistical Validation',
          true,
          `All ${result.length} enrichments have valid statistical values`
        );
        
        // Log statistical summary
        const avgFDR = result.reduce((sum, entry) => sum + parseFloat(entry.fdr), 0) / result.length;
        const avgPValue = result.reduce((sum, entry) => sum + parseFloat(entry.p_value), 0) / result.length;
        
        this.log(`  Average FDR: ${avgFDR.toFixed(4)}`);
        this.log(`  Average p-value: ${avgPValue.toFixed(4)}`);
      } else {
        this.recordResult(
          'Statistical Validation',
          false,
          'Invalid statistical values found in enrichment results'
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Statistical Validation', false, error.message);
      return null;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.log('🧪 Starting StringApiService getEnrichment Tests');
    this.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    // Run all tests
    await this.testBasicEnrichment();
    await this.testEnrichmentOptions();
    await this.testCancerPathways();
    await this.testTranslationPathways();
    await this.testPathwayCategories();
    await this.testPerformance();
    await this.testResponseParsing();
    await this.testStatisticalValidation();
    
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
export default GetEnrichmentTest;

// If running directly, execute tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const testRunner = new GetEnrichmentTest();
  testRunner.runAllTests().catch(console.error);
}
