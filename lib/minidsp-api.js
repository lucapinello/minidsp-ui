import { createMockMeterGenerator } from './mock-meter-data';
import { mockMinidsp } from './mock-minidsp';

/**
 * Base interface for MiniDSP API client
 * All implementations must follow this contract
 */
export class MiniDSPClient {
  constructor(hostname) {
    if (this.constructor === MiniDSPClient) {
      throw new Error("Can't instantiate abstract class");
    }
    this.hostname = hostname;
  }

  /**
   * Get meter levels for all channels
   * @returns {Promise<Array<{rms: number, peak: number}>>} Array of meter levels
   */
  async getMeterLevels() {
    throw new Error('Not implemented');
  }

  /**
   * Get device status including input/output gains, mutes, etc.
   * @returns {Promise<Object>} Device status
   */
  async getStatus() {
    throw new Error('Not implemented');
  }

  /**
   * Get list of available devices
   * @returns {Promise<Array>} List of devices
   */
  async getDevices() {
    throw new Error('Not implemented');
  }

  /**
   * Update device configuration
   * @param {Object} config Configuration object
   * @returns {Promise<Object>} Updated device status
   */
  async updateConfig(config) {
    throw new Error('Not implemented');
  }

  /**
   * Set master volume
   * @param {number} volume Volume level (-127 to 0)
   */
  async setMasterVolume(volume) {
    return this.updateConfig({ master_status: { volume } });
  }

  /**
   * Set master mute
   * @param {boolean} mute Mute state
   */
  async setMasterMute(mute) {
    return this.updateConfig({ master_status: { mute } });
  }

  /**
   * Set input source
   * @param {string} source Input source ('TOSLINK' | 'SPDIF' | 'USB')
   */
  async setInputSource(source) {
    return this.updateConfig({ master_status: { source } });
  }

  /**
   * Set input gain
   * @param {number} index Input channel index
   * @param {number} gain Gain level (-127 to 0)
   */
  async setInputGain(index, gain) {
    return this.updateConfig({ inputs: [{ index, gain }] });
  }

  /**
   * Set input mute
   * @param {number} index Input channel index
   * @param {boolean} mute Mute state
   */
  async setInputMute(index, mute) {
    return this.updateConfig({ inputs: [{ index, mute }] });
  }

  /**
   * Set output gain
   * @param {number} index Output channel index
   * @param {number} gain Gain level (-127 to 0)
   */
  async setOutputGain(index, gain) {
    return this.updateConfig({ outputs: [{ index, gain }] });
  }

  /**
   * Set output mute
   * @param {number} index Output channel index
   * @param {boolean} mute Mute state
   */
  async setOutputMute(index, mute) {
    return this.updateConfig({ outputs: [{ index, mute }] });
  }

  /**
   * Set output inverted state
   * @param {number} index Output channel index
   * @param {boolean} inverted Inverted state
   */
  async setOutputInverted(index, inverted) {
    return this.updateConfig({ outputs: [{ index, inverted }] });
  }

  /**
   * Set output delay
   * @param {number} index Output channel index
   * @param {number} delay Delay in milliseconds
   */
  async setOutputDelay(index, delay) {
    return this.updateConfig({ outputs: [{ index, delay }] });
  }

  /**
   * Set output gains
   * @param {Array<{index: number, gain: number}>} gains Array of output gains
   */
  async setOutputGains(gains) {
    return this.updateConfig({ outputs: gains });
  }
}

/**
 * Mock implementation for testing the client interface
 * 
 * This mock implements the MiniDSPClient interface for use in:
 * 1. Development mode when running the frontend without a real device
 * 2. Tests that verify client behavior
 * 3. E2E tests that need to simulate a connected device
 * 
 * Note: This is different from the mock in mock-minidsp.js which mocks the REST API endpoints.
 * This client mock uses that API mock's state to ensure consistency between API calls and client calls.
 * 
 * @extends {MiniDSPClient}
 */
export class MockMiniDSPClient extends MiniDSPClient {
  /**
   * @param {string} hostname - The hostname to connect to
   */
  constructor(hostname) {
    super(hostname);
    // Create meter generator with channel count based on inputs + outputs
    const state = mockMinidsp.getDeviceStatus();
    this.meterGenerator = createMockMeterGenerator(
      state.inputs.length + state.outputs.length
    );
  }

  async getMeterLevels() {
    return this.meterGenerator.next();
  }

  async getStatus() {
    return mockMinidsp.getDeviceStatus();
  }

  async getDevices() {
    return mockMinidsp.getDevices();
  }

  async updateConfig(config) {
    return mockMinidsp.updateConfig(config);
  }
}

/**
 * Real implementation for MiniDSP hardware
 */
export class RealMiniDSPClient extends MiniDSPClient {
  async getMeterLevels() {
    const [inputs, outputs] = await Promise.all([
      fetch(`http://${this.hostname}/devices/0/inputs/meters`).then(r => r.json()),
      fetch(`http://${this.hostname}/devices/0/outputs/meters`).then(r => r.json())
    ]);
    return [...inputs, ...outputs];
  }

  async getStatus() {
    return fetch(`http://${this.hostname}/devices/0/status`).then(r => r.json());
  }

  async getDevices() {
    return fetch(`http://${this.hostname}/devices`).then(r => r.json());
  }

  async updateConfig(config) {
    return fetch(`http://${this.hostname}/devices/0/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }).then(r => r.json());
  }
}

/**
 * Factory function to create the appropriate client based on hostname
 */
export function createMiniDSPClient(hostname) {
  const client = hostname === 'mock' ? new MockMiniDSPClient(hostname) : new RealMiniDSPClient(hostname);
  if (hostname === 'mock' && typeof window !== 'undefined') {
    window.mockMinidspClient = client;
  }
  return client;
} 