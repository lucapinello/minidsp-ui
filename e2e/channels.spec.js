import { test, expect } from './test-utils';

test.describe('Channel visibility', () => {
  test('shows input channels after connecting', async ({ page }) => {
    const connectButton = page.locator('[data-testid="connect-button"]');
    await connectButton.click();
    await expect(connectButton).toHaveClass(/bg-destructive/);
    
    // Check input channels are visible
    const input1Gain = page.locator('[data-testid="input-Input 1-gain"]');
    const input2Gain = page.locator('[data-testid="input-Input 2-gain"]');
    await input1Gain.waitFor({ state: 'attached', timeout: 15000 });
    await input2Gain.waitFor({ state: 'attached', timeout: 15000 });
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
      await outputGain.waitFor({ state: 'attached', timeout: 15000 });
      await expect(outputGain).toBeVisible();
    }
  });
}); 