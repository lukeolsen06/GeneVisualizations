# getFunctionalAnnotation Test Suite

This directory contains comprehensive unit tests for the `StringApiService.getFunctionalAnnotation()` method, which retrieves functional annotations for protein sets using the STRING API.

## Overview

The `getFunctionalAnnotation()` method provides detailed functional information about proteins, including their cellular localization, molecular functions, and biological processes. Testing this without prior STRING Identifier mapping beforehand, as the STRING database handles gene name mapping internally.

## Test Files

### 1. `getFunctionalAnnotation.test.js`

The main test suite containing 8 comprehensive test cases:

- **Basic Functional Annotation**: Tests basic functionality with small gene sets
- **Functional Annotation Options**: Tests different filtering options (limit, species, format)
- **Translation Annotations**: Tests annotations with translation-related genes
- **Cancer Annotations**: Tests annotations with cancer-related genes
- **Annotation Types**: Tests diversity of annotation categories returned
- **Performance**: Tests performance with larger gene sets
- **Response Parsing**: Tests TSV response parsing functionality
- **Annotation Quality**: Tests validity and completeness of annotation data

### 2. `testData.js`

Contains test data including:

- Various gene sets (small, medium, large, cancer-related, translation-related, metabolic)
- Functional annotation options configurations
- Validation schemas for response structure
- Performance thresholds
- Expected annotation categories

### 3. `runTests.js`

Test runner with detailed reporting and summary statistics.

### 4. `simpleTest.js`

Quick tests for basic functionality verification.

## Usage

### Running All Tests

```bash
cd /Users/lukeolsen/Desktop/GeneVisualizations/dv-site/tests/getFunctionalAnnotation
node runTests.js
```

### Running Simple Tests

```bash
node simpleTest.js
```

### Running Main Test Suite

```bash
node getFunctionalAnnotation.test.js
```

## Test Configuration

The tests use the following default configuration:

- **Species**: Mus musculus (mouse) - ID: 10090
- **Format**: TSV response from STRING API
- **Gene Sets**: Various combinations of well-known mouse genes
- **Performance Thresholds**: 10-second timeout for annotation requests

## Expected Results

The tests validate:

1. **Response Structure**: Correct TSV parsing and object structure
2. **Annotation Quality**: Valid terms, descriptions, and gene names
3. **Category Diversity**: Multiple annotation categories (COMPARTMENTS, Process, Function, etc.)
4. **Performance**: Response times within acceptable limits
5. **Functional Relevance**: Meaningful annotations for specific gene sets
6. **Data Completeness**: All required fields present and valid

## Key Features Tested

### Direct Gene Name Input

The tests verify that gene names can be used directly without prior STRING ID resolution:

```javascript
const result = await StringApiService.getFunctionalAnnotation(['Eif5a', 'Actb', 'Gapdh']);
```

### Annotation Categories

Tests return diverse annotation categories including:

- **COMPARTMENTS**: Cellular localization (e.g., nucleus, cytoplasm)
- **Process**: Biological processes (e.g., translation, cell cycle)
- **Component**: Molecular components (e.g., ribosome, chromatin)
- **Function**: Molecular functions (e.g., protein binding, enzyme activity)
- **TISSUES**: Tissue-specific expression
- **Keyword**: Functional keywords
- **SMART**: Protein domain annotations
- **InterPro**: Protein family annotations
- **Pfam**: Protein family database annotations
- **RCTM**: Reactome pathway annotations
- **WikiPathways**: WikiPathways annotations
- **MPO**: Mammalian Phenotype Ontology
- **NetworkNeighborAL**: Network neighbor annotations

### Response Structure

Each annotation contains:

```javascript
{
  "category": "COMPARTMENTS",
  "term": "GOCC:0005622",
  "description": "Intracellular",
  "preferredNames": "Eif5a",
  "number_of_genes": "1",
  "ratio_in_set": "1.0",
  "ncbiTaxonId": "10090",
  "inputGenes": "Eif5a"
}
```

## Test Results Examples

### Translation-Related Genes

When testing with translation genes (`Eif5a`, `Eif2s1`, `Rps6`):

- Found 74 translation-related annotations out of 898 total
- Includes ribosomal components, translation factors, and protein synthesis processes

### Cancer-Related Genes

When testing with cancer genes (`Tp53`, `Mdm2`, `Myc`, `Pten`, `Akt1`, `Rb1`):

- Found 98 cancer-related annotations out of 4,321 total
- Includes cell cycle regulation, apoptosis, and tumor suppressor functions

### Performance Metrics

- **Small gene set** (3 genes): ~1,300 annotations in ~400ms
- **Medium gene set** (5 genes): ~2,700 annotations in ~1,200ms
- **Large gene set** (10 genes): ~4,000 annotations in ~1,200ms

## Troubleshooting

### Common Issues

1. **No annotation results**: Some gene names may not be recognized by STRING database
2. **API timeout**: Large gene sets may take longer than expected
3. **Invalid gene names**: Some gene names may not have functional annotations available

### Debug Mode

Add console logging to see detailed API responses:

```javascript
const result = await StringApiService.getFunctionalAnnotation(genes);
console.log('Full response:', JSON.stringify(result, null, 2));
```

## Integration with Other Tests

This test suite follows the same pattern as:

- `getEnrichment` tests (for pathway enrichment analysis)
- `getNetwork` tests (for protein-protein interaction networks)
- `resolveIdentifier` tests (for identifier resolution)

All tests can be run together from the main tests directory.

## Performance Notes

- Functional annotation retrieval is generally faster than enrichment analysis
- Response times vary based on gene set size and annotation complexity
- STRING API may have rate limiting for large requests
- Tests include performance validation to catch slow responses
- Typical response times: 400ms-1,200ms depending on gene set size

## API Endpoint

The tests use the STRING API functional annotation endpoint:

```text
https://string-db.org/api/tsv/functional_annotation
```

With parameters:

- `identifiers`: Gene names (newline-separated)
- `species`: 10090 (Mus musculus)
- `caller_identity`: eif5a-visualization-app
