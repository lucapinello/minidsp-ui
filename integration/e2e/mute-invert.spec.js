import { test, expect } from './test-utils';

/**
 * End-to-end tests for mute and invert functionality.
 * Verifies that:
 * 1. Input channels can be muted/unmuted
 * 2. Output channels can be muted/unmuted
 * 3. Output channels can be inverted/normalized
 * 
 * Each test verifies both UI interaction and state changes in the mock client.
 */
test.describe('Mute and Invert functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Connect to mock device
    await page.getByTestId('hostname-input').fill('mock');
    await page.getByTestId('connect-button').click();
    
    // Wait for connection to be established
    await page.waitForSelector('[data-testid="connection-status"]');
    await expect(page.getByTestId('connection-status')).toHaveText('Connected');
  });

  test('can toggle mute on inputs', async ({ page }) => {
    // Get initial state of first input
    const input1Status = await page.evaluate(() => {
      const client = window.mockMinidspClient;
      return client.getStatus().then(state => state.inputs[0]);
    });
    expect(input1Status.mute).toBe(false);

    // Click mute button on first input
    await page.getByTestId('input-Input 1-mute').click();
    await page.waitForTimeout(100); // Give state time to update

    // Verify mute state changed
    const updatedInput1Status = await page.evaluate(() => {
      const client = window.mockMinidspClient;
      return client.getStatus().then(state => state.inputs[0]);
    });
    expect(updatedInput1Status.mute).toBe(true);

    // Click unmute and verify state changed back
    await page.getByTestId('input-Input 1-mute').click();
    await page.waitForTimeout(100); // Give state time to update
    
    const finalInput1Status = await page.evaluate(() => {
      const client = window.mockMinidspClient;
      return client.getStatus().then(state => state.inputs[0]);
    });
    expect(finalInput1Status.mute).toBe(false);
  });

  test('can toggle mute on outputs', async ({ page }) => {
    // Get initial state of first output
    const output1Status = await page.evaluate(() => {
      const client = window.mockMinidspClient;
      return client.getStatus().then(state => state.outputs[0]);
    });
    expect(output1Status.mute).toBe(false);

    // Click mute button on first output
    await page.getByTestId('output-Output 1-mute').click();
    await page.waitForTimeout(100); // Give state time to update

    // Verify mute state changed
    const updatedOutput1Status = await page.evaluate(() => {
      const client = window.mockMinidspClient;
      return client.getStatus().then(state => state.outputs[0]);
    });
    expect(updatedOutput1Status.mute).toBe(true);

    // Click unmute and verify state changed back
    await page.getByTestId('output-Output 1-mute').click();
    await page.waitForTimeout(100); // Give state time to update
    
    const finalOutput1Status = await page.evaluate(() => {
      const client = window.mockMinidspClient;
      return client.getStatus().then(state => state.outputs[0]);
    });
    expect(finalOutput1Status.mute).toBe(false);
  });

  test('can toggle invert on outputs', async ({ page }) => {
    // Get initial state of first output
    const output1Status = await page.evaluate(() => {
      const client = window.mockMinidspClient;
      return client.getStatus().then(state => state.outputs[0]);
    });
    expect(output1Status.inverted).toBe(false);

    // Click invert button on first output
    await page.getByTestId('output-Output 1-invert').click();
    await page.waitForTimeout(100); // Give state time to update

    // Verify invert state changed
    const updatedOutput1Status = await page.evaluate(() => {
      const client = window.mockMinidspClient;
      return client.getStatus().then(state => state.outputs[0]);
    });
    expect(updatedOutput1Status.inverted).toBe(true);

    // Click normal and verify state changed back
    await page.getByTestId('output-Output 1-invert').click();
    await page.waitForTimeout(100); // Give state time to update
    
    const finalOutput1Status = await page.evaluate(() => {
      const client = window.mockMinidspClient;
      return client.getStatus().then(state => state.outputs[0]);
    });
    expect(finalOutput1Status.inverted).toBe(false);
  });
}); 