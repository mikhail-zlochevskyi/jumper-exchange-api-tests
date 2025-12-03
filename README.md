# Jumper Exchange API Tests

A comprehensive Playwright API testing suite for the LI.FI blockchain bridge and exchange API.

## Overview

This project implements automated API testing for the LI.FI (Jumper) blockchain API, focusing on three core endpoints:
- **GET /v1/quote** - Get quotes for token swaps
- **POST /v1/advanced/routes** - Get advanced routing options
- **GET /v1/tools** - Get available bridges and exchanges

The test suite includes functional tests, error handling, schema validation, boundary testing, and performance testing.

## Tech Stack

- **TypeScript** - Type-safe test development
- **Playwright** - API testing framework
- **Zod** - Runtime schema validation
- **Node.js** - Runtime environment

## Project Structure

```
.
├── src/
│   ├── config/
│   │   └── env.ts                 # Environment configuration
│   ├── utils/
│   │   ├── lifiClient.ts          # API client wrapper
│   │   └── schemaValidators.ts    # Zod schema validators
│   └── testdata/
│       └── tokens.json            # Test data (token pairs, edge cases)
├── tests/
│   └── api/
│       ├── quote.spec.ts          # Quote endpoint tests
│       ├── advancedRoutes.spec.ts # Advanced routes endpoint tests
│       ├── tools.spec.ts          # Tools endpoint tests
│       └── performance.spec.ts    # Performance tests
├── docs/
│   └── TEST_PLAN.md              # Comprehensive test plan
├── playwright.config.ts           # Playwright configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## Setup

### Prerequisites

- Node.js LTS (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jumper-exchange-api-tests
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers (if needed):
```bash
npx playwright install
```

## Configuration

### Environment Variables

Create a `.env` file (optional) or set environment variables:

```bash
# API Base URL (default: https://li.quest/v1)
LIFI_BASE_URL=https://li.quest/v1

# API Timeout in milliseconds (default: 30000)
API_TIMEOUT=30000
```

The base URL can also be configured in `playwright.config.ts` or via command line.

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
# Quote endpoint tests
npx playwright test tests/api/quote.spec.ts

# Advanced routes endpoint tests
npx playwright test tests/api/advancedRoutes.spec.ts

# Tools endpoint tests
npx playwright test tests/api/tools.spec.ts

# Performance tests
npm run test:performance
```

### Run Tests with UI Mode
```bash
npm run test:ui
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Run Tests in Headed Mode
```bash
npm run test:headed
```

## Viewing Test Reports

### HTML Report
After running tests, view the HTML report:
```bash
npm run test:report
```

This opens the Playwright HTML report in your browser, showing:
- Test execution results
- Pass/fail status
- Execution time
- Error messages and stack traces
- Request/response details

### JSON Report
JSON test results are automatically generated in `test-results/results.json`.

### JUnit Report
JUnit XML format is available in `test-results/junit.xml` for CI/CD integration.

## Test Coverage

### Functional Tests

#### GET /v1/quote
- ✅ Happy path tests for multiple token pairs
- ✅ Optional parameters (fromAddress, order)
- ✅ Error handling (invalid tokens, chains, amounts)
- ✅ Boundary value testing (zero, negative, large amounts)
- ✅ Response schema validation

#### POST /v1/advanced/routes
- ✅ Happy path tests for all token pairs
- ✅ Optional parameters (fromAddress, options)
- ✅ Error handling and validation
- ✅ Response schema validation
- ✅ Route structure validation

#### GET /v1/tools
- ✅ Get all tools
- ✅ Filter by chain
- ✅ Filter by token
- ✅ Filter by chain and token
- ✅ Error handling for invalid parameters
- ✅ Data consistency checks

### Performance Tests
- ✅ 15 concurrent quote requests (95% < 2s)
- ✅ 20 concurrent advanced routes requests (95% < 3s)
- ✅ Mixed concurrent requests
- ✅ No unexpected 5xx errors

## Test Data

Test data is stored in `src/testdata/tokens.json` and includes:
- **Token Pairs**: Valid token combinations for testing
- **Invalid Tokens**: Invalid addresses and chain IDs for error testing
- **Boundary Values**: Zero, negative, and very large amounts

You can extend this file with additional test cases as needed.

## Assumptions

1. **API Base URL**: Defaults to `https://li.quest/v1` (configurable)
2. **Token Addresses**: Case-insensitive, validated format
3. **Chain IDs**: Numeric strings or numbers
4. **Amounts**: Provided as strings in smallest unit (wei, etc.)
5. **Error Responses**: Follow consistent schema structure
6. **Rate Limiting**: API may have rate limits; tests handle 429 responses

## Future Improvements

1. **Enhanced Coverage**
   - Additional token pairs and chain combinations
   - More edge cases and boundary conditions
   - Integration with additional endpoints

2. **Performance Enhancements**
   - Extended load testing scenarios
   - Stress testing
   - Performance trend analysis

3. **CI/CD Integration**
   - Automated test execution on PR
   - Test result notifications
   - Performance regression alerts

4. **Monitoring**
   - Integration with monitoring tools
   - Automated regression detection
   - Test result dashboards

## Troubleshooting

### Tests Failing Due to Network Issues
- Check internet connection
- Verify API is accessible
- Check for rate limiting (429 responses)
- Increase timeout if needed: `API_TIMEOUT=60000`

### Schema Validation Failures
- API response structure may have changed
- Update schemas in `src/utils/schemaValidators.ts`
- Check API documentation for latest schema

### Performance Test Failures
- Network conditions may affect response times
- Adjust thresholds in `tests/api/performance.spec.ts`
- Consider running during off-peak hours

## Contributing

1. Follow TypeScript best practices
2. Maintain test data in `src/testdata/tokens.json`
3. Update schemas when API changes
4. Add meaningful test descriptions
5. Ensure all tests pass before committing

## License

MIT

## Contact

For questions or issues, please refer to the test plan document in `docs/TEST_PLAN.md`.


