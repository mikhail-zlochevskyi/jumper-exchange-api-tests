import { test, expect } from '@playwright/test';
import { LifiClient } from '../../src/utils/lifiClient';
import tokenData from '../../src/testdata/tokens.json';
import { TEST_EVM_WALLET_ADDRESS } from '../../src/testdata/constants';

test.describe('Performance Tests', () => {
  test('Should handle 15 concurrent quote requests with acceptable response times', async ({
    request,
  }) => {
    const lifiClient = new LifiClient(request);
    const pair = tokenData.tokenPairs[0];
    const concurrentRequests = 15;
    const maxResponseTime = 2000; // 2 seconds
    const targetPercentile = 0.95; // 95th percentile

    const startTime = Date.now();
    const promises = Array.from({ length: concurrentRequests }, async () => {
      const requestStart = Date.now();
      const response = await lifiClient.getQuote({
        fromChain: pair.fromChain,
        toChain: pair.toChain,
        fromToken: pair.fromToken,
        toToken: pair.toToken,
        fromAmount: pair.fromAmount,
        fromAddress: TEST_EVM_WALLET_ADDRESS,
        toAddress: TEST_EVM_WALLET_ADDRESS,
      });
      const requestEnd = Date.now();
      return { response, responseTime: requestEnd - requestStart };
    });

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Calculate response times
    const responseTimes: number[] = [];
    let successCount = 0;
    let error5xxCount = 0;

    for (const { response, responseTime } of results) {
      const status = response.status();

      if (status >= 200 && status < 300) {
        successCount++;
        responseTimes.push(responseTime);
      } else if (status >= 500) {
        error5xxCount++;
      }
    }

    // Sort response times for percentile calculation
    responseTimes.sort((a, b) => a - b);
    const percentile95Index = Math.floor(
      responseTimes.length * targetPercentile
    );
    const percentile95Time =
      responseTimes[percentile95Index] || responseTimes[responseTimes.length - 1];

    // Assertions
    expect(error5xxCount).toBe(0);
    expect(successCount).toBeGreaterThan(0);

    // 95% of successful responses should be under maxResponseTime
    if (responseTimes.length > 0) {
      const underThreshold = responseTimes.filter(
        (time) => time < maxResponseTime
      ).length;
      const percentageUnderThreshold =
        underThreshold / responseTimes.length;

      expect(percentageUnderThreshold).toBeGreaterThanOrEqual(
        targetPercentile
      );
    }

    // Log performance metrics
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Successful requests: ${successCount}/${concurrentRequests}`);
    console.log(`5xx errors: ${error5xxCount}`);
    if (responseTimes.length > 0) {
      console.log(
        `95th percentile response time: ${percentile95Time}ms`
      );
      console.log(
        `Average response time: ${
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        }ms`
      );
    }
  });

  test('Should handle 20 concurrent advanced routes requests', async ({
    request,
  }) => {
    const lifiClient = new LifiClient(request);
    const pair = tokenData.tokenPairs[0];
    const concurrentRequests = 20;
    const maxResponseTime = 3000; // 3 seconds for more complex endpoint
    const targetPercentile = 0.95;

    const startTime = Date.now();
    const promises = Array.from({ length: concurrentRequests }, async () => {
      const requestStart = Date.now();
      const response = await lifiClient.postAdvancedRoutes({
        fromChainId: Number(pair.fromChain),
        toChainId: Number(pair.toChain),
        fromTokenAddress: pair.fromToken,
        toTokenAddress: pair.toToken,
        fromAmount: pair.fromAmount,
        fromAddress: TEST_EVM_WALLET_ADDRESS,
        toAddress: TEST_EVM_WALLET_ADDRESS,
      });
      const requestEnd = Date.now();
      return { response, responseTime: requestEnd - requestStart };
    });

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    const responseTimes: number[] = [];
    let successCount = 0;
    let error5xxCount = 0;

    for (const { response, responseTime } of results) {
      const status = response.status();

      if (status >= 200 && status < 300) {
        successCount++;
        responseTimes.push(responseTime);
      } else if (status >= 500) {
        error5xxCount++;
      }
    }

    responseTimes.sort((a, b) => a - b);
    const percentile95Index = Math.floor(
      responseTimes.length * targetPercentile
    );
    const percentile95Time =
      responseTimes[percentile95Index] || responseTimes[responseTimes.length - 1];

    expect(error5xxCount).toBe(0);
    expect(successCount).toBeGreaterThan(0);

    if (responseTimes.length > 0) {
      const underThreshold = responseTimes.filter(
        (time) => time < maxResponseTime
      ).length;
      const percentageUnderThreshold =
        underThreshold / responseTimes.length;

      expect(percentageUnderThreshold).toBeGreaterThanOrEqual(
        targetPercentile
      );
    }

    console.log(`Total time: ${totalTime}ms`);
    console.log(`Successful requests: ${successCount}/${concurrentRequests}`);
    console.log(`5xx errors: ${error5xxCount}`);
    if (responseTimes.length > 0) {
      console.log(
        `95th percentile response time: ${percentile95Time}ms`
      );
    }
  });

  test('Should handle mixed concurrent requests (quote + tools)', async ({
    request,
  }) => {
    const lifiClient = new LifiClient(request);
    const pair = tokenData.tokenPairs[0];
    const concurrentRequests = 10;

    const promises = [
      ...Array.from({ length: concurrentRequests }, () =>
        lifiClient.getQuote({
          fromChain: pair.fromChain,
          toChain: pair.toChain,
          fromToken: pair.fromToken,
          toToken: pair.toToken,
          fromAmount: pair.fromAmount,
          fromAddress: TEST_EVM_WALLET_ADDRESS,
          toAddress: TEST_EVM_WALLET_ADDRESS,
        })
      ),
      ...Array.from({ length: concurrentRequests }, () =>
        lifiClient.getTools({ chains: [pair.fromChain] })
      ),
    ];

    const responses = await Promise.all(promises);

    let successCount = 0;
    let error5xxCount = 0;

    for (const response of responses) {
      const status = response.status();
      if (status >= 200 && status < 300) {
        successCount++;
      } else if (status >= 500) {
        error5xxCount++;
      }
    }

    expect(error5xxCount).toBe(0);
    expect(successCount).toBeGreaterThan(concurrentRequests);

    console.log(
      `Mixed requests - Successful: ${successCount}/${promises.length}, 5xx errors: ${error5xxCount}`
    );
  });
});

