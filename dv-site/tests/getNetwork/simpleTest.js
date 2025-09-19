#!/usr/bin/env node

/**
 * Simple test script for getNetwork functionality
 * Quick verification that the test setup works correctly
 */

import StringApiService from '../../src/services/StringApiService.js';

// Simple test configuration
const TEST_GENES = ['Eif5a', 'Actb', 'Gapdh'];

/**
 * Run a simple getNetwork test
 */
async function runSimpleTest() {
  console.log('🧪 Running Simple getNetwork Test');
  console.log('=' .repeat(50));
  
  try {
    console.log(`Testing with genes: ${TEST_GENES.join(', ')}`);
    
    // Step 1: Resolve gene names to STRING IDs
    console.log('\n1. Resolving gene names to STRING IDs...');
    const resolvedIds = await StringApiService.resolveIdentifiers(TEST_GENES, 'symbol');
    
    if (!resolvedIds || resolvedIds.length === 0) {
      throw new Error('Failed to resolve gene names');
    }
    
    console.log(`✅ Resolved ${resolvedIds.length} genes:`);
    resolvedIds.forEach(gene => {
      console.log(`   ${gene.queryItem} → ${gene.preferredName} (${gene.stringId})`);
    });
    
    // Step 2: Extract STRING IDs
    const stringIds = resolvedIds.map(item => item.stringId).filter(id => id);
    console.log(`\n2. Using STRING IDs: ${stringIds.join(', ')}`);
    
    // Step 3: Get network data
    console.log('\n3. Fetching network data...');
    const networkData = await StringApiService.getNetwork(stringIds);
    
    console.log(`✅ Retrieved ${networkData.length} interactions`);
    
    if (networkData.length > 0) {
      console.log('\nSample interactions:');
      networkData.slice(0, 3).forEach((interaction, index) => {
        console.log(`   ${index + 1}. ${interaction.stringId_A} ↔ ${interaction.stringId_B} (score: ${interaction.score})`);
      });
    }
    
    // Step 4: Test Cytoscape conversion
    console.log('\n4. Converting to Cytoscape format...');
    const cytoscapeData = StringApiService.convertToCytoscapeFormat(networkData);
    
    console.log(`✅ Converted to ${cytoscapeData.nodes.length} nodes and ${cytoscapeData.edges.length} edges`);
    
    if (cytoscapeData.nodes.length > 0) {
      console.log('\nSample node:');
      console.log(`   ${JSON.stringify(cytoscapeData.nodes[0].data, null, 2)}`);
    }
    
    if (cytoscapeData.edges.length > 0) {
      console.log('\nSample edge:');
      console.log(`   ${JSON.stringify(cytoscapeData.edges[0].data, null, 2)}`);
    }
    
    console.log('\n🎉 Simple test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
runSimpleTest();
