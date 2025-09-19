# StringApiService Test Suite

This directory contains comprehensive tests for the StringApiService, covering both the `resolveIdentifiers` and `getNetwork` methods.

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
├── package.json                    # Test dependencies
└── README.md                       # This file
```

## Test Coverage

The test suite covers the following scenarios for both `resolveIdentifiers` and `getNetwork` methods:

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

### 5. Performance Test

- Tests with larger gene sets (5-10 genes)
- Measures response times for network retrieval
- Validates success rates and data quality

### 6. Response Parsing Test

- Tests TSV response parsing for network data
- Validates data structure conversion
- Ensures proper object mapping

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

### Run Simple Tests

```bash
# ResolveIdentifiers simple test
cd tests/resolveIdentifier
node simpleTest.js

# GetNetwork simple test
cd tests/getNetwork
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
- **Medium**: 8 genes (moderate load)
- **Large**: 15 genes (performance testing)
- **Performance**: 30 genes (stress testing)

## Expected Results

### Success Criteria

- All valid gene symbols should resolve to STRING IDs
- Invalid gene symbols should be handled gracefully
- Response times should be under 10 seconds
- Success rate should be above 50% for valid genes
- Response structure should match expected schema

### Performance Thresholds

- Maximum response time: 10 seconds
- Minimum success rate: 50%
- Maximum memory usage: 100MB (if available)

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
