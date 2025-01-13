import { test, expect } from '@playwright/test';

test('meters are visible and respond to data', async ({ page }) => {
  // Set mock mode and navigate to page
  process.env.NEXT_PUBLIC_USE_MOCK_MINIDSP = 'true';
  await page.goto('/');

  // Connect to start meter stream
  await page.getByRole('button', { name: 'Connect' }).click();

  // Wait for meters to be visible
  const inputMeter = await page.getByTestId('input-DENON AVR-meter');
  const outputMeters = await page.getByTestId(/^output-Output \d-meter$/);

  // Verify meter counts
  await expect(inputMeter).toBeVisible();
  await expect(outputMeters).toHaveCount(4);

  // Verify each meter has RMS and peak elements
  await expect(page.getByTestId('input-DENON AVR-meter-rms')).toBeVisible();
  await expect(page.getByTestId('input-DENON AVR-meter-peak')).toBeVisible();
  await expect(page.getByTestId('input-DENON AVR-meter-peak-hold')).toBeVisible();

  // Wait a bit and verify meter values are updating
  const initialRmsValue = await page.getByTestId('input-DENON AVR-meter-rms').getAttribute('style');
  await page.waitForTimeout(500);
  const updatedRmsValue = await page.getByTestId('input-DENON AVR-meter-rms').getAttribute('style');
  expect(initialRmsValue).not.toBe(updatedRmsValue);
}); 