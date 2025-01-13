import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Navigate to the page and wait for it to be ready
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    
    // Check for Next.js error overlay
    const errorOverlay = page.locator('[data-nextjs-dialog-left-right]');
    const hasError = await errorOverlay.isVisible().catch(() => false);
    if (hasError) {
      const errorMessage = await page.locator('[data-nextjs-dialog-body]').textContent();
      throw new Error(`Next.js error overlay detected: ${errorMessage}`);
    }
    
    // Wait for the core UI elements to be ready
    const hostnameInput = page.locator('[data-testid="hostname-input"]');
    const connectButton = page.locator('[data-testid="connect-button"]');
    
    await hostnameInput.waitFor({ state: 'attached', timeout: 15000 });
    await connectButton.waitFor({ state: 'attached', timeout: 15000 });
    
    await use(page);
  },
});

export { expect }; 