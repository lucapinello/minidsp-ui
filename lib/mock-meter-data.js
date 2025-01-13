// MiniDSP 2x4 HD configuration
const INPUT_CHANNELS = 2;
const OUTPUT_CHANNELS = 4;
const TOTAL_CHANNELS = INPUT_CHANNELS + OUTPUT_CHANNELS;

// Meter configuration
const MIN_DB = -60;
const MAX_DB = 0;
const RMS_WINDOW_SIZE = 10;
const BASE_LEVEL = -30;
const LEVEL_VARIATION = 20;
const RANDOM_VARIATION = 1.5;
const PEAK_CHANCE = 0.05;
const PEAK_VARIATION = 6;

/**
 * Creates a meter generator that produces realistic-looking meter data
 * @param {number} channelCount Number of channels to generate data for
 * @param {Object} testParams Optional parameters for testing (fixed phase and variation)
 * @returns {Object} A meter generator with a next() method
 */
export function createMockMeterGenerator(channelCount = TOTAL_CHANNELS, testParams = null) {
  const channels = Array(channelCount).fill(0).map((_, i) => ({
    phase: 0,
    rms: -20,
    peak: -20,
    // Distribute phases evenly across channels
    phaseOffset: (i * 2 * Math.PI) / channelCount
  }));

  return {
    next() {
      return channels.map(channel => {
        // Update phase with offset
        channel.phase = (channel.phase + 0.1) % (2 * Math.PI);
        
        // Calculate new RMS with smooth transition, using phase offset
        const targetRms = BASE_LEVEL + Math.sin(channel.phase + channel.phaseOffset) * LEVEL_VARIATION;
        const rmsChange = Math.min(3, Math.abs(targetRms - channel.rms));
        channel.rms = channel.rms + Math.sign(targetRms - channel.rms) * rmsChange;
        
        // Ensure peak is always higher than RMS
        channel.peak = Math.max(channel.peak, channel.rms);
        
        // Decay peak over time
        channel.peak = Math.max(channel.rms, channel.peak - 0.5);
        
        // Random peak spikes (disabled in test mode)
        if (!process.env.NODE_ENV === 'test' && Math.random() < PEAK_CHANCE) {
          channel.peak = channel.rms + Math.random() * PEAK_VARIATION;
        }
        
        return {
          rms: channel.rms,
          peak: channel.peak
        };
      });
    }
  };
} 