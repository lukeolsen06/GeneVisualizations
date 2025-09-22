/**
 * Simple test for StringApiService getEnrichment method
 * Quick test to verify basic functionality
 */

import StringApiService from '../../src/services/StringApiService.js';

/**
 * Simple enrichment test with basic gene set
 */
async function simpleEnrichmentTest() {
  console.log('🧪 Simple getEnrichment Test');
  console.log('=' .repeat(40));
  
  try {
    // Test with a small set of well-known genes
    const testGenes = ['Eif5a', 'Actb', 'Gapdh'];
    
    console.log(`Testing with genes: ${testGenes.join(', ')}`);
    console.log('Calling getEnrichment...');
    
    const startTime = Date.now();
    const result = await StringApiService.getEnrichment(testGenes);
    const endTime = Date.now();
    
    console.log(`✅ Enrichment completed in ${endTime - startTime}ms`);
    console.log(`📊 Found ${result.length} enriched pathways`);
    
    if (result.length > 0) {
      console.log('\n🔍 Sample enrichment results:');
      result.slice(0, 5).forEach((enrichment, index) => {
        console.log(`  ${index + 1}. ${enrichment.term}`);
        console.log(`     Description: ${enrichment.description}`);
        console.log(`     Genes: ${enrichment.number_of_genes}, FDR: ${enrichment.fdr}, p-value: ${enrichment.p_value}`);
        console.log('');
      });
      
      // Check for common pathway types
      const pathwayTypes = new Set();
      result.forEach(enrichment => {
        if (enrichment.category) {
          pathwayTypes.add(enrichment.category);
        } else if (enrichment.term) {
          const prefix = enrichment.term.split(':')[0];
          if (prefix) pathwayTypes.add(prefix);
        }
      });
      
      console.log(`📈 Pathway categories found: ${Array.from(pathwayTypes).join(', ')}`);
      
      // Check statistical validity
      const validStats = result.every(entry => {
        const fdr = parseFloat(entry.fdr);
        const pValue = parseFloat(entry.p_value);
        return fdr >= 0 && fdr <= 1 && pValue >= 0 && pValue <= 1;
      });
      
      console.log(`📊 Statistical validation: ${validStats ? '✅ All values valid' : '❌ Invalid values found'}`);
      
      console.log('\n🎉 Simple test PASSED!');
      return true;
      
    } else {
      console.log('⚠️  No enrichment results found');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Simple test FAILED:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

/**
 * Test with different gene sets
 */
async function testDifferentGeneSets() {
  console.log('\n🧪 Testing different gene sets');
  console.log('=' .repeat(40));
  
  const testSets = [
    {
      name: 'Cancer genes',
      genes: ['Tp53', 'Mdm2', 'Myc']
    },
    {
      name: 'Translation genes', 
      genes: ['Eif5a', 'Eif2s1', 'Rps6']
    },
    {
      name: 'Single gene',
      genes: ['Actb']
    }
  ];
  
  for (const testSet of testSets) {
    console.log(`\nTesting ${testSet.name}: ${testSet.genes.join(', ')}`);
    
    try {
      const result = await StringApiService.getEnrichment(testSet.genes);
      console.log(`  ✅ Found ${result.length} enriched pathways`);
      
      if (result.length > 0) {
        const topResult = result[0];
        console.log(`  🔝 Top pathway: ${topResult.term} (FDR: ${topResult.fdr})`);
      }
      
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
  }
}

/**
 * Main simple test runner
 */
async function runSimpleTests() {
  console.log('🚀 Running Simple getEnrichment Tests');
  console.log('=' .repeat(50));
  
  const basicTest = await simpleEnrichmentTest();
  
  if (basicTest) {
    await testDifferentGeneSets();
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Simple tests completed');
}

// Export for use in other modules
export { simpleEnrichmentTest, testDifferentGeneSets, runSimpleTests };

// If running directly, execute the simple tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runSimpleTests().catch(console.error);
}
