import { test, expect } from '@playwright/test';
import { LifiClient } from '../../src/utils/lifiClient';
import {
  AdvancedRoutesResponseSchema,
  ErrorResponseSchema,
} from '../../src/utils/schemaValidators';
import tokenData from '../../src/testdata/tokens.json';
import { TEST_EVM_WALLET_ADDRESS } from '../../src/testdata/constants';

const buildRoutesRequest = (pair: (typeof tokenData.tokenPairs)[number]) => ({
  fromChainId: Number(pair.fromChain),
  toChainId: Number(pair.toChain),
  fromTokenAddress: pair.fromToken,
  toTokenAddress: pair.toToken,
  fromAmount: pair.fromAmount,
  fromAddress: TEST_EVM_WALLET_ADDRESS,
  toAddress: TEST_EVM_WALLET_ADDRESS,
});

test.describe('POST /v1/advanced/routes', () => {
  test.describe('Happy Path Tests', () => {
    for (const pair of tokenData.tokenPairs) {
      test(`Should get advanced routes for ${pair.name}`, async ({ request }) => {
        const lifiClient = new LifiClient(request);
        const response = await lifiClient.postAdvancedRoutes(
          buildRoutesRequest(pair)
        );

        const status = response.status();
        expect([200, 404]).toContain(status);

        const body = await response.json();

        if (status === 200) {
          const validatedData = AdvancedRoutesResponseSchema.parse(body);

          expect(validatedData.routes).toBeDefined();
          expect(Array.isArray(validatedData.routes)).toBe(true);

          if (validatedData.routes.length > 0) {
            const route = validatedData.routes[0];
            expect(route.id).toBeDefined();
            expect(route.fromChainId).toBe(Number(pair.fromChain));
            expect(route.toChainId).toBe(Number(pair.toChain));
            expect(route.fromToken.address.toLowerCase()).toBe(
              pair.fromToken.toLowerCase()
            );
            expect(route.toToken.address.toLowerCase()).toBe(
              pair.toToken.toLowerCase()
            );
            expect(route.fromAmount).toBe(pair.fromAmount);
            expect(route.toAmount).toBeDefined();
            expect(route.steps).toBeDefined();
            expect(Array.isArray(route.steps)).toBe(true);
          }
        } else {
          const errorData = ErrorResponseSchema.parse(body);
          expect(errorData.message).toBeDefined();
        }
      });
    }

    test('Should get advanced routes with fromAddress', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const pair = tokenData.tokenPairs[0];
      const testAddress = '0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0';

      const response = await lifiClient.postAdvancedRoutes({
        ...buildRoutesRequest(pair),
        fromAddress: testAddress,
      });

      expect([200, 404]).toContain(response.status());
      if (response.status() === 200) {
        const body = await response.json();
        AdvancedRoutesResponseSchema.parse(body);
      }
    });

    test('Should get advanced routes with options', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const pair = tokenData.tokenPairs[0];

      const response = await lifiClient.postAdvancedRoutes({
        ...buildRoutesRequest(pair),
        options: {
          slippage: 0.005,
          order: 'CHEAPEST',
          allowDestinationCall: true,
        },
      });

      expect([200, 404]).toContain(response.status());
      if (response.status() === 200) {
        const body = await response.json();
        AdvancedRoutesResponseSchema.parse(body);
      }
    });
  });

  test.describe('Error Handling & Validation', () => {
    test('Should return error for invalid token address', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const invalidPair = tokenData.invalidTokens[0];

      const response = await lifiClient.postAdvancedRoutes({
        ...buildRoutesRequest(tokenData.tokenPairs[0]),
        fromChainId: Number(invalidPair.fromChain),
        toChainId: Number(invalidPair.toChain),
        fromTokenAddress: invalidPair.fromToken,
        toTokenAddress: invalidPair.toToken,
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

      const response = await lifiClient.postAdvancedRoutes({
        ...buildRoutesRequest(tokenData.tokenPairs[0]),
        fromChainId: Number(invalidPair.fromChain),
        toChainId: Number(invalidPair.toChain),
        fromTokenAddress: invalidPair.fromToken,
        toTokenAddress: invalidPair.toToken,
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

      const response = await lifiClient.postAdvancedRoutes({
        ...buildRoutesRequest(pair),
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

      const response = await lifiClient.postAdvancedRoutes({
        ...buildRoutesRequest(pair),
        fromAmount: negativeAmount.fromAmount,
      });

      expect([400, 422]).toContain(response.status());
    });

    test('Should return error for missing required fields', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const response = await lifiClient.postAdvancedRoutes({
        fromChainId: 0,
        toChainId: 0,
        fromTokenAddress: '',
        toTokenAddress: '',
        fromAmount: '',
        fromAddress: '',
      });

      expect([400, 422]).toContain(response.status());
    });
  });

  test.describe('Response Schema Validation', () => {
    test('Should validate complete advanced routes response schema', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const pair = tokenData.tokenPairs[0];

      const response = await lifiClient.postAdvancedRoutes(
        buildRoutesRequest(pair)
      );

      expect([200, 404]).toContain(response.status());
      if (response.status() === 200) {
        const body = await response.json();
        const validatedData = AdvancedRoutesResponseSchema.parse(body);

        expect(validatedData.routes).toBeDefined();
        if (validatedData.routes.length > 0) {
          const route = validatedData.routes[0];
          expect(route.steps.length).toBeGreaterThan(0);
          expect(route.steps[0].action.fromToken.symbol).toBeDefined();
        }
      }
    });
  });
});


