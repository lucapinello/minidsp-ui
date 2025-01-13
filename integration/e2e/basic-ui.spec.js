import { test, expect } from './test-utils';

/**
 * Basic UI tests that verify core functionality.
 * 
 * Tests:
 * 1. Error-free page load and runtime behavior
 * 2. Connection form elements and their states
 * 3. Mock mode indicators and placeholders
 * 4. Connection and disconnection flows
 */
test.describe('Basic UI elements', () => {
  test('shows no runtime errors', async ({ page }) => {
    // The test-utils already check for error overlays on page load
    // Let's also check after a brief wait to catch any async errors
    await page.waitForTimeout(1000);
    const errorOverlay = page.locator('[data-nextjs-dialog-left-right]');
    await expect(errorOverlay).not.toBeVisible();
  });

  test('shows connection form with expected elements', async ({ page }) => {
    const hostnameInput = page.locator('[data-testid="hostname-input"]');
    const connectButton = page.locator('[data-testid="connect-button"]');
    
    await expect(hostnameInput).toBeVisible();
    await expect(hostnameInput).toBeEnabled();
    
    await expect(connectButton).toBeVisible();
    await expect(connectButton).toHaveText('Connect');
    await expect(connectButton).not.toHaveAttribute('data-variant', 'destructive');
  });
  
  test('shows mock mode indicator in hostname placeholder', async ({ page }) => {
    const hostnameInput = page.locator('[data-testid="hostname-input"]');
    await expect(hostnameInput).toHaveAttribute('placeholder', 'Using mock implementation');
  });
});

test.describe('Connection flow', () => {
  test('can connect in mock mode', async ({ page }) => {
    const connectButton = page.locator('[data-testid="connect-button"]');
    await connectButton.click();
    
    await expect(connectButton).toHaveText('Disconnect');
    await expect(connectButton).toHaveClass(/bg-destructive/);
  });
  
  test('can disconnect after connecting', async ({ page }) => {
    const connectButton = page.locator('[data-testid="connect-button"]');
    await connectButton.click();
    await expect(connectButton).toHaveText('Disconnect');
    
    await connectButton.click();
    await expect(connectButton).toHaveText('Connect');
    await expect(connectButton).not.toHaveClass(/bg-destructive/);
  });
}); 