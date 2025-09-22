/**
 * Test runner for StringApiService getEnrichment tests
 * Provides easy execution of enrichment analysis tests
 */

import GetEnrichmentTest from './getEnrichment.test.js';

/**
 * Main test runner function
 */
async function runEnrichmentTests() {
  console.log('🚀 Starting StringApiService getEnrichment Test Suite');
  console.log('=' .repeat(80));
  
  try {
    const testRunner = new GetEnrichmentTest();
    const results = await testRunner.runAllTests();
    
    console.log('\n' + '=' .repeat(80));
    console.log('📋 Final Results Summary');
    console.log('=' .repeat(80));
    
    // Detailed results
    console.log(`Total Tests Executed: ${results.totalTests}`);
    console.log(`✅ Tests Passed: ${results.passed}`);
    console.log(`❌ Tests Failed: ${results.failed}`);
    console.log(`⏱️  Total Duration: ${results.duration}ms`);
    console.log(`📊 Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`);
    
    // Show failed tests if any
    if (results.failed > 0) {
      console.log('\n🔍 Failed Tests Details:');
      console.log('-'.repeat(40));
      
      results.results
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`❌ ${test.testName}: ${test.details}`);
        });
    }
    
    // Show passed tests summary
    if (results.passed > 0) {
      console.log('\n✅ Passed Tests:');
      console.log('-'.repeat(40));
      
      results.results
        .filter(test => test.passed)
        .forEach(test => {
          console.log(`✅ ${test.testName}: ${test.details}`);
        });
    }
    
    // Final status
    console.log('\n' + '=' .repeat(80));
    if (results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! The getEnrichment method is working correctly.');
    } else {
      console.log(`⚠️  ${results.failed} test(s) failed. Please review the issues above.`);
    }
    console.log('=' .repeat(80));
    
    return results;
    
  } catch (error) {
    console.error('💥 Test runner encountered an error:', error);
    console.error('Stack trace:', error.stack);
    return null;
  }
}

/**
 * Run tests with specific options
 */
async function runTestsWithOptions(options = {}) {
  console.log('🔧 Running tests with custom options:', options);
  
  // This could be extended to run specific tests or with different configurations
  return await runEnrichmentTests();
}

// Export functions for use in other modules
export { runEnrichmentTests, runTestsWithOptions };

// If running directly, execute the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runEnrichmentTests().catch(console.error);
}
