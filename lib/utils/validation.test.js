import { clamp, validateGain, validateDelay, validatePreset } from '@/lib/utils/validation';

describe('validation utilities', () => {
  describe('clamp', () => {
    it('clamps value between min and max', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('validateGain', () => {
    it('clamps gain between -127 and 0', () => {
      expect(validateGain(-50)).toBe(-50);
      expect(validateGain(-150)).toBe(-127);
      expect(validateGain(10)).toBe(0);
    });
  });

  describe('validateDelay', () => {
    it('clamps delay between 0 and 80', () => {
      expect(validateDelay(40)).toBe(40);
      expect(validateDelay(-10)).toBe(0);
      expect(validateDelay(100)).toBe(80);
    });
  });

  describe('validatePreset', () => {
    it('clamps preset between 0 and 3', () => {
      expect(validatePreset(2)).toBe(2);
      expect(validatePreset(-1)).toBe(0);
      expect(validatePreset(5)).toBe(3);
    });

    it('converts string input to number', () => {
      expect(validatePreset('2')).toBe(2);
      expect(validatePreset('0')).toBe(0);
      expect(validatePreset('5')).toBe(3);
    });
  });
}); 