#!/usr/bin/env node

/**
 * Test runner for StringApiService getNetwork tests
 * Run this script to execute all network tests
 */

import GetNetworkTest from './getNetwork.test.js';
import { NETWORK_TEST_DATA } from './testData.js';

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
  colorLog('🧪 STRING API SERVICE - GET NETWORK TEST SUITE', 'bright');
  colorLog('=' .repeat(80), 'cyan');
  colorLog('');
  colorLog('Testing the getNetwork method of StringApiService', 'blue');
  colorLog('This test suite validates network data fetching from STRING database', 'blue');
  colorLog('');
}

/**
 * Print test data summary
 */
function printTestDataSummary() {
  colorLog('📊 Test Data Summary:', 'yellow');
  colorLog(`  • Valid gene names: ${NETWORK_TEST_DATA.mouseGeneNames.valid.length}`, 'blue');
  colorLog(`  • Small test set: ${NETWORK_TEST_DATA.mouseGeneNames.small.length}`, 'blue');
  colorLog(`  • Medium test set: ${NETWORK_TEST_DATA.mouseGeneNames.medium.length}`, 'blue');
  colorLog(`  • Large test set: ${NETWORK_TEST_DATA.mouseGeneNames.large.length}`, 'blue');
  colorLog(`  • Confidence thresholds: ${Object.keys(NETWORK_TEST_DATA.networkOptions.confidenceThresholds).length}`, 'blue');
  colorLog(`  • Network types: ${Object.keys(NETWORK_TEST_DATA.networkOptions.networkTypes).length}`, 'blue');
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
 * Print network-specific recommendations
 */
function printRecommendations(results) {
  colorLog('💡 Recommendations:', 'yellow');
  colorLog('-'.repeat(40), 'cyan');
  
  if (results.failed === 0) {
    colorLog('• All tests passed! The getNetwork method is working correctly.', 'green');
    colorLog('• Network data is being retrieved and parsed successfully.', 'green');
    colorLog('• Cytoscape format conversion is working properly.', 'green');
    colorLog('• Consider testing with larger protein sets for comprehensive validation.', 'blue');
  } else {
    colorLog('• Review failed tests and check API connectivity.', 'red');
    colorLog('• Verify that the STRING API is accessible.', 'red');
    colorLog('• Check if STRING IDs are valid for the target species (mouse).', 'red');
    colorLog('• Ensure network parameters are correctly formatted.', 'red');
  }
  
  colorLog('• Monitor API response times for different confidence thresholds.', 'blue');
  colorLog('• Test with different network types (physical vs functional).', 'blue');
  colorLog('• Consider implementing caching for frequently accessed networks.', 'blue');
  colorLog('• Add error handling tests for network failures and timeouts.', 'blue');
  colorLog('');
}

/**
 * Print network testing tips
 */
function printNetworkTips() {
  colorLog('🔬 Network Testing Tips:', 'yellow');
  colorLog('-'.repeat(40), 'cyan');
  colorLog('• Low confidence thresholds (150) return more interactions', 'blue');
  colorLog('• High confidence thresholds (700+) return fewer, high-quality interactions', 'blue');
  colorLog('• Physical networks show direct protein-protein interactions', 'blue');
  colorLog('• Functional networks include indirect functional associations', 'blue');
  colorLog('• Cytoscape format is optimized for network visualization', 'blue');
  colorLog('• Protein info integration adds biological context to nodes', 'blue');
  colorLog('');
}

/**
 * Main test execution function
 */
async function runTests() {
  try {
    printBanner();
    printTestDataSummary();
    printNetworkTips();
    
    colorLog('🚀 Starting test execution...', 'bright');
    colorLog('');
    
    const testRunner = new GetNetworkTest();
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
  colorLog('STRING API Service Network Test Runner', 'bright');
  colorLog('');
  colorLog('Usage: node runTests.js [options]', 'blue');
  colorLog('');
  colorLog('Options:', 'yellow');
  colorLog('  --help, -h     Show this help message', 'blue');
  colorLog('  --verbose, -v  Enable verbose output', 'blue');
  colorLog('');
  colorLog('This test suite validates:', 'yellow');
  colorLog('  • Gene name resolution to STRING IDs', 'blue');
  colorLog('  • Basic network data retrieval', 'blue');
  colorLog('  • Different confidence thresholds', 'blue');
  colorLog('  • Various network types', 'blue');
  colorLog('  • Cytoscape format conversion', 'blue');
  colorLog('  • Protein info integration', 'blue');
  colorLog('  • Performance with larger datasets', 'blue');
  colorLog('');
  process.exit(0);
}

// Run tests
runTests();
