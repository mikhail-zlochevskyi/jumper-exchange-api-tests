import { test, expect } from '@playwright/test';
import { LifiClient } from '../../src/utils/lifiClient';
import {
  SingleTokenResponseSchema,
  ErrorResponseSchema,
} from '../../src/utils/schemaValidators';

test.describe('GET /v1/token', () => {
  test.describe('Happy Path - Core Chains', () => {
    test('Should fetch SOL token info on Solana', async ({ request }) => {
      const client = new LifiClient(request);

      const response = await client.getToken({ chain: 'SOL', token: 'Sol' });
      expect([200, 404, 429]).toContain(response.status());

      if (response.status() !== 200) return;

      const body = await response.json();
      const token = SingleTokenResponseSchema.parse(body);

      expect(token.symbol).toBe('SOL');
      expect(token.decimals).toBe(9);
      expect(token.name).toBe('SOL');
      expect(token.coinKey).toBe('SOL');
      expect(Number(token.priceUSD)).toBeGreaterThan(0);
    });

    test('Should fetch BTC token info on Bitcoin', async ({ request }) => {
      const client = new LifiClient(request);

      const response = await client.getToken({ chain: 'BTC', token: 'BTC' });
      expect([200, 404, 429]).toContain(response.status());

      if (response.status() !== 200) return;

      const body = await response.json();
      const token = SingleTokenResponseSchema.parse(body);

      expect(token.symbol).toBe('BTC');
      expect(token.decimals).toBe(8);
      expect(token.name).toBe('Bitcoin');
      expect(token.coinKey).toBe('BTC');
      expect(Number(token.priceUSD)).toBeGreaterThan(0);
    });

    test('Should fetch SUI token info on SUI', async ({ request }) => {
      const client = new LifiClient(request);

      const response = await client.getToken({ chain: 'SUI', token: 'SUI' });
      expect([200, 404, 429]).toContain(response.status());

      if (response.status() !== 200) return;

      const body = await response.json();
      const token = SingleTokenResponseSchema.parse(body);

      expect(token.symbol).toBe('SUI');
      expect(token.decimals).toBe(9);
      expect(token.name).toBe('SUI');
      expect(token.coinKey).toBe('SUI');
      expect(Number(token.priceUSD)).toBeGreaterThan(0);
    });
  });

  test.describe('Price & Market Data Sanity', () => {
    test('SOL, BTC and SUI should have positive USD prices when available', async ({
      request,
    }) => {
      const client = new LifiClient(request);

      const cases: Array<{ chain: string; token: string }> = [
        { chain: 'SOL', token: 'Sol' },
        { chain: 'BTC', token: 'BTC' },
        { chain: 'SUI', token: 'SUI' },
      ];

      for (const c of cases) {
        const response = await client.getToken(c);
        expect([200, 404, 429]).toContain(response.status());
        if (response.status() !== 200) continue;

        const body = await response.json();
        const token = SingleTokenResponseSchema.parse(body);

        expect(Number(token.priceUSD)).toBeGreaterThan(0);
        if (token.marketCapUSD !== undefined) {
          expect(token.marketCapUSD).toBeGreaterThan(0);
        }
        if (token.volumeUSD24H !== undefined) {
          expect(token.volumeUSD24H).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  test.describe('Negative & Edge Cases', () => {
    test('Should return error for invalid token on valid chain', async ({
      request,
    }) => {
      const client = new LifiClient(request);

      const response = await client.getToken({
        chain: 'SOL',
        token: 'NotAToken',
      });

      expect([400, 404, 422, 429]).toContain(response.status());
      if (response.status() === 429) return;

      const body = await response.json();
      const errorData = ErrorResponseSchema.parse(body);
      expect(errorData.message).toBeDefined();
    });

    test('Should return error for unsupported chain key', async ({ request }) => {
      const client = new LifiClient(request);

      const response = await client.getToken({
        chain: 'UNKNOWN_CHAIN',
        token: 'BTC',
      });

      expect([400, 404, 422, 429]).toContain(response.status());
      if (response.status() === 429) return;

      const body = await response.json();
      const errorData = ErrorResponseSchema.parse(body);
      expect(errorData.message).toBeDefined();
    });
  });
});


