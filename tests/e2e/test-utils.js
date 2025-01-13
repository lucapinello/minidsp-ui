import { test as base, expect } from '@playwright/test';

async function checkForRuntimeErrors(page) {
  // Check for Next.js error overlay
  const errorOverlay = page.locator('[data-nextjs-dialog-left-right]');
  const hasError = await errorOverlay.isVisible().catch(() => false);
  if (hasError) {
    const errorMessage = await page.locator('[data-nextjs-dialog-body]').textContent();
    throw new Error(`Next.js error overlay detected: ${errorMessage}`);
  }
}

export async function setupMockMinidsp(page) {
  // Wait for the page to be ready
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');

  // Enter mock hostname and connect
  await page.getByTestId('hostname-input').fill('mock');
  await page.getByTestId('connect-button').click();

  // Wait for connection to be established
  await page.waitForFunction(() => {
    const status = window.mockMinidsp?.getDeviceStatus();
    return status && status.master;
  });
}

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    
    // Listen for console errors
    page.on('pageerror', (error) => {
      errors.push(`Page error: ${error.message}`);
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`Console error: ${msg.text()}`);
      }
    });

    // Navigate to the page and wait for it to be ready
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    
    // Check for initial runtime errors
    await checkForRuntimeErrors(page);
    
    // Wait for the core UI elements to be ready
    const hostnameInput = page.locator('[data-testid="hostname-input"]');
    const connectButton = page.locator('[data-testid="connect-button"]');
    
    await hostnameInput.waitFor({ state: 'attached' });
    await connectButton.waitFor({ state: 'attached' });
    
    // Add error checking after each action
    const originalGoto = page.goto.bind(page);
    page.goto = async (...args) => {
      const result = await originalGoto(...args);
      await checkForRuntimeErrors(page);
      return result;
    };
    
    await use(page);

    // After the test, check if we collected any errors
    if (errors.length > 0) {
      throw new Error(`Errors detected during test:\n${errors.join('\n')}`);
    }
  },
});

export { expect }; 