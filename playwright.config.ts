import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5183',
    headless: true,
    screenshot: 'on',
    video: 'off',
  },
  outputDir: './test-results/playwright',
});
