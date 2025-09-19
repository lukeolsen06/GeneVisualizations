#!/usr/bin/env node

/**
 * Test runner for StringApiService resolveIdentifiers tests
 * Run this script to execute all tests
 */

import ResolveIdentifiersTest from './resolveIdentifiers.test.js';
import { TEST_DATA } from './testData.js';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Print colored output
 */
function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print test banner
 */
function printBanner() {
  colorLog('=' .repeat(80), 'cyan');
  colorLog('🧪 STRING API SERVICE - RESOLVE IDENTIFIERS TEST SUITE', 'bright');
  colorLog('=' .repeat(80), 'cyan');
  colorLog('');
  colorLog('Testing the resolveIdentifiers method of StringApiService', 'blue');
  colorLog('This test suite validates API calls to STRING database', 'blue');
  colorLog('');
}

/**
 * Print test data summary
 */
function printTestDataSummary() {
  colorLog('📊 Test Data Summary:', 'yellow');
  colorLog(`  • Valid gene symbols: ${TEST_DATA.mouseGeneSymbols.valid.length}`, 'blue');
  colorLog(`  • Invalid gene symbols: ${TEST_DATA.mouseGeneSymbols.invalid.length}`, 'blue');
  colorLog(`  • Mixed test set: ${TEST_DATA.mouseGeneSymbols.mixed.length}`, 'blue');
  colorLog(`  • Ensembl IDs: ${TEST_DATA.mouseEnsemblIds.valid.length}`, 'blue');
  colorLog(`  • Test configurations: ${Object.keys(TEST_DATA.testConfigs).length}`, 'blue');
  colorLog('');
}

/**
 * Print detailed results
 */
function printDetailedResults(results) {
  colorLog('📋 Detailed Test Results:', 'yellow');
  colorLog('-'.repeat(60), 'cyan');
  
  results.results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const color = result.passed ? 'green' : 'red';
    
    colorLog(`${index + 1}. ${status} - ${result.testName}`, color);
    if (result.details) {
      colorLog(`   Details: ${result.details}`, 'blue');
    }
    colorLog(`   Time: ${new Date(result.timestamp).toLocaleTimeString()}`, 'magenta');
    colorLog('');
  });
}

/**
 * Print summary statistics
 */
function printSummary(results) {
  colorLog('📈 Summary Statistics:', 'yellow');
  colorLog('-'.repeat(40), 'cyan');
  
  const successRate = ((results.passed / results.totalTests) * 100).toFixed(1);
  const duration = (results.duration / 1000).toFixed(2);
  
  colorLog(`Total Tests: ${results.totalTests}`, 'blue');
  colorLog(`Passed: ${results.passed}`, 'green');
  colorLog(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  colorLog(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  colorLog(`Duration: ${duration}s`, 'blue');
  colorLog('');
  
  if (results.failed === 0) {
    colorLog('🎉 All tests passed successfully!', 'green');
  } else {
    colorLog(`⚠️  ${results.failed} test(s) failed. Please review the details above.`, 'yellow');
  }
}

/**
 * Print recommendations
 */
function printRecommendations(results) {
  colorLog('💡 Recommendations:', 'yellow');
  colorLog('-'.repeat(40), 'cyan');
  
  if (results.failed === 0) {
    colorLog('• All tests passed! The resolveIdentifiers method is working correctly.', 'green');
    colorLog('• Consider adding more edge cases for comprehensive testing.', 'blue');
    colorLog('• Monitor API response times in production.', 'blue');
  } else {
    colorLog('• Review failed tests and check API connectivity.', 'red');
    colorLog('• Verify that the STRING API is accessible.', 'red');
    colorLog('• Check if gene symbols are valid for the target species (mouse).', 'red');
  }
  
  colorLog('• Consider implementing automated testing in CI/CD pipeline.', 'blue');
  colorLog('• Add error handling tests for network failures.', 'blue');
  colorLog('');
}

/**
 * Main test execution function
 */
async function runTests() {
  try {
    printBanner();
    printTestDataSummary();
    
    colorLog('🚀 Starting test execution...', 'bright');
    colorLog('');
    
    const testRunner = new ResolveIdentifiersTest();
    const results = await testRunner.runAllTests();
    
    colorLog('');
    printDetailedResults(results);
    printSummary(results);
    printRecommendations(results);
    
    colorLog('=' .repeat(80), 'cyan');
    colorLog('Test execution completed!', 'bright');
    colorLog('=' .repeat(80), 'cyan');
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
    
  } catch (error) {
    colorLog('💥 Test execution failed with error:', 'red');
    colorLog(error.message, 'red');
    colorLog('');
    colorLog('Stack trace:', 'red');
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  colorLog('STRING API Service Test Runner', 'bright');
  colorLog('');
  colorLog('Usage: node runTests.js [options]', 'blue');
  colorLog('');
  colorLog('Options:', 'yellow');
  colorLog('  --help, -h     Show this help message', 'blue');
  colorLog('  --verbose, -v  Enable verbose output', 'blue');
  colorLog('');
  process.exit(0);
}

// Run tests
runTests();
