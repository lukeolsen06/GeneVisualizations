#!/usr/bin/env node

/**
 * Test script for gene enrichment functionality
 * Tests the enrichment logic that will be used in StringAnalysisSection
 */

import StringApiService from '../src/services/StringApiService.js';

// Mock gene objects similar to what GeneSetSelector provides
const mockGeneObjects = [
  {
    geneName: 'eif5a',
    log2fc: 2.5,
    padj: 0.001,
    expression: 'upregulated',
    originalData: {
      gene_id: 'ENSMUSG00000000001',
      gene_name: 'Eif5a',
      gene_description: 'Eukaryotic translation initiation factor 5A-1'
    }
  },
  {
    geneName: 'actb',
    log2fc: -1.8,
    padj: 0.003,
    expression: 'downregulated',
    originalData: {
      gene_id: 'ENSMUSG00000000002',
      gene_name: 'Actb',
      gene_description: 'Actin, cytoplasmic 1'
    }
  }
];

/**
 * Test the enrichment logic
 */
async function testEnrichment() {
  console.log('🧪 Testing Gene Enrichment Logic');
  console.log('=' .repeat(50));
  
  try {
    console.log(`Testing with ${mockGeneObjects.length} mock genes:`);
    mockGeneObjects.forEach(gene => {
      console.log(`  - ${gene.geneName} (log2fc: ${gene.log2fc}, padj: ${gene.padj})`);
    });

    // Step 1: Resolve gene identifiers
    console.log('\n1. Resolving gene identifiers...');
    const geneNames = mockGeneObjects.map(gene => gene.geneName);
    const resolvedIds = await StringApiService.resolveIdentifiers(geneNames, 'symbol');
    
    console.log(`✅ Resolved ${resolvedIds.length} genes:`);
    resolvedIds.forEach(item => {
      console.log(`   ${item.preferredName} → ${item.stringId}`);
      console.log(`   Annotation: ${item.annotation?.substring(0, 100)}...`);
    });

    // Step 2: Get functional annotations
    console.log('\n2. Getting functional annotations...');
    const stringIds = resolvedIds.map(item => item.stringId).filter(Boolean);
    const functionalAnnotations = await StringApiService.getFunctionalAnnotation(stringIds);
    
    console.log(`✅ Retrieved ${functionalAnnotations.length} functional annotations`);
    if (functionalAnnotations.length > 0) {
      console.log('\nSample functional annotation:');
      const sample = functionalAnnotations[0];
      console.log(`   String ID: ${sample.stringId}`);
      console.log(`   Term: ${sample.term}`);
      console.log(`   Description: ${sample.description}`);
    }

    // Step 3: Simulate the enrichment logic
    console.log('\n3. Simulating enrichment logic...');
    
    // Create lookup maps
    const resolvedLookup = new Map();
    resolvedIds.forEach(item => {
      resolvedLookup.set(item.preferredName?.toLowerCase(), item);
    });

    const functionalLookup = new Map();
    functionalAnnotations.forEach(annotation => {
      const stringId = annotation.stringId;
      if (!functionalLookup.has(stringId)) {
        functionalLookup.set(stringId, []);
      }
      functionalLookup.get(stringId).push({
        term: annotation.term,
        description: annotation.description
      });
    });

    // Enrich gene objects
    const enrichedGenes = mockGeneObjects.map(gene => {
      const resolved = resolvedLookup.get(gene.geneName);
      const functionalTerms = resolved ? functionalLookup.get(resolved.stringId) || [] : [];

      return {
        ...gene, // Keep all original gene data
        stringId: resolved?.stringId || null,
        annotation: resolved?.annotation || null,
        functionalTerms: functionalTerms,
        proteinInfo: {
          stringId: resolved?.stringId || null,
          description: resolved?.annotation || null,
          functionalTerms: functionalTerms
        }
      };
    });

    console.log(`✅ Enriched ${enrichedGenes.length} genes`);
    
    // Display enriched gene data
    console.log('\n📊 Enriched Gene Data:');
    enrichedGenes.forEach((gene, index) => {
      console.log(`\n${index + 1}. ${gene.geneName.toUpperCase()}:`);
      console.log(`   Original: log2fc=${gene.log2fc}, padj=${gene.padj}, expression=${gene.expression}`);
      console.log(`   STRING ID: ${gene.stringId || 'Not found'}`);
      console.log(`   Annotation: ${gene.annotation ? gene.annotation.substring(0, 100) + '...' : 'Not found'}`);
      console.log(`   Functional Terms: ${gene.functionalTerms.length}`);
      gene.functionalTerms.forEach((term, i) => {
        console.log(`     ${i + 1}. ${term.term}: ${term.description}`);
      });
    });

    console.log('\n🎉 Enrichment test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testEnrichment();
