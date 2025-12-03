# Jumper Exchange API Tests

A comprehensive Playwright API testing suite for the LI.FI blockchain bridge and exchange API.

## Overview

This project implements automated API testing for the LI.FI (Jumper) blockchain API, focusing on four core endpoints:
- **GET /v1/quote** - Get quotes for token swaps
- **POST /v1/advanced/routes** - Get advanced routing options
- **GET /v1/tools** - Get available bridges and exchanges
- **GET /v1/token** - Fetch token information and prices (token search)

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
│       ├── tokens.json            # Test data (token pairs, edge cases)
│       └── constants.ts           # Test wallet addresses (EVM, SOL)
├── tests/
│   └── api/
│       ├── quote.spec.ts          # Quote endpoint tests
│       ├── advancedRoutes.spec.ts # Advanced routes endpoint tests
│       ├── tools.spec.ts          # Tools endpoint tests
│       ├── token.spec.ts          # Token information endpoint tests
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

# API Authentication Key (required for higher rate limits)
# Get your key from LI.FI support
LIFI_API_KEY=your-api-key-here

# Test Wallet Addresses (optional, defaults provided)
TEST_EVM_WALLET_ADDRESS=0x9ff4Bca95928eea05796e7d95D6A8272b1076c5C
TEST_SOL_WALLET_ADDRESS=2PhbrXvzFiYXVN3Jb4hzhHNXbY6CFnqPPyHW9ZxtXzYi
```

**Important Security Note:**
- **Never commit `.env` files or API keys to the repository**
- The `.env` file is already in `.gitignore`
- For CI/CD: Set `LIFI_API_KEY` as a GitHub repository secret
- API keys are automatically included in request headers when set

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

# Token endpoint tests
npx playwright test tests/api/token.spec.ts

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
- ✅ Filter by chain IDs (array support)
- ✅ Get tools for EVM chains (Ethereum, Polygon, Arbitrum)
- ✅ Get tools for Solana, Bitcoin, and SUI chains
- ✅ Error handling for invalid parameters
- ✅ Data consistency checks

#### GET /v1/token
- ✅ Get token information for Solana (SOL)
- ✅ Get token information for Bitcoin (BTC)
- ✅ Get token information for SUI (SUI)
- ✅ Token search by symbol
- ✅ Token search by address
- ✅ Price validation (priceUSD > 0)
- ✅ Market data validation (marketCapUSD, volumeUSD24H)
- ✅ Error handling for invalid tokens and chains

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
3. **Chain IDs**: Numeric strings, numbers, or chain keys (e.g., "SOL", "BTC", "SUI")
4. **Amounts**: Provided as strings in smallest unit (wei, lamports, satoshis, etc.)
5. **Error Responses**: Follow consistent schema structure
6. **Rate Limiting**: API may have rate limits; tests handle 429 responses gracefully
7. **Authentication**: API key authentication is optional but recommended for higher rate limits
8. **Multi-Chain Support**: Tests cover EVM chains (Ethereum, Polygon, Arbitrum) and non-EVM chains (Solana, Bitcoin, SUI)

## Future Improvements

1. **Enhanced Coverage**
   - Additional token pairs across all supported chains
   - Cross-chain swaps between non-EVM chains (e.g., SOL ↔ BTC)
   - More edge cases and boundary conditions
   - Integration with additional endpoints (e.g., `/v1/tokens` for bulk retrieval)
   - Token search with filters and pagination

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
  - **Solution**: Set `LIFI_API_KEY` environment variable for higher rate limits
  - Tests are designed to handle 429 responses gracefully
- Increase timeout if needed: `API_TIMEOUT=60000`

### API Key Authentication
- If you see frequent 429 errors, you need to set the `LIFI_API_KEY` environment variable
- Contact LI.FI support to obtain an API key
- Never commit API keys to the repository
- For local testing: `export LIFI_API_KEY="your-key-here"`
- For CI/CD: Set as GitHub repository secret

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


