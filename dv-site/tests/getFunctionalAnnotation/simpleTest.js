/**
 * Simple test for StringApiService getFunctionalAnnotation method
 * Quick test to verify basic functionality
 */

import StringApiService from '../../src/services/StringApiService.js';

/**
 * Simple test runner for getFunctionalAnnotation
 */
class SimpleFunctionalAnnotationTest {
  constructor() {
    this.stringApiService = StringApiService;
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
   * Simple test for basic functional annotation functionality
   */
  async testBasicFunctionalAnnotation() {
    this.log('🧪 Testing basic getFunctionalAnnotation functionality');
    
    try {
      // Test with a small set of well-known mouse genes
      const testGenes = ['Eif5a', 'Actb', 'Gapdh'];
      
      this.log(`Testing with genes: ${testGenes.join(', ')}`);
      
      const startTime = Date.now();
      const result = await this.stringApiService.getFunctionalAnnotation(testGenes);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      // Basic validation
      if (Array.isArray(result) && result.length > 0) {
        this.log(`✅ SUCCESS: Retrieved ${result.length} functional annotations in ${duration}ms`, 'success');
        
        // Log sample results
        this.log('Sample annotations:');
        result.slice(0, 3).forEach((annotation, index) => {
          this.log(`  ${index + 1}. ${annotation.preferredNames}: ${annotation.term} (${annotation.description})`);
        });
        
        // Check for required fields
        const hasRequiredFields = result.every(entry => 
          entry.category && entry.term && entry.preferredNames
        );
        
        if (hasRequiredFields) {
          this.log('✅ All annotations have required fields (category, term, preferredNames)', 'success');
        } else {
          this.log('⚠️  Some annotations missing required fields', 'error');
        }
        
        return {
          success: true,
          count: result.length,
          duration: duration,
          sample: result.slice(0, 3)
        };
      } else {
        this.log('❌ FAILED: No functional annotations returned', 'error');
        return {
          success: false,
          error: 'No annotations returned',
          duration: duration
        };
      }
    } catch (error) {
      this.log(`❌ FAILED: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test with translation-related genes
   */
  async testTranslationGenes() {
    this.log('🧪 Testing with translation-related genes');
    
    try {
      const translationGenes = ['Eif5a', 'Eif2s1', 'Rps6'];
      
      this.log(`Testing with translation genes: ${translationGenes.join(', ')}`);
      
      const result = await this.stringApiService.getFunctionalAnnotation(translationGenes);
      
      if (Array.isArray(result) && result.length > 0) {
        // Look for translation-related annotations
        const translationAnnotations = result.filter(annotation => 
          annotation.term.toLowerCase().includes('translation') ||
          annotation.term.toLowerCase().includes('ribosome') ||
          annotation.description?.toLowerCase().includes('translation')
        );
        
        this.log(`✅ Retrieved ${result.length} total annotations`, 'success');
        this.log(`Found ${translationAnnotations.length} translation-related annotations`, 'success');
        
        if (translationAnnotations.length > 0) {
          this.log('Translation-related annotations:');
          translationAnnotations.slice(0, 2).forEach((annotation, index) => {
            this.log(`  ${index + 1}. ${annotation.preferredNames}: ${annotation.term}`);
          });
        }
        
        return {
          success: true,
          totalCount: result.length,
          translationCount: translationAnnotations.length
        };
      } else {
        this.log('❌ FAILED: No annotations returned for translation genes', 'error');
        return { success: false };
      }
    } catch (error) {
      this.log(`❌ FAILED: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * Test error handling with invalid genes
   */
  async testErrorHandling() {
    this.log('🧪 Testing error handling with invalid genes');
    
    try {
      const invalidGenes = ['InvalidGene123', 'NonExistentGene'];
      
      this.log(`Testing with invalid genes: ${invalidGenes.join(', ')}`);
      
      const result = await this.stringApiService.getFunctionalAnnotation(invalidGenes);
      
      // For invalid genes, we might get empty results or errors
      if (Array.isArray(result)) {
        if (result.length === 0) {
          this.log('✅ SUCCESS: Correctly handled invalid genes (empty result)', 'success');
          return { success: true, handled: 'empty_result' };
        } else {
          this.log(`⚠️  Unexpected: Got ${result.length} results for invalid genes`, 'error');
          return { success: false, unexpected: true };
        }
      } else {
        this.log('✅ SUCCESS: Correctly handled invalid genes (non-array result)', 'success');
        return { success: true, handled: 'non_array' };
      }
    } catch (error) {
      this.log(`✅ SUCCESS: Correctly threw error for invalid genes: ${error.message}`, 'success');
      return { success: true, handled: 'error_thrown' };
    }
  }

  /**
   * Run all simple tests
   */
  async runAllTests() {
    this.log('🚀 Starting Simple getFunctionalAnnotation Tests');
    this.log('=' .repeat(50));
    
    const results = {
      basic: await this.testBasicFunctionalAnnotation(),
      translation: await this.testTranslationGenes(),
      errorHandling: await this.testErrorHandling()
    };
    
    this.log('=' .repeat(50));
    this.log('📊 Simple Test Summary');
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r.success).length;
    
    this.log(`Total Tests: ${totalTests}`);
    this.log(`Passed: ${passedTests}`);
    this.log(`Failed: ${totalTests - passedTests}`);
    this.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
      this.log('🎉 All simple tests passed!', 'success');
    } else {
      this.log(`⚠️  ${totalTests - passedTests} test(s) failed`, 'error');
    }
    
    return results;
  }
}

// Export for use in other files
export default SimpleFunctionalAnnotationTest;

// If running directly, execute tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const testRunner = new SimpleFunctionalAnnotationTest();
  testRunner.runAllTests().catch(console.error);
}
