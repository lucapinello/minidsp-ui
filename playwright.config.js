import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for end-to-end tests.
 * 
 * Key features:
 * - Runs tests in parallel for faster execution
 * - Uses mock MiniDSP implementation
 * - 5 second timeouts for faster failure detection
 * - CI-specific settings for reliability
 */
export default defineConfig({
  testDir: './integration/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev:mock',
    url: 'http://localhost:3000',
    timeout: 5000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    readyPattern: 'Ready in',
  },
  timeout: 5000,
  expect: {
    timeout: 5000
  }
}); 