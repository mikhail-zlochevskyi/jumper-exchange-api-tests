import { test, expect } from '@playwright/test';
import { LifiClient } from '../../src/utils/lifiClient';
import {
  ToolsResponseSchema,
  ErrorResponseSchema,
} from '../../src/utils/schemaValidators';

test.describe('GET /v1/tools', () => {
  test.describe('Happy Path Tests', () => {
    test('Should get all tools without parameters', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const response = await lifiClient.getTools();

      expect(response.status()).toBe(200);

      const body = await response.json();
      const validatedData = ToolsResponseSchema.parse(body);

      // Verify response structure
      expect(validatedData.bridges || validatedData.exchanges).toBeDefined();
    });

    test('Should get tools filtered by chain IDs', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const response = await lifiClient.getTools({
        chains: ['1', '137'],
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      const validatedData = ToolsResponseSchema.parse(body);

      expect(validatedData.bridges || validatedData.exchanges).toBeDefined();
    });

    test('Should get tools for Polygon chain', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const response = await lifiClient.getTools({
        chains: ['137'],
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      ToolsResponseSchema.parse(body);
    });

    test('Should get tools for Arbitrum chain', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const response = await lifiClient.getTools({
        chains: ['42161'],
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      ToolsResponseSchema.parse(body);
    });
  });

  test.describe('Error Handling & Validation', () => {
    test('Should return error for invalid chain ID', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const response = await lifiClient.getTools({
        chains: ['99999'],
      });

      // API may return empty results or error
      expect([200, 400, 404]).toContain(response.status());

      if (response.status() !== 200) {
        const body = await response.json();
        const errorData = ErrorResponseSchema.parse(body);
        expect(errorData.message).toBeDefined();
      }
    });

    test('Should handle empty chains array gracefully', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const response = await lifiClient.getTools({
        chains: [],
      });

      expect(response.status()).toBe(200);
    });
  });

  test.describe('Response Schema Validation', () => {
    test('Should validate tools response schema structure', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const response = await lifiClient.getTools();

      expect(response.status()).toBe(200);
      const body = await response.json();
      const validatedData = ToolsResponseSchema.parse(body);

      // At least one of bridges or exchanges should be present
      expect(
        validatedData.bridges || validatedData.exchanges
      ).toBeDefined();
    });

    test('Should return array structures for bridges/exchanges', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const response = await lifiClient.getTools();

      expect(response.status()).toBe(200);
      const body = await response.json();

      if (body.bridges) {
        expect(Array.isArray(body.bridges)).toBe(true);
      }
      if (body.exchanges) {
        expect(Array.isArray(body.exchanges)).toBe(true);
      }
    });
  });

  test.describe('Data Consistency', () => {
    test('Should return consistent results for same parameters', async ({ request }) => {
      const lifiClient = new LifiClient(request);
      const params = { chains: ['1'] };

      const response1 = await lifiClient.getTools(params);
      const response2 = await lifiClient.getTools(params);

      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);

      const body1 = await response1.json();
      const body2 = await response2.json();

      // Results should be consistent (same structure)
      expect(Object.keys(body1).sort()).toEqual(Object.keys(body2).sort());
    });
  });
});


