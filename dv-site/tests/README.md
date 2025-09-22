# StringApiService Test Suite

This directory contains comprehensive tests for the StringApiService, covering the `resolveIdentifiers`, `getNetwork`, and `getEnrichment` methods.

## Test Structure

```text
tests/
├── resolveIdentifier/
│   ├── resolveIdentifiers.test.js  # Main test file
│   ├── testData.js                 # Test data and configurations
│   ├── runTests.js                 # Test runner script
│   └── simpleTest.js               # Simple test script
├── getNetwork/
│   ├── getNetwork.test.js          # Main test file
│   ├── testData.js                 # Test data and configurations
│   ├── runTests.js                 # Test runner script
│   └── simpleTest.js               # Simple test script
├── getEnrichment/
│   ├── getEnrichment.test.js       # Main test file
│   ├── testData.js                 # Test data and configurations
│   ├── runTests.js                 # Test runner script
│   └── simpleTest.js               # Simple test script
├── package.json                    # Test dependencies
└── README.md                       # This file
```

## Test Coverage

The test suite covers the following scenarios for the `resolveIdentifiers`, `getNetwork`, and `getEnrichment` methods:

### ResolveIdentifiers Tests

### 1. Basic Resolution Test

- Tests resolution of valid gene symbols
- Validates response structure and required fields
- Uses common mouse genes (Eif5a, Actb, Gapdh)

### 2. Invalid Resolution Test

- Tests handling of invalid gene symbols
- Verifies graceful error handling
- Ensures no false positives

### 3. Mixed Resolution Test

- Tests resolution with both valid and invalid genes
- Validates partial success scenarios
- Checks proper handling of mixed input

### 4. Different Formats Test

- Tests resolution with Ensembl IDs
- Validates different input format handling
- Ensures format-specific processing

### 5. Response Parsing Test

- Tests TSV response parsing functionality
- Validates data structure conversion
- Ensures proper object mapping

### 6. Performance Test

- Tests with larger gene sets (15+ genes)
- Measures response times
- Validates success rates

### GetNetwork Tests

### 1. Basic Network Test

- Tests network retrieval with gene names
- Validates gene name resolution to STRING IDs
- Checks network response structure and required fields
- Uses common mouse genes (Eif5a, Actb, Gapdh)

### 2. Confidence Thresholds Test

- Tests different confidence thresholds (low, medium, high)
- Validates that higher confidence returns fewer interactions
- Ensures proper threshold filtering

### 3. Network Types Test

- Tests different network types (full, physical, functional)
- Validates network type parameter handling
- Ensures proper network filtering

### 4. Cytoscape Conversion Test

- Tests conversion to Cytoscape format
- Validates node and edge structure
- Ensures proper data mapping for visualization

### 5. Network Performance Test

- Tests with larger gene sets (5-10 genes)
- Measures response times for network retrieval
- Validates success rates and data quality

### 6. Response Parsing Test

- Tests TSV response parsing for network data
- Validates data structure conversion
- Ensures proper object mapping

### GetEnrichment Tests

### 1. Basic Enrichment Test

- Tests enrichment analysis with gene names directly
- Validates response structure and required fields
- Uses common mouse genes (Eif5a, Actb, Gapdh)
- Tests without prior STRING ID conversion

### 2. Enrichment Options Test

- Tests different filtering options (limit, p-value, FDR thresholds)
- Validates option parameter handling
- Ensures proper result filtering

### 3. Cancer Pathways Test

- Tests enrichment with cancer-related genes
- Validates identification of cancer-related pathways
- Uses oncogenes and tumor suppressors (Tp53, Mdm2, Myc, Pten, Akt1, Rb1)

### 4. Translation Pathways Test

- Tests enrichment with translation-related genes
- Validates identification of translation pathways
- Uses translation factors and ribosomal proteins

### 5. Pathway Categories Test

- Tests diversity of pathway categories returned
- Validates multiple pathway databases (GO, KEGG, Reactome, WikiPathways)
- Ensures comprehensive pathway coverage

### 6. Enrichment Performance Test

- Tests with larger gene sets (10 genes)
- Measures response times for enrichment analysis
- Validates success rates and data quality

### 7. Response Parsing Test

- Tests TSV response parsing for enrichment data
- Validates data structure conversion
- Ensures proper object mapping

### 8. Statistical Validation Test

- Tests validity of FDR and p-value statistics
- Validates statistical value ranges (0-1)
- Ensures proper gene count calculations

## Running Tests

### Prerequisites

Make sure you have Node.js installed and the main project dependencies installed:

```bash
cd /Users/lukeolsen/Desktop/GeneVisualizations/dv-site
npm install
```

### Run All Tests

```bash
cd tests
npm test
```

### Run ResolveIdentifiers Tests

```bash
cd tests/resolveIdentifier
node runTests.js
```

### Run GetNetwork Tests

```bash
cd tests/getNetwork
node runTests.js
```

### Run GetEnrichment Tests

```bash
cd tests/getEnrichment
node runTests.js
```

### Run Simple Tests

```bash
# ResolveIdentifiers simple test
cd tests/resolveIdentifier
node simpleTest.js

# GetNetwork simple test
cd tests/getNetwork
node simpleTest.js

# GetEnrichment simple test
cd tests/getEnrichment
node simpleTest.js
```

### Run with Verbose Output

```bash
npm run test:verbose
```

### Show Help

```bash
npm run test:help
```

## Test Data

The test suite uses carefully selected mouse gene symbols and Ensembl IDs:

### Valid Gene Symbols

- `Eif5a` - Eukaryotic translation initiation factor 5A
- `Actb` - Actin beta
- `Gapdh` - Glyceraldehyde-3-phosphate dehydrogenase
- `Tp53` - Tumor protein p53
- `Mdm2` - Mouse double minute 2
- And more...

### Invalid Gene Symbols

- `InvalidGene`
- `NonExistentGene`
- `FakeGene123`

### Test Configurations

- **Small**: 3 genes (basic functionality)
- **Medium**: 5 genes (moderate load)
- **Large**: 10 genes (performance testing)
- **Cancer-related**: 6 genes (cancer pathway testing)
- **Translation-related**: 5 genes (translation pathway testing)

## Expected Results

### Success Criteria

- All valid gene symbols should resolve to STRING IDs
- Invalid gene symbols should be handled gracefully
- Response times should be under 10 seconds for resolution/network tests
- Response times should be under 20 seconds for enrichment tests
- Success rate should be above 50% for valid genes
- Response structure should match expected schema
- Enrichment tests should return diverse pathway categories
- Statistical values (FDR, p-value) should be valid (0-1 range)

### Performance Thresholds

- Maximum response time: 10 seconds (resolution/network), 20 seconds (enrichment)
- Minimum success rate: 50%
- Maximum memory usage: 100MB (if available)
- Minimum enrichment results: 1 pathway per test

## Troubleshooting

### Common Issues

1. **Network Errors**

   - Check internet connectivity
   - Verify STRING API accessibility
   - Check for firewall restrictions

2. **Resolution Failures**

   - Verify gene symbols are valid for mouse (species 10090)
   - Check if genes exist in STRING database
   - Ensure proper gene symbol formatting

3. **Parsing Errors**

   - Check TSV response format
   - Verify response structure
   - Review API documentation

4. **Enrichment Issues**

   - Some gene sets may not have significant pathway enrichments
   - Large gene sets may take longer than expected
   - Check for valid FDR and p-value statistics
   - Verify pathway category diversity

### Debug Mode

To enable detailed logging, modify the test file to include more console output or use the verbose flag.

## API Information

- **Base URL**: <https://string-db.org/api>
- **Species**: 10090 (Mus musculus)
- **Format**: JSON/TSV
- **Confidence Threshold**: 400 (medium confidence)

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Add appropriate test data to `testData.js`
3. Update this README with new test descriptions
4. Ensure tests are comprehensive and well-documented

## License

This test suite is part of the GeneVisualizations project and follows the same license terms.
