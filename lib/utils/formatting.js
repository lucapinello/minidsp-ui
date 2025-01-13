/**
 * Format a gain value for display
 * @param {number} value - The gain value to format
 * @param {number} [precision=1] - Number of decimal places
 * @returns {string} Formatted gain value with dB suffix
 */
export const formatGain = (value, precision = 1) => 
  `${value.toFixed(precision)} dB`;

/**
 * Format a delay value for display
 * @param {number} value - The delay value to format
 * @param {number} [precision=2] - Number of decimal places
 * @returns {string} Formatted delay value with ms suffix
 */
export const formatDelay = (value, precision = 2) => 
  `${value.toFixed(precision)} ms`;

/**
 * Format a preset number for display
 * @param {number} value - The preset number (0-3)
 * @returns {string} Formatted preset name
 */
export const formatPreset = (value) => 
  `Preset ${value + 1}`;

/**
 * Format a meter level for display
 * @param {number} value - The meter level in dB
 * @param {number} [precision=1] - Number of decimal places
 * @returns {string} Formatted meter level with dB suffix
 */
export const formatMeterLevel = (value, precision = 1) => 
  `${value.toFixed(precision)} dB`; 