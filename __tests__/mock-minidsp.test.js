import { mockMinidsp } from '@/lib/mock-minidsp';

describe('Mock MiniDSP', () => {
  it('should list available devices', () => {
    const devices = mockMinidsp.getDevices();
    expect(devices).toEqual([{ id: 0, name: 'Mock MiniDSP' }]);
  });

  it('should get device status', () => {
    const status = mockMinidsp.getDeviceStatus();
    expect(status.master).toBeDefined();
    expect(status.outputs).toHaveLength(3);
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
}); 