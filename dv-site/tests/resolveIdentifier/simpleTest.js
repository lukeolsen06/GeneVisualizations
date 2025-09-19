/**
 * Simple test script for resolveIdentifiers API call
 * This is a minimal test to verify the API works
 */

import StringApiService from '../../src/services/StringApiService.js';

async function testResolveIdentifiers() {
  console.log('🧪 Testing StringApiService resolveIdentifiers method...\n');
  
  try {
    // Test with a few common mouse genes
    const testGenes = ['Eif5a', 'Actb', 'Gapdh'];
    
    console.log(`Testing with genes: ${testGenes.join(', ')}`);
    console.log('Making API call...\n');
    
    const result = await StringApiService.resolveIdentifiers(testGenes, 'symbol');
    
    console.log('✅ API call successful!');
    console.log(`📊 Resolved ${result.length} genes:`);
    console.log('=' .repeat(50));
    
    result.forEach((gene, index) => {
      console.log(`${index + 1}. ${gene.queryItem}`);
      console.log(`   String ID: ${gene.stringId}`);
      console.log(`   Preferred Name: ${gene.preferredName}`);
      if (gene.annotation) {
        console.log(`   Annotation: ${gene.annotation}`);
      }
      console.log('');
    });
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
  }
}

// Run the test
testResolveIdentifiers();
