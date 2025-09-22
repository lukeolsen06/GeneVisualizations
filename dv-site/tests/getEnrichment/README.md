# getEnrichment Test Suite

This directory contains comprehensive unit tests for the `StringApiService.getEnrichment()` method, which performs functional enrichment analysis on protein sets using the STRING API.

## Overview

The `getEnrichment()` method analyzes a set of proteins to identify enriched biological pathways, processes, and functions. Testing this without prior STRING Identifier mapping beforehand, as done with the `getNetwork()` test

## Test Files

### 1. `getEnrichment.test.js`
The main test suite containing 8 comprehensive test cases:

- **Basic Enrichment**: Tests basic functionality with small gene sets
- **Enrichment Options**: Tests different filtering options (limit, p-value, FDR thresholds)
- **Cancer Pathways**: Tests enrichment with cancer-related genes
- **Translation Pathways**: Tests enrichment with translation-related genes
- **Pathway Categories**: Tests diversity of pathway categories returned
- **Performance**: Tests performance with larger gene sets
- **Response Parsing**: Tests TSV response parsing functionality
- **Statistical Validation**: Tests validity of FDR and p-value statistics

### 2. `testData.js`
Contains test data including:
- Various gene sets (small, medium, large, cancer-related, translation-related)
- Enrichment options configurations
- Validation schemas
- Performance thresholds
- Expected pathway categories

### 3. `runTests.js`
Test runner with detailed reporting and summary statistics.

### 4. `simpleTest.js`
Quick tests for basic functionality verification.

## Usage

### Running All Tests
```bash
cd /Users/lukeolsen/Desktop/GeneVisualizations/dv-site/tests/getEnrichment
node runTests.js
```

### Running Simple Tests
```bash
node simpleTest.js
```

### Running Main Test Suite
```bash
node getEnrichment.test.js
```

## Test Configuration

The tests use the following default configuration:
- **Species**: Mus musculus (mouse) - ID: 10090
- **Format**: JSON response from STRING API
- **Gene Sets**: Various combinations of well-known mouse genes
- **Performance Thresholds**: 20-second timeout for enrichment requests

## Expected Results

The tests validate:
1. **Response Structure**: Correct TSV parsing and object structure
2. **Statistical Validity**: FDR and p-value ranges (0-1)
3. **Gene Counts**: Number of genes in enriched pathways
4. **Pathway Diversity**: Multiple pathway categories (GO, KEGG, Reactome, etc.)
5. **Performance**: Response times within acceptable limits
6. **Functional Relevance**: Meaningful pathway enrichment for specific gene sets

## Key Features Tested

### Direct Gene Name Input
The tests verify that gene names can be used directly without prior STRING ID resolution:
```javascript
const result = await StringApiService.getEnrichment(['Eif5a', 'Actb', 'Gapdh']);
```

### Enrichment Options
Tests various filtering options:
```javascript
// With p-value threshold
const result = await StringApiService.getEnrichment(genes, { pvalue_threshold: 0.05 });

// With FDR threshold
const result = await StringApiService.getEnrichment(genes, { fdr_threshold: 0.1 });

// With result limit
const result = await StringApiService.getEnrichment(genes, { limit: 10 });
```

### Pathway Categories
Tests return diverse pathway categories including:
- GO Biological Process
- GO Molecular Function
- GO Cellular Component
- KEGG pathways
- Reactome pathways
- WikiPathways

## Troubleshooting

### Common Issues

1. **No enrichment results**: Some gene sets may not have significant pathway enrichments
2. **API timeout**: Large gene sets may take longer than expected
3. **Invalid gene names**: Some gene names may not be recognized by STRING database

### Debug Mode
Add console logging to see detailed API responses:
```javascript
const result = await StringApiService.getEnrichment(genes);
console.log('Full response:', JSON.stringify(result, null, 2));
```

## Integration with Other Tests

This test suite follows the same pattern as:
- `getNetwork` tests (for network analysis)
- `resolveIdentifier` tests (for identifier resolution)

All tests can be run together from the main tests directory.

## Performance Notes

- Enrichment analysis is computationally intensive
- Response times vary based on gene set size and complexity
- STRING API may have rate limiting for large requests
- Tests include performance validation to catch slow responses
