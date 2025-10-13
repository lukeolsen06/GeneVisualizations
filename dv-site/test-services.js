/**
 * Test script for new STRING services
 * Tests StringBackendService and EnhancedGeneEnrichmentService
 */

// Import our services (using dynamic imports for Node.js)
const StringBackendService = require('./src/services/StringBackendService.js').default;
const EnhancedGeneEnrichmentService = require('./src/services/EnhancedGeneEnrichmentService.js').default;

async function testStringBackendService() {
  console.log('🧪 Testing StringBackendService...\n');
  
  try {
    // Test 1: Get statistics
    console.log('1️⃣ Testing getStatistics()...');
    const stats = await StringBackendService.getStatistics();
    console.log('✅ Stats:', JSON.stringify(stats, null, 2));
    
    // Test 2: Resolve identifiers
    console.log('\n2️⃣ Testing resolveIdentifiers()...');
    const resolutionResult = await StringBackendService.resolveIdentifiers(
      ['Gnai3', 'Cdc45', 'Pcna'], 
      'symbol'
    );
    console.log('✅ Resolution Result:');
    console.log(`   - Total processed: ${resolutionResult.totalProcessed}`);
    console.log(`   - Resolved: ${resolutionResult.resolvedCount}`);
    console.log(`   - Success rate: ${(resolutionResult.successRate * 100).toFixed(1)}%`);
    console.log(`   - Mappings:`, resolutionResult.mappings.map(m => ({ 
      input: m.inputId, 
      resolved: m.isResolved, 
      stringId: m.stringId 
    })));
    
    // Test 3: Create network (if we have resolved genes)
    if (resolutionResult.resolvedCount >= 2) {
      console.log('\n3️⃣ Testing createNetwork()...');
      const geneNames = resolutionResult.mappings
        .filter(m => m.isResolved)
        .map(m => m.inputId);
      
      const networkResult = await StringBackendService.createNetwork(
        'test_comparison',
        geneNames,
        { confidenceThreshold: 400, networkType: 'full' }
      );
      console.log('✅ Network Result:');
      console.log(`   - Network ID: ${networkResult.id}`);
      console.log(`   - Nodes: ${networkResult.nodeCount}`);
      console.log(`   - Edges: ${networkResult.edgeCount}`);
      console.log(`   - Successful: ${networkResult.isSuccessful}`);
    }
    
    // Test 4: Query networks
    console.log('\n4️⃣ Testing queryNetworks()...');
    const queryResult = await StringBackendService.queryNetworks({
      page: 1,
      limit: 5,
      includeData: false
    });
    console.log('✅ Query Result:');
    console.log(`   - Total networks: ${queryResult.total}`);
    console.log(`   - Networks returned: ${queryResult.networks.length}`);
    
    console.log('\n✅ StringBackendService tests completed successfully!\n');
    
  } catch (error) {
    console.error('❌ StringBackendService test failed:', error.message);
  }
}

async function testEnhancedGeneEnrichmentService() {
  console.log('🧪 Testing EnhancedGeneEnrichmentService...\n');
  
  try {
    // Create mock gene objects (similar to what GeneSetSelector would provide)
    const mockGeneObjects = [
      {
        geneName: 'Gnai3',
        log2fc: 2.5,
        padj: 0.001,
        expression: 'upregulated'
      },
      {
        geneName: 'Cdc45', 
        log2fc: -1.8,
        padj: 0.005,
        expression: 'downregulated'
      },
      {
        geneName: 'Pcna',
        log2fc: 1.2,
        padj: 0.01,
        expression: 'upregulated'
      }
    ];
    
    console.log('1️⃣ Testing enrichGenesWithStringData()...');
    const enrichmentResult = await EnhancedGeneEnrichmentService.enrichGenesWithStringData(
      mockGeneObjects,
      'test_comparison',
      { confidenceThreshold: 400, networkType: 'full' }
    );
    
    console.log('✅ Enrichment Result:');
    console.log(`   - Total genes: ${enrichmentResult.stats.totalGenes}`);
    console.log(`   - Resolved genes: ${enrichmentResult.stats.resolvedGenes}`);
    console.log(`   - Success rate: ${(enrichmentResult.stats.successRate * 100).toFixed(1)}%`);
    console.log(`   - Network nodes: ${enrichmentResult.stats.networkNodes}`);
    console.log(`   - Network edges: ${enrichmentResult.stats.networkEdges}`);
    console.log(`   - Network ID: ${enrichmentResult.stats.networkId}`);
    
    console.log('\n   Enriched Genes:');
    enrichmentResult.enrichedGenes.forEach(gene => {
      console.log(`   - ${gene.geneName}: resolved=${gene.isResolved}, stringId=${gene.stringId || 'none'}`);
    });
    
    console.log(`\n   Network data available: ${enrichmentResult.networkData ? 'Yes' : 'No'}`);
    console.log(`   Raw network data available: ${enrichmentResult.rawNetworkData ? 'Yes' : 'No'}`);
    
    // Test 2: Get enrichment stats (backward compatibility)
    console.log('\n2️⃣ Testing getEnrichmentStats()...');
    const stats = EnhancedGeneEnrichmentService.getEnrichmentStats(
      mockGeneObjects, 
      enrichmentResult.enrichedGenes
    );
    console.log('✅ Stats:', JSON.stringify(stats, null, 2));
    
    console.log('\n✅ EnhancedGeneEnrichmentService tests completed successfully!\n');
    
  } catch (error) {
    console.error('❌ EnhancedGeneEnrichmentService test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting STRING Services Tests\n');
  console.log('=' .repeat(50));
  
  await testStringBackendService();
  console.log('=' .repeat(50));
  await testEnhancedGeneEnrichmentService();
  console.log('=' .repeat(50));
  
  console.log('🎉 All tests completed!\n');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testStringBackendService, testEnhancedGeneEnrichmentService };
