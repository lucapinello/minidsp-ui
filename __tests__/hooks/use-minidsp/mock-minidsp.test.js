import { mockMinidsp } from '@/lib/mock-minidsp';
import { MockMiniDSPClient } from '@/lib/minidsp-api';

describe('Mock MiniDSP', () => {
  it('should list available devices', () => {
    const devices = mockMinidsp.getDevices();
    expect(devices).toEqual([{ id: 0, name: 'Mock MiniDSP 2x4 HD' }]);
  });

  it('should get device status', () => {
    const status = mockMinidsp.getDeviceStatus();
    expect(status.master).toBeDefined();
    expect(status.outputs).toHaveLength(4);
  });

  it('should update master volume', () => {
    mockMinidsp.updateConfig({
      master_status: { volume: -20 }
    });

    const status = mockMinidsp.getDeviceStatus();
    expect(status.master.volume).toBe(-20);
  });

  it('should update output gains', () => {
    mockMinidsp.updateConfig({
      outputs: [{ index: 0, gain: -10 }]
    });

    const status = mockMinidsp.getDeviceStatus();
    expect(status.outputs[0].gain).toBe(-10);
  });

  it('should handle multiple output updates', () => {
    mockMinidsp.updateConfig({
      outputs: [
        { index: 0, gain: -5 },
        { index: 1, gain: -5 }
      ]
    });

    const status = mockMinidsp.getDeviceStatus();
    expect(status.outputs[0].gain).toBe(-5);
    expect(status.outputs[1].gain).toBe(-5);
  });

  it('should update dirac status', () => {
    mockMinidsp.updateConfig({
      master_status: { dirac: true }
    });

    const status = mockMinidsp.getDeviceStatus();
    expect(status.master.dirac).toBe(true);
  });

  it('should update input mute state', () => {
    mockMinidsp.updateConfig({
      inputs: [{ index: 0, mute: true }]
    });

    const status = mockMinidsp.getDeviceStatus();
    expect(status.inputs[0].mute).toBe(true);
  });

  it('should update output mute state', () => {
    mockMinidsp.updateConfig({
      outputs: [{ index: 0, mute: true }]
    });

    const status = mockMinidsp.getDeviceStatus();
    expect(status.outputs[0].mute).toBe(true);
  });

  it('should update output invert state', () => {
    mockMinidsp.updateConfig({
      outputs: [{ index: 0, inverted: true }]
    });

    const status = mockMinidsp.getDeviceStatus();
    expect(status.outputs[0].inverted).toBe(true);
  });

  it('should handle multiple state updates for an output', () => {
    mockMinidsp.updateConfig({
      outputs: [{ 
        index: 0, 
        mute: true,
        inverted: true,
        gain: -20
      }]
    });

    const status = mockMinidsp.getDeviceStatus();
    expect(status.outputs[0].mute).toBe(true);
    expect(status.outputs[0].inverted).toBe(true);
    expect(status.outputs[0].gain).toBe(-20);
  });
});

describe('MockMiniDSPClient', () => {
  let client;

  beforeEach(() => {
    client = new MockMiniDSPClient('mock');
  });

  it('can be instantiated and returns meter data', async () => {
    const meterData = await client.getMeterLevels();
    expect(meterData).toHaveLength(6); // 2 inputs + 4 outputs
    meterData.forEach(channel => {
      expect(channel).toHaveProperty('rms');
      expect(channel).toHaveProperty('peak');
    });
  });

  // ... existing tests ...
}); 