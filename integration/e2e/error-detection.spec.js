import { test, expect } from './test-utils';

/**
 * These tests verify that our error detection infrastructure works.
 * Each test deliberately causes an error and verifies that it's detected.
 */
test.describe('Error Detection', () => {
  test('detects console errors', async ({ page }) => {
    test.fail(true, 'This test should fail when it detects the console error');
    
    await page.goto('/');
    await page.evaluate(() => {
      console.error('Test error message');
    });
    // Give test-utils time to detect the error
    await page.waitForTimeout(100);
  });

  test('detects runtime errors', async ({ page }) => {
    await page.goto('/');
    try {
      await page.evaluate(() => {
        throw new Error('Test runtime error');
      });
      throw new Error('Test should have failed');
    } catch (e) {
      expect(e.message).toContain('Test runtime error');
    }
  });

  test('detects React errors', async ({ page }) => {
    test.fail(true, 'This test should fail when it detects the React error');
    
    await page.goto('/');
    await page.evaluate(() => {
      // React errors are logged to console.error
      console.error(
        'Error: Uncaught [Error: Test React error]\n' +
        '    at ErrorBoundary.componentDidCatch\n' +
        '    at error (webpack-internal:///(app-pages-browser)/./node_modules/react-dom/cjs/react-dom.development.js:1:1)'
      );
    });
    
    // Give test-utils time to detect the error
    await page.waitForTimeout(100);
  });

  test('detects TypeError errors', async ({ page }) => {
    test.fail(true, 'This test should fail when it detects the TypeError');
    
    await page.goto('/');
    await page.evaluate(() => {
      const obj = undefined;
      try {
        obj.someMethod();
      } catch (e) {
        console.error('Failed to call method:', e);
      }
    });
    
    // Give test-utils time to detect the error
    await page.waitForTimeout(100);
  });
}); 