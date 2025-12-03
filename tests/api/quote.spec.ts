import { test, expect } from '@playwright/test';
import { LifiClient } from '../../src/utils/lifiClient';
import {
  QuoteResponseSchema,
  ErrorResponseSchema,
} from '../../src/utils/schemaValidators';
import tokenData from '../../src/testdata/tokens.json';
import { TEST_EVM_WALLET_ADDRESS } from '../../src/testdata/constants';

const buildQuoteParams = (pair: (typeof tokenData.tokenPairs)[number]) => ({
  fromChain: pair.fromChain,
  toChain: pair.toChain,
  fromToken: pair.fromToken,
  toToken: pair.toToken,
  fromAmount: pair.fromAmount,
  fromAddress: TEST_EVM_WALLET_ADDRESS,
  toAddress: TEST_EVM_WALLET_ADDRESS,
});

test.describe('GET /v1/quote', () => {
  test.describe('Happy Path Tests', () => {
    for (const pair of tokenData.tokenPairs) {
      test(`Should get quote for ${pair.name}`, async ({ request }) => {
        const lifiClient = new LifiClient(request);
        const response = await lifiClient.getQuote(buildQuoteParams(pair));
        const status = response.status();
        expect([200, 404]).toContain(status);

        const body = await response.json();

        if (status === 200) {
          const validatedData = QuoteResponseSchema.parse(body);

          expect(validatedData.action.fromChainId).toBe(
            Number(pair.fromChain)
          );
          expect(validatedData.action.toChainId).toBe(Number(pair.toChain));
          expect(validatedData.action.fromToken.address.toLowerCase()).toBe(
            pair.fromToken.toLowerCase()
          );
          expect(validatedData.action.toToken.address.toLowerCase()).toBe(
            pair.toToken.toLowerCase()
          );
          expect(validatedData.action.fromAmount).toBe(pair.fromAmount);
          expect(validatedData.estimate.fromAmount).toBe(pair.fromAmount);
          expect(validatedData.estimate.toAmount).toBeDefined();
        } else {
          const errorData = ErrorResponseSchema.parse(body);
          expect(errorData.message).toBeDefined();
        }
      });
    }

    test('Should respect provided fromAddress parameter', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const pair = tokenData.tokenPairs[0];
      const customAddress = '0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0';

      const response = await lifiClient.getQuote({
        ...buildQuoteParams(pair),
        fromAddress: customAddress,
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      const validatedData = QuoteResponseSchema.parse(body);
      expect(validatedData.action.fromAddress?.toLowerCase()).toBe(
        customAddress.toLowerCase()
      );
    });

    test('Should get quote with order parameter', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const pair = tokenData.tokenPairs[0];

      const response = await lifiClient.getQuote({
        ...buildQuoteParams(pair),
        order: 'CHEAPEST',
        slippage: 0.003,
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      QuoteResponseSchema.parse(body);
    });
  });

  test.describe('Error Handling & Validation', () => {
    test('Should return error for invalid token address', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const invalidPair = tokenData.invalidTokens[0];

      const response = await lifiClient.getQuote({
        ...buildQuoteParams(tokenData.tokenPairs[0]),
        fromChain: invalidPair.fromChain,
        toChain: invalidPair.toChain,
        fromToken: invalidPair.fromToken,
        toToken: invalidPair.toToken,
        fromAmount: invalidPair.fromAmount,
      });

      expect([400, 404, 422]).toContain(response.status());
      const body = await response.json();
      const errorData = ErrorResponseSchema.parse(body);
      expect(errorData.message).toBeDefined();
    });

    test('Should return error for invalid chain ID', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const invalidPair = tokenData.invalidTokens[1];

      const response = await lifiClient.getQuote({
        ...buildQuoteParams(tokenData.tokenPairs[0]),
        fromChain: invalidPair.fromChain,
        toChain: invalidPair.toChain,
        fromToken: invalidPair.fromToken,
        toToken: invalidPair.toToken,
        fromAmount: invalidPair.fromAmount,
      });

      expect([400, 404, 422]).toContain(response.status());
      const body = await response.json();
      const errorData = ErrorResponseSchema.parse(body);
      expect(errorData.message).toBeDefined();
    });

    test('Should return error for zero amount', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const zeroAmount = tokenData.boundaryValues[0];
      const pair = tokenData.tokenPairs[0];

      const response = await lifiClient.getQuote({
        ...buildQuoteParams(pair),
        fromAmount: zeroAmount.fromAmount,
      });

      expect([400, 422]).toContain(response.status());
      const body = await response.json();
      const errorData = ErrorResponseSchema.parse(body);
      expect(errorData.message).toBeDefined();
    });

    test('Should return error for negative amount', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const negativeAmount = tokenData.boundaryValues[2];
      const pair = tokenData.tokenPairs[0];

      const response = await lifiClient.getQuote({
        ...buildQuoteParams(pair),
        fromAmount: negativeAmount.fromAmount,
      });

      expect([400, 422]).toContain(response.status());
    });

    test('Should return error for missing required parameters', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const response = await lifiClient.getQuote({
        fromChain: '',
        toChain: '',
        fromToken: '',
        toToken: '',
        fromAmount: '',
        fromAddress: '',
      });

      expect([400, 422]).toContain(response.status());
    });
  });

  test.describe('Boundary Value Tests', () => {
    test('Should handle very large amount', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const largeAmount = tokenData.boundaryValues[1];
      const pair = tokenData.tokenPairs[0];

      const response = await lifiClient.getQuote({
        ...buildQuoteParams(pair),
        fromAmount: largeAmount.fromAmount,
      });

      // May return error or valid response depending on API behavior
      expect([200, 400, 404, 422]).toContain(response.status());
    });
  });

  test.describe('Response Schema Validation', () => {
    test('Should validate complete quote response schema', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const pair = tokenData.tokenPairs[0];

      const response = await lifiClient.getQuote(buildQuoteParams(pair));

      expect(response.status()).toBe(200);
      const body = await response.json();
      const validatedData = QuoteResponseSchema.parse(body);

      // Additional assertions on nested structures
      expect(validatedData.action.fromToken.symbol).toBeDefined();
      expect(validatedData.action.fromToken.decimals).toBeGreaterThan(0);
      expect(validatedData.action.toToken.symbol).toBeDefined();
      expect(validatedData.action.toToken.decimals).toBeGreaterThan(0);
      expect(Number(validatedData.estimate.toAmount)).toBeGreaterThan(0);
      expect(validatedData.transactionRequest).toBeDefined();
    });
  });
});


