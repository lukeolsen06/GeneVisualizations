/**
 * Test file for StringApiService getFunctionalAnnotation method
 * Tests the STRING API functional annotation functionality
 */

import StringApiService from '../../src/services/StringApiService.js';
import { FUNCTIONAL_ANNOTATION_TEST_DATA } from './testData.js';

// Test configuration using data from testData.js
const TEST_CONFIG = {
  // Use gene names from testData.js
  testGeneNames: FUNCTIONAL_ANNOTATION_TEST_DATA.mouseGeneNames.valid,
  
  // Use functional annotation options from testData.js
  functionalAnnotationOptions: FUNCTIONAL_ANNOTATION_TEST_DATA.functionalAnnotationOptions,
  
  // Use validation schemas from testData.js
  validationSchemas: FUNCTIONAL_ANNOTATION_TEST_DATA.validationSchemas,
  
  // Use performance thresholds from testData.js
  performanceThresholds: FUNCTIONAL_ANNOTATION_TEST_DATA.performanceThresholds,
  
  // Use expected functional categories
  expectedFunctionalCategories: FUNCTIONAL_ANNOTATION_TEST_DATA.expectedFunctionalCategories,
};

/**
 * Test suite for getFunctionalAnnotation method
 */
class GetFunctionalAnnotationTest {
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
   * Test 1: Basic functional annotation functionality with gene names
   */
  async testBasicFunctionalAnnotation() {
    this.log('Starting Test 1: Basic functional annotation with gene names');
    
    try {
      // Use gene names directly (STRING API handles mapping internally)
      const geneNames = FUNCTIONAL_ANNOTATION_TEST_DATA.mouseGeneNames.small;
      
      // Get functional annotation data directly with gene names
      const result = await this.stringApiService.getFunctionalAnnotation(geneNames);
      
      // Validate response structure using schema from testData.js
      const isValidArray = Array.isArray(result);
      const hasValidEntries = result.length > 0;
      const requiredFields = TEST_CONFIG.validationSchemas.functionalAnnotationResponse.requiredFields;
      const hasRequiredFields = result.every(entry => 
        requiredFields.every(field => entry.hasOwnProperty(field) && entry[field] !== '')
      );
      
      if (isValidArray && hasValidEntries && hasRequiredFields) {
        this.recordResult(
          'Basic Functional Annotation',
          true,
          `Retrieved ${result.length} functional annotations for ${geneNames.join(', ')}`
        );
        
        // Log sample annotations
        result.slice(0, 3).forEach(annotation => {
          this.log(`  Gene: ${annotation.preferredNames} - ${annotation.term} (${annotation.description})`);
        });
        
        return result;
      } else {
        this.recordResult('Basic Functional Annotation', false, 'Invalid response structure');
        return null;
      }
    } catch (error) {
      this.recordResult('Basic Functional Annotation', false, error.message);
      return null;
    }
  }

  /**
   * Test 2: Test with different functional annotation options
   */
  async testFunctionalAnnotationOptions() {
    this.log('Starting Test 2: Test different functional annotation options');
    
    try {
      const geneNames = FUNCTIONAL_ANNOTATION_TEST_DATA.mouseGeneNames.small;
      
      // Test with default options
      const defaultResult = await this.stringApiService.getFunctionalAnnotation(geneNames);
      
      // Test with limit option (if supported by API)
      const limitedResult = await this.stringApiService.getFunctionalAnnotation(
        geneNames,
        TEST_CONFIG.functionalAnnotationOptions.withLimit
      );
      
      const defaultCount = defaultResult.length;
      const limitedCount = limitedResult.length;
      
      // Both should return valid results
      if (defaultCount > 0 && limitedCount >= 0) {
        this.recordResult(
          'Functional Annotation Options',
          true,
          `Default: ${defaultCount} annotations, Limited: ${limitedCount} annotations`
        );
      } else {
        this.recordResult(
          'Functional Annotation Options',
          false,
          'Options filtering did not work as expected'
        );
      }
      
      return { defaultResult, limitedResult };
    } catch (error) {
      this.recordResult('Functional Annotation Options', false, error.message);
      return null;
    }
  }

  /**
   * Test 3: Test with translation-related genes for functional annotation
   */
  async testTranslationAnnotations() {
    this.log('Starting Test 3: Test translation-related functional annotations');
    
    try {
      const translationGenes = FUNCTIONAL_ANNOTATION_TEST_DATA.mouseGeneNames.translationRelated;
      
      const result = await this.stringApiService.getFunctionalAnnotation(translationGenes);
      
      // Look for translation-related annotations in results
      const translationAnnotations = result.filter(annotation => 
        annotation.term.toLowerCase().includes('translation') ||
        annotation.term.toLowerCase().includes('ribosome') ||
        annotation.term.toLowerCase().includes('protein synthesis') ||
        annotation.description?.toLowerCase().includes('translation') ||
        annotation.description?.toLowerCase().includes('ribosome')
      );
      
      if (result.length > 0 && translationAnnotations.length > 0) {
        this.recordResult(
          'Translation Annotations',
          true,
          `Found ${translationAnnotations.length} translation-related annotations out of ${result.length} total`
        );
        
        // Log translation-related annotations
        translationAnnotations.slice(0, 3).forEach(annotation => {
          this.log(`  Translation annotation: ${annotation.preferredNames} - ${annotation.term}`);
        });
      } else {
        this.recordResult(
          'Translation Annotations',
          false,
          'No translation-related annotations found in functional annotation results'
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Translation Annotations', false, error.message);
      return null;
    }
  }

  /**
   * Test 4: Test with cancer-related genes
   */
  async testCancerAnnotations() {
    this.log('Starting Test 4: Test cancer-related functional annotations');
    
    try {
      const cancerGenes = FUNCTIONAL_ANNOTATION_TEST_DATA.mouseGeneNames.cancerRelated;
      
      const result = await this.stringApiService.getFunctionalAnnotation(cancerGenes);
      
      // Look for cancer-related annotations in results
      const cancerAnnotations = result.filter(annotation => 
        annotation.term.toLowerCase().includes('cell cycle') ||
        annotation.term.toLowerCase().includes('apoptosis') ||
        annotation.term.toLowerCase().includes('tumor') ||
        annotation.term.toLowerCase().includes('oncogene') ||
        annotation.description?.toLowerCase().includes('cancer') ||
        annotation.description?.toLowerCase().includes('tumor')
      );
      
      if (result.length > 0 && cancerAnnotations.length > 0) {
        this.recordResult(
          'Cancer Annotations',
          true,
          `Found ${cancerAnnotations.length} cancer-related annotations out of ${result.length} total`
        );
        
        // Log cancer-related annotations
        cancerAnnotations.slice(0, 3).forEach(annotation => {
          this.log(`  Cancer annotation: ${annotation.preferredNames} - ${annotation.term}`);
        });
      } else {
        this.recordResult(
          'Cancer Annotations',
          false,
          'No cancer-related annotations found in functional annotation results'
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Cancer Annotations', false, error.message);
      return null;
    }
  }

  /**
   * Test 5: Test annotation type diversity
   */
  async testAnnotationTypes() {
    this.log('Starting Test 5: Test annotation type diversity');
    
    try {
      const geneNames = FUNCTIONAL_ANNOTATION_TEST_DATA.mouseGeneNames.medium;
      
      const result = await this.stringApiService.getFunctionalAnnotation(geneNames);
      
      // Extract annotation types from results
      const annotationTypes = new Set();
      result.forEach(annotation => {
        if (annotation.category) {
          annotationTypes.add(annotation.category);
        } else if (annotation.term) {
          // Try to infer type from term prefix
          const prefix = annotation.term.split(':')[0];
          if (prefix) {
            annotationTypes.add(prefix);
          }
        }
      });
      
      const typeArray = Array.from(annotationTypes);
      
      if (typeArray.length >= 1) {
        this.recordResult(
          'Annotation Types',
          true,
          `Found ${typeArray.length} different annotation types: ${typeArray.join(', ')}`
        );
        
        // Log types found
        typeArray.forEach(type => {
          this.log(`  Type: ${type}`);
        });
      } else {
        this.recordResult(
          'Annotation Types',
          false,
          `Only found ${typeArray.length} annotation types`
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Annotation Types', false, error.message);
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
      const geneNames = FUNCTIONAL_ANNOTATION_TEST_DATA.mouseGeneNames.large;
      
      const result = await this.stringApiService.getFunctionalAnnotation(geneNames);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (duration < TEST_CONFIG.performanceThresholds.maxResponseTime && 
          result.length >= TEST_CONFIG.performanceThresholds.minAnnotations) {
        this.recordResult(
          'Performance Test',
          true,
          `Retrieved ${result.length} annotations for ${geneNames.length} genes in ${duration}ms`
        );
      } else {
        this.recordResult(
          'Performance Test',
          false,
          `Performance issues: ${duration}ms for ${result.length} annotations`
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
      const geneNames = FUNCTIONAL_ANNOTATION_TEST_DATA.mouseGeneNames.small.slice(0, 2);
      
      const result = await this.stringApiService.getFunctionalAnnotation(geneNames);
      
      // Test the parseTsvResponse method using validation schema
      const requiredFields = TEST_CONFIG.validationSchemas.functionalAnnotationResponse.requiredFields;
      const typeChecks = TEST_CONFIG.validationSchemas.functionalAnnotationResponse.typeChecks;
      
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
          this.log(`  Sample annotation: ${JSON.stringify(result[0], null, 2)}`);
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
   * Test 8: Test annotation quality and completeness
   */
  async testAnnotationQuality() {
    this.log('Starting Test 8: Test annotation quality and completeness');
    
    try {
      const geneNames = FUNCTIONAL_ANNOTATION_TEST_DATA.mouseGeneNames.medium;
      
      const result = await this.stringApiService.getFunctionalAnnotation(geneNames);
      
      // Validate annotation quality
      const hasValidAnnotations = result.every(entry => {
        const term = entry.term;
        return term && term.length > 0 && !term.includes('undefined');
      });
      
      const hasValidNames = result.every(entry => {
        const name = entry.preferredNames;
        return name && name.length > 0 && !name.includes('undefined');
      });
      
      const hasValidCategories = result.every(entry => {
        const category = entry.category;
        return category && category.length > 0 && !category.includes('undefined');
      });
      
      if (hasValidAnnotations && hasValidNames && hasValidCategories) {
        this.recordResult(
          'Annotation Quality',
          true,
          `All ${result.length} annotations have valid structure and content`
        );
        
        // Log quality summary
        const avgTermLength = result.reduce((sum, entry) => sum + entry.term.length, 0) / result.length;
        this.log(`  Average term length: ${avgTermLength.toFixed(1)} characters`);
      } else {
        this.recordResult(
          'Annotation Quality',
          false,
          'Invalid annotation structure or content found'
        );
      }
      
      return result;
    } catch (error) {
      this.recordResult('Annotation Quality', false, error.message);
      return null;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.log('🧪 Starting StringApiService getFunctionalAnnotation Tests');
    this.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    // Run all tests
    await this.testBasicFunctionalAnnotation();
    await this.testFunctionalAnnotationOptions();
    await this.testTranslationAnnotations();
    await this.testCancerAnnotations();
    await this.testAnnotationTypes();
    await this.testPerformance();
    await this.testResponseParsing();
    await this.testAnnotationQuality();
    
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
export default GetFunctionalAnnotationTest;

// If running directly, execute tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const testRunner = new GetFunctionalAnnotationTest();
  testRunner.runAllTests().catch(console.error);
}
