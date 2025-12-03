# Test Plan: LI.FI Blockchain API Testing

## 1. Scope & Objectives

### Scope
This test plan covers API testing for the LI.FI blockchain bridge and exchange API, focusing on four primary endpoints:
- `GET /v1/quote` - Get quote for token swaps
- `POST /v1/advanced/routes` - Get advanced routing options
- `GET /v1/tools` - Get available bridges and exchanges
- `GET /v1/token` - Fetch information about a token (token search and price retrieval)

### Objectives
1. Validate functional correctness of all three endpoints
2. Ensure proper error handling and validation
3. Verify response schema compliance
4. Test boundary conditions and edge cases
5. Assess performance under concurrent load
6. Validate data consistency across requests

## 2. Approach

### Testing Framework
- **Tool**: Playwright API Testing
- **Language**: TypeScript
- **Schema Validation**: Zod
- **Test Runner**: Playwright Test Runner

### Testing Strategy
- **API-only testing**: No browser automation, pure HTTP API testing
- **Data-driven tests**: Multiple token pairs and scenarios
- **Schema validation**: Strict validation using Zod schemas
- **Performance testing**: Concurrent request handling
- **Negative testing**: Invalid inputs, boundary values, error scenarios

## 3. Functional Tests

### 3.1 GET /v1/quote

#### Happy Path Tests
- ✅ Get quote for ETH to USDC on Ethereum
- ✅ Get quote for USDC to DAI on Polygon
- ✅ Get quote for cross-chain swaps (Ethereum to Polygon)
- ✅ Get quote with `fromAddress` parameter
- ✅ Get quote with `order` parameter

#### Validation Tests
- ✅ Verify response status code (200)
- ✅ Validate response schema structure
- ✅ Verify `fromChainId` matches request
- ✅ Verify `toChainId` matches request
- ✅ Verify token addresses match request
- ✅ Verify `fromAmount` matches request
- ✅ Verify `toAmount` is present and valid
- ✅ Verify token metadata (symbol, decimals, chainId)

### 3.2 POST /v1/advanced/routes

#### Happy Path Tests
- ✅ Get advanced routes for all token pairs
- ✅ Get routes with `fromAddress` parameter
- ✅ Get routes with `options` (slippage, order)

#### Validation Tests
- ✅ Verify response status code (200)
- ✅ Validate routes array structure
- ✅ Verify route contains required fields (id, chainIds, tokens, amounts)
- ✅ Verify steps array is present
- ✅ Validate route matches request parameters

### 3.3 GET /v1/tools

#### Happy Path Tests
- ✅ Get all tools without parameters
- ✅ Get tools filtered by chain IDs (array support)
- ✅ Get tools for multiple EVM chains (Ethereum, Polygon, Arbitrum)
- ✅ Get tools for Solana, Bitcoin, and SUI chains

#### Validation Tests
- ✅ Verify response status code (200)
- ✅ Validate response contains bridges or exchanges
- ✅ Verify array structures are correct
- ✅ Test data consistency for same parameters
- ✅ Validate bridge supportedChains structure
- ✅ Validate exchange supportedChains structure

### 3.4 GET /v1/token

#### Happy Path Tests
- ✅ Get token information for Solana (SOL)
- ✅ Get token information for Bitcoin (BTC)
- ✅ Get token information for SUI (SUI)
- ✅ Get token information by symbol
- ✅ Get token information by address

#### Validation Tests
- ✅ Verify response status code (200)
- ✅ Validate token schema (address, symbol, decimals, chainId, name)
- ✅ Verify priceUSD is present and valid (> 0)
- ✅ Verify market data fields (marketCapUSD, volumeUSD24H) when available
- ✅ Verify coinKey matches expected value
- ✅ Verify logoURI format

## 4. Non-Functional Tests

### 4.1 Performance Tests
- ✅ 15 concurrent quote requests - 95% under 2s
- ✅ 20 concurrent advanced routes requests - 95% under 3s
- ✅ Mixed concurrent requests (quote + tools)
- ✅ No unexpected 5xx errors under load

### 4.2 Response Time Targets
- Quote endpoint: 95th percentile < 2 seconds
- Advanced routes endpoint: 95th percentile < 3 seconds
- Tools endpoint: 95th percentile < 1 second

## 5. Test Cases

### Test Data Table

| Test Case ID | Token Pair | From Chain | To Chain | From Token | To Token | Expected Status | Priority |
|-------------|------------|------------|----------|------------|----------|-----------------|----------|
| TC-001 | ETH → USDC (Ethereum) | 1 | 1 | 0x0000...0000 | 0xA0b8...eB48 | 200 | P0 |
| TC-002 | USDC → DAI (Polygon) | 137 | 137 | 0x2791...4174 | 0x8f3C...0547 | 200 | P0 |
| TC-003 | ETH → USDC (Cross-chain) | 1 | 137 | 0x0000...0000 | 0x2791...4174 | 200 | P0 |
| TC-004 | USDT → USDC (Arbitrum) | 42161 | 42161 | 0xFd08...Cbb9 | 0xFF97...5CC8 | 200 | P1 |
| TC-005 | Invalid token address | 1 | 1 | 0xInvalid | 0xA0b8...eB48 | 400/422 | P0 |
| TC-006 | Invalid chain ID | 99999 | 1 | 0x0000...0000 | 0xA0b8...eB48 | 400/404 | P0 |
| TC-007 | Zero amount | 1 | 1 | 0x0000...0000 | 0xA0b8...eB48 | 400/422 | P0 |
| TC-008 | Negative amount | 1 | 1 | 0x0000...0000 | 0xA0b8...eB48 | 400/422 | P1 |
| TC-009 | Very large amount | 1 | 1 | 0x0000...0000 | 0xA0b8...eB48 | 200/400 | P2 |
| TC-010 | Missing required params | - | - | - | - | 400/422 | P0 |

### Edge Cases & Negative Tests

#### Input Validation
- ❌ Invalid token addresses
- ❌ Invalid chain IDs
- ❌ Missing required parameters
- ❌ Empty string parameters
- ❌ Zero amounts
- ❌ Negative amounts
- ❌ Very large amounts
- ❌ Malformed addresses

#### Error Response Validation
- ✅ Error status codes (400, 404, 422)
- ✅ Error message presence
- ✅ Error schema validation
- ✅ Appropriate error codes for different scenarios

#### Boundary Values
- ✅ Zero amount
- ✅ Very large amount (potential overflow)
- ✅ Negative amount (as string)
- ✅ Minimum valid amount
- ✅ Maximum valid amount (if applicable)

## 6. Risks & Assumptions

### Risks
1. **API Rate Limiting**: May affect concurrent performance tests
   - *Mitigation*: Use API key authentication, monitor for 429 responses, adjust concurrency if needed
   - *Note*: Tests handle 429 responses gracefully, treating them as acceptable outcomes
2. **Network Instability**: External API dependencies
   - *Mitigation*: Retry logic, timeout handling
3. **API Changes**: Schema or endpoint changes during testing
   - *Mitigation*: Versioned API, schema validation
4. **Token Availability**: Some tokens may not be available for swapping
   - *Mitigation*: Use well-known token pairs, handle 404/empty responses
5. **Multi-Chain Support**: Different chains may have varying API support
   - *Mitigation*: Test with well-documented chains (EVM, Solana, Bitcoin, SUI), handle chain-specific errors

### Assumptions
1. API base URL: `https://li.quest/v1` (configurable via env)
2. API follows RESTful conventions
3. Error responses follow consistent schema
4. Token addresses are case-insensitive
5. Chain IDs are numeric strings or numbers (or chain keys like "SOL", "BTC", "SUI")
6. Amounts are provided as strings in smallest unit (wei, lamports, satoshis, etc.)
7. API key authentication is optional but recommended for higher rate limits
8. Test wallet addresses are public and safe to include in repository

## 7. Prioritization

### P0 (Critical - Must Test)
- ✅ Basic happy path for all endpoints
- ✅ Required parameter validation
- ✅ Invalid token/chain error handling
- ✅ Zero amount validation
- ✅ Response schema validation
- ✅ Status code verification

### P1 (High - Should Test)
- ✅ Optional parameters (fromAddress, order, options)
- ✅ Cross-chain swaps
- ✅ Multiple token pairs
- ✅ Negative amount validation
- ✅ Tools filtering by chain/token
- ✅ Performance baseline (10-15 concurrent)

### P2 (Medium - Nice to Have)
- ✅ Very large amount handling
- ✅ Edge case combinations
- ✅ Extended performance testing (20+ concurrent)
- ✅ Mixed endpoint performance
- ✅ Data consistency checks
- ✅ Multi-chain token information retrieval (SOL, BTC, SUI)
- ✅ Token price and market data validation

## 8. Test Execution

### Prerequisites
- Node.js LTS installed
- npm installed
- Internet connection for API access

### Execution Commands
```bash
# Install dependencies
npm install
npx playwright install

# Run all tests
npm test

# Run specific test suite
npx playwright test tests/api/quote.spec.ts
npx playwright test tests/api/advancedRoutes.spec.ts
npx playwright test tests/api/tools.spec.ts
npx playwright test tests/api/token.spec.ts

# Run performance tests
npm run test:performance

# View HTML report
npm run test:report
```

### Environment Configuration
- `LIFI_BASE_URL`: API base URL (default: https://li.quest/v1)
- `API_TIMEOUT`: Request timeout in ms (default: 30000)
- `LIFI_API_KEY`: API authentication key (required for higher rate limits)
  - Set as environment variable: `export LIFI_API_KEY="your-key-here"`
  - Never commit API keys to the repository
  - For CI/CD: Set as GitHub repository secret
- `TEST_EVM_WALLET_ADDRESS`: EVM wallet address for testing (default: 0x9ff4Bca95928eea05796e7d95D6A8272b1076c5C)
- `TEST_SOL_WALLET_ADDRESS`: Solana wallet address for testing (default: 2PhbrXvzFiYXVN3Jb4hzhHNXbY6CFnqPPyHW9ZxtXzYi)

## 9. Success Criteria

### Functional
- ✅ All P0 test cases pass
- ✅ All P1 test cases pass
- ✅ Schema validation passes for all successful responses
- ✅ Error responses are properly handled and validated

### Performance
- ✅ 95% of quote requests complete in < 2 seconds
- ✅ 95% of advanced routes requests complete in < 3 seconds
- ✅ No unexpected 5xx errors under concurrent load
- ✅ System handles 15-20 concurrent requests gracefully

### Quality
- ✅ Zero flaky tests
- ✅ Clear error messages and assertions
- ✅ Comprehensive test coverage
- ✅ Clean, maintainable code

## 10. Future Improvements

1. **Test Coverage Expansion**
   - Additional token pairs across all supported chains
   - More chain combinations (including cross-chain between non-EVM chains)
   - Additional optional parameters
   - Token search functionality with filters
   - Bulk token information retrieval

2. **Performance Enhancements**
   - Load testing with higher concurrency
   - Stress testing
   - Endurance testing

3. **Monitoring & Reporting**
   - Integration with test reporting tools
   - Performance trend analysis
   - Automated regression detection

4. **CI/CD Integration**
   - Automated test execution on PR
   - Test result notifications
   - Performance regression alerts


