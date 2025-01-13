import { test, expect } from './test-utils';

/**
 * Tests for channel visibility after connection.
 * 
 * Verifies that:
 * 1. Input channels (1-2) appear after connecting
 * 2. Output channels (1-4) appear after connecting
 * 3. All channel controls are visible and accessible
 */
test.describe('Channel visibility', () => {
  test('shows input channels after connecting', async ({ page }) => {
    const connectButton = page.locator('[data-testid="connect-button"]');
    await connectButton.click();
    await expect(connectButton).toHaveClass(/bg-destructive/);
    
    // Check input channels are visible
    const input1Gain = page.locator('[data-testid="input-Input 1-gain"]');
    const input2Gain = page.locator('[data-testid="input-Input 2-gain"]');
    await expect(input1Gain).toBeVisible();
    await expect(input2Gain).toBeVisible();
  });
  
  test('shows output channels after connecting', async ({ page }) => {
    const connectButton = page.locator('[data-testid="connect-button"]');
    await connectButton.click();
    await expect(connectButton).toHaveClass(/bg-destructive/);
    
    // Check output channels are visible
    for (let i = 1; i <= 4; i++) {
      const outputGain = page.locator(`[data-testid="output-Output ${i}-gain"]`);
      await expect(outputGain).toBeVisible();
    }
  });
}); 