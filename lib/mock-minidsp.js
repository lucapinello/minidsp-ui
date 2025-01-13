// Mock state for the MiniDSP device
let deviceState = {
  master: {
    volume: -10,
    mute: false,
    source: 'USB',
    preset: 0,
    dirac: false
  },
  outputs: [
    { index: 0, gain: 0 },    // Left
    { index: 1, gain: 0 },    // Right
    { index: 2, gain: -20 }   // Subwoofer
  ]
};

export const mockMinidsp = {
  // List available devices
  getDevices() {
    return [{ id: 0, name: 'Mock MiniDSP' }];
  },

  // Get device status
  getDeviceStatus() {
    return { ...deviceState };
  },

  // Update device configuration
  updateConfig(config) {
    if (config.master_status) {
      deviceState.master = {
        ...deviceState.master,
        ...config.master_status
      };
    }

    if (config.outputs) {
      for (const output of config.outputs) {
        const existingOutput = deviceState.outputs.find(o => o.index === output.index);
        if (existingOutput) {
          existingOutput.gain = output.gain;
        }
      }
    }

    return { success: true };
  }
}; 