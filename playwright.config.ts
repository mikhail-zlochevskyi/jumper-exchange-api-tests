import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: process.env.LIFI_BASE_URL || 'https://li.quest/v1',
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(process.env.LIFI_API_KEY
        ? { 'x-lifi-api-key': process.env.LIFI_API_KEY }
        : {}),
    },
  },
  projects: [
    {
      name: 'api-tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  timeout: 30000,
  expect: {
    timeout: 5000
  }
});


