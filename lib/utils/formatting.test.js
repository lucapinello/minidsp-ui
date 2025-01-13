import { formatGain, formatDelay, formatPreset, formatMeterLevel } from '@/lib/utils/formatting';

describe('formatting utilities', () => {
  describe('formatGain', () => {
    it('formats gain with default precision', () => {
      expect(formatGain(-10)).toBe('-10.0 dB');
      expect(formatGain(-127)).toBe('-127.0 dB');
      expect(formatGain(0)).toBe('0.0 dB');
    });

    it('formats gain with custom precision', () => {
      expect(formatGain(-10.123, 2)).toBe('-10.12 dB');
      expect(formatGain(-127.456, 3)).toBe('-127.456 dB');
    });
  });

  describe('formatDelay', () => {
    it('formats delay with default precision', () => {
      expect(formatDelay(10)).toBe('10.00 ms');
      expect(formatDelay(0)).toBe('0.00 ms');
      expect(formatDelay(80)).toBe('80.00 ms');
    });

    it('formats delay with custom precision', () => {
      expect(formatDelay(10.123, 1)).toBe('10.1 ms');
      expect(formatDelay(80.456, 3)).toBe('80.456 ms');
    });
  });

  describe('formatPreset', () => {
    it('formats preset numbers correctly', () => {
      expect(formatPreset(0)).toBe('Preset 1');
      expect(formatPreset(1)).toBe('Preset 2');
      expect(formatPreset(2)).toBe('Preset 3');
      expect(formatPreset(3)).toBe('Preset 4');
    });
  });

  describe('formatMeterLevel', () => {
    it('formats meter level with default precision', () => {
      expect(formatMeterLevel(-60)).toBe('-60.0 dB');
      expect(formatMeterLevel(0)).toBe('0.0 dB');
      expect(formatMeterLevel(-10)).toBe('-10.0 dB');
    });

    it('formats meter level with custom precision', () => {
      expect(formatMeterLevel(-60.123, 2)).toBe('-60.12 dB');
      expect(formatMeterLevel(-10.456, 3)).toBe('-10.456 dB');
    });
  });
}); 