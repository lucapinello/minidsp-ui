import { test, expect } from './test-utils';

test('meters are visible and respond to data', async ({ page }) => {
  const connectButton = page.locator('[data-testid="connect-button"]');
  await connectButton.click();
  
  // Wait for connection to be established (button variant changes to destructive)
  await expect(connectButton).toHaveClass(/bg-destructive/);
  
  // Wait for meters to appear and verify they update
  const meters = page.locator('[data-testid="input-Input 1-meter"]');
  await meters.waitFor({ state: 'attached', timeout: 15000 });
  await expect(meters).toBeVisible();
  
  // Wait for meter to show non-zero values
  const rmsBar = page.locator('[data-testid="input-Input 1-meter-rms"]');
  await rmsBar.waitFor({ state: 'attached', timeout: 15000 });
  await expect(async () => {
    const height = await rmsBar.evaluate(el => el.style.height);
    expect(height).not.toBe('0%');
  }).toPass({
    timeout: 3000,
    intervals: [100, 250, 500]
  });
}); 