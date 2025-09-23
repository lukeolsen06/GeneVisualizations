#!/usr/bin/env node

/**
 * Test script for the simplified gene enrichment structure
 */

import GeneEnrichmentService from '../src/services/GeneEnrichmentService.js';
import { convertToCytoscapeFormat } from '../src/services/StringDataUtils.js';

const mockGeneObjects = [
  {
    geneName: 'eif5a',
    log2fc: 2.5,
    padj: 0.001,
    expression: 'upregulated'
  }
];

async function testSimplifiedStructure() {
  console.log('🧪 Testing Simplified Gene Structure');
  console.log('=' .repeat(50));
  
  try {
    // Test enrichment
    console.log('1. Testing gene enrichment...');
    const enrichedGenes = await GeneEnrichmentService.enrichGenesWithStringData(mockGeneObjects);
    
    console.log('✅ Enriched gene structure:');
    console.log(JSON.stringify(enrichedGenes[0], null, 2));
    
    // Test Cytoscape conversion
    console.log('\n2. Testing Cytoscape conversion...');
    const mockNetworkData = [
      {
        stringId_A: '10090.ENSMUSP00000047008',
        stringId_B: '10090.ENSMUSP00000098066',
        preferredName_A: 'Eif5a',
        preferredName_B: 'Actb',
        score: '0.47'
      }
    ];
    
    const cytoscapeData = convertToCytoscapeFormat(mockNetworkData, enrichedGenes);
    
    console.log('✅ Cytoscape node data:');
    console.log(JSON.stringify(cytoscapeData.nodes[0], null, 2));
    
    console.log('\n🎉 Simplified structure test completed!');
    console.log('\n📋 Final node data includes:');
    const nodeData = cytoscapeData.nodes[0].data;
    console.log(`  - geneName: ${nodeData.geneName}`);
    console.log(`  - log2fc: ${nodeData.log2fc}`);
    console.log(`  - padj: ${nodeData.padj}`);
    console.log(`  - annotation: ${nodeData.annotation ? 'Present' : 'Missing'}`);
    console.log(`  - functionalTerms: ${nodeData.functionalTerms ? nodeData.functionalTerms.length : 0} terms`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testSimplifiedStructure();
