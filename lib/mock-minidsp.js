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

const logStateChange = (type, before, after) => {
  console.log(`Mock: ${type} changed:`, {
    before,
    after,
    change: typeof before === 'object' ? 
      Object.keys(after).filter(k => after[k] !== before[k]).reduce((acc, k) => ({...acc, [k]: after[k]}), {}) :
      after
  });
};

export const mockMinidsp = {
  // List available devices
  getDevices() {
    console.log('Mock: getDevices called');
    return [{ id: 0, name: 'Mock MiniDSP' }];
  },

  // Get device status
  getDeviceStatus() {
    console.log('Mock: getDeviceStatus called, current state:', deviceState);
    return { ...deviceState };
  },

  // Update device configuration
  updateConfig(config) {
    console.log('Mock: updateConfig called with:', config);
    
    if (config.master_status) {
      const oldMaster = { ...deviceState.master };
      deviceState.master = {
        ...deviceState.master,
        ...config.master_status
      };
      logStateChange('master', oldMaster, deviceState.master);
    }

    if (config.outputs) {
      for (const output of config.outputs) {
        const existingOutput = deviceState.outputs.find(o => o.index === output.index);
        if (existingOutput) {
          const oldGain = existingOutput.gain;
          existingOutput.gain = output.gain;
          logStateChange(`output[${output.index}] gain`, oldGain, output.gain);
        }
      }
    }

    return { success: true };
  }
}; 