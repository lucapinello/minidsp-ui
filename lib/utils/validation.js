/**
 * Clamp a number between min and max values
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {number} The clamped value
 */
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Validate gain value (-127 to 0 dB)
 * @param {number} value - The gain value to validate
 * @returns {number} The validated gain value
 */
export const validateGain = (value) => clamp(value, -127, 0);

/**
 * Validate delay value (0 to 80 ms)
 * @param {number} value - The delay value to validate
 * @returns {number} The validated delay value
 */
export const validateDelay = (value) => clamp(value, 0, 80);

/**
 * Validate preset number (0 to 3)
 * @param {number|string} value - The preset number to validate
 * @returns {number} The validated preset number
 */
export const validatePreset = (value) => clamp(parseInt(value), 0, 3); 