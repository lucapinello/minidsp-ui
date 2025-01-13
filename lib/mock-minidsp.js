/**
 * Mock implementation of the MiniDSP REST API endpoints
 * 
 * This mock simulates the REST API provided by minidsp-rs, which exposes endpoints like:
 * - GET /devices
 * - GET /devices/0/status
 * - POST /devices/0/config
 * 
 * This is used by:
 * 1. The Next.js API routes in development mode to avoid needing a real minidsp-rs server
 * 2. Tests that verify API endpoint behavior
 * 
 * Note: This is different from MockMiniDSPClient (in minidsp-api.js) which mocks the client interface.
 * Both use this shared state to ensure consistency between API calls and client calls.
 */

// Mock state for the MiniDSP 2x4 HD device
let deviceState = {
  master: {
    volume: -10,
    mute: false,
    source: 'USB',
    preset: 0,
    dirac: false
  },
  inputs: [
    { 
      index: 0,
      label: "Input 1",
      gain: 0,
      mute: false
    },
    {
      index: 1,
      label: "Input 2",
      gain: 0,
      mute: false
    }
  ],
  outputs: [
    { 
      index: 0,
      label: "Output 1",
      gain: -10,
      delay: 0,
      inverted: false,
      mute: false
    },
    {
      index: 1,
      label: "Output 2",
      gain: -10,
      delay: 0,
      inverted: false,
      mute: false
    },
    {
      index: 2,
      label: "Output 3",
      gain: -10,
      delay: 0,
      inverted: false,
      mute: false
    },
    {
      index: 3,
      label: "Output 4",
      gain: -10,
      delay: 0,
      inverted: false,
      mute: false
    }
  ]
};

const logStateChange = (type, before, after) => {
  console.log(`Mock API: ${type} changed:`, {
    before,
    after,
    change: typeof before === 'object' ? 
      Object.keys(after).filter(k => after[k] !== before[k]).reduce((acc, k) => ({...acc, [k]: after[k]}), {}) :
      after
  });
};

const log = (message, data) => {
  console.log(`Mock API: ${message}`, data);
};

export const mockMinidsp = {
  // List available devices
  getDevices() {
    log('getDevices called');
    return [{ id: 0, name: 'Mock MiniDSP 2x4 HD' }];
  },

  // Get device status
  getDeviceStatus() {
    log('getDeviceStatus called, current state:', deviceState);
    return deviceState;
  },

  // Update device configuration
  updateConfig(config) {
    log('updateConfig called with:', config);
    
    if (config.master_status) {
      const before = { ...deviceState.master };
      deviceState.master = { ...deviceState.master, ...config.master_status };
      log('master changed:', { before, after: deviceState.master, change: config.master_status });
    }

    if (config.inputs) {
      config.inputs.forEach(input => {
        const before = { ...deviceState.inputs[input.index] };
        deviceState.inputs[input.index] = {
          ...deviceState.inputs[input.index],
          ...input
        };
        log(`input[${input.index}] changed:`, { before, after: deviceState.inputs[input.index], change: input });
      });
    }

    if (config.outputs) {
      config.outputs.forEach(output => {
        const before = { ...deviceState.outputs[output.index] };
        deviceState.outputs[output.index] = {
          ...deviceState.outputs[output.index],
          ...output
        };
        log(`output[${output.index}] changed:`, { before, after: deviceState.outputs[output.index], change: output });
      });
    }

    return deviceState;
  },

  // Set input mute
  setInputMute(index, mute) {
    log('setInputMute called with:', { index, mute });
    return this.updateConfig({ inputs: [{ index, mute }] });
  },

  // Set output mute
  setOutputMute(index, mute) {
    log('setOutputMute called with:', { index, mute });
    return this.updateConfig({ outputs: [{ index, mute }] });
  }
}; 