import { createMockMeterGenerator } from './mock-meter-data';

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
   * Set output gains
   * @param {Array<{index: number, gain: number}>} gains Array of output gains
   */
  async setOutputGains(gains) {
    return this.updateConfig({ outputs: gains });
  }
}

/**
 * Mock implementation for testing
 * @extends {MiniDSPClient}
 */
export class MockMiniDSPClient extends MiniDSPClient {
  /**
   * @param {string} hostname - The hostname to connect to
   */
  constructor(hostname) {
    super(hostname);
    /** @type {{ 
      master: { volume: number, mute: boolean, source: string, preset: number, dirac: boolean },
      inputs: Array<{ index: number, label: string, gain: number, mute: boolean }>,
      outputs: Array<{ index: number, label: string, gain: number, delay: number, inverted: boolean, mute: boolean }>
    }} */
    this.mockState = {
      master: { volume: -20, mute: false, source: 'USB', preset: 0, dirac: false },
      inputs: [
        { index: 0, label: 'Input 1', gain: 0, mute: false },
        { index: 1, label: 'Input 2', gain: 0, mute: false }
      ],
      outputs: [
        { index: 0, label: 'Output 1', gain: -10, delay: 0, inverted: false, mute: false },
        { index: 1, label: 'Output 2', gain: -10, delay: 0, inverted: false, mute: false },
        { index: 2, label: 'Output 3', gain: -10, delay: 0, inverted: false, mute: false },
        { index: 3, label: 'Output 4', gain: -10, delay: 0, inverted: false, mute: false }
      ]
    };
    // Create meter generator with channel count based on inputs + outputs
    this.meterGenerator = createMockMeterGenerator(
      this.mockState.inputs.length + this.mockState.outputs.length
    );
  }

  async getMeterLevels() {
    return this.meterGenerator.next();
  }

  async getStatus() {
    return this.mockState;
  }

  async getDevices() {
    return [{ id: 0, name: 'Mock MiniDSP' }];
  }

  async updateConfig(config) {
    if (config.master_status) {
      this.mockState.master = { ...this.mockState.master, ...config.master_status };
    }
    if (config.inputs) {
      config.inputs.forEach(input => {
        const target = this.mockState.inputs.find(i => i.index === input.index);
        if (target) {
          Object.assign(target, input);
        }
      });
    }
    if (config.outputs) {
      config.outputs.forEach(output => {
        const target = this.mockState.outputs.find(o => o.index === output.index);
        if (target) {
          Object.assign(target, output);
        }
      });
    }
    return this.mockState;
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
  return hostname === 'mock' ? new MockMiniDSPClient(hostname) : new RealMiniDSPClient(hostname);
} 