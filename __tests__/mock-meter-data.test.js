import { createMockMeterGenerator } from '@/lib/mock-meter-data';

describe('Mock Meter Data Generator', () => {
  let generator;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('generates data within expected ranges', () => {
    // Use fixed test parameters for deterministic behavior
    generator = createMockMeterGenerator(6, {
      phase: 0,
      timeStep: 0.1,
      variation: 0
    });

    const samples = [];
    for (let i = 0; i < 100; i++) {
      samples.push(generator.next());
    }

    samples.forEach(channelData => {
      // Check that we get data for all channels (2 inputs + 4 outputs)
      expect(channelData).toHaveLength(6);

      channelData.forEach(({ rms, peak }) => {
        // Check RMS levels stay within -60 to 0 dB
        expect(rms).toBeGreaterThanOrEqual(-60);
        expect(rms).toBeLessThanOrEqual(0);
        
        // Check peak levels stay within -60 to 0 dB and are >= RMS
        expect(peak).toBeGreaterThanOrEqual(-60);
        expect(peak).toBeLessThanOrEqual(0);
        expect(peak).toBeGreaterThanOrEqual(rms);
      });
    });
  });

  it('generates smooth transitions between values', () => {
    // Use fixed test parameters with small time steps
    generator = createMockMeterGenerator(6, {
      phase: 0,
      timeStep: 0.01, // Small time step for smooth transitions
      variation: 0    // No random variation
    });

    const samples = Array.from({ length: 10 }, () => generator.next());
    
    // Check that consecutive values don't change too drastically
    for (let i = 1; i < samples.length; i++) {
      samples[i].forEach((channel, idx) => {
        const prevChannel = samples[i-1][idx];
        const rmsChange = Math.abs(channel.rms - prevChannel.rms);
        expect(rmsChange).toBeLessThanOrEqual(3); // Max 3dB change per update
      });
    }
  });

  it('maintains consistent channel count', () => {
    generator = createMockMeterGenerator(6, {
      phase: 0,
      timeStep: 0.1,
      variation: 0
    });

    const samples = [];
    for (let i = 0; i < 10; i++) {
      samples.push(generator.next());
    }

    // Check that we always get 6 channels of data (2 inputs + 4 outputs)
    samples.forEach(channelData => {
      expect(channelData).toHaveLength(6);
    });
  });
}); 