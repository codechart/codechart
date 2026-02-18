/**
 * Utility functions for common math operations
 */

/**
 * Rounds a number to a specified number of decimal places
 * Properly rounds to nearest value
 * @param {number} value - The number to round
 * @param {number} [decimals=0] - Number of decimal places
 * @returns {number} The rounded number
 */
export function round(value, decimals = 0) {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Clamps a value between a minimum and maximum
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum bound
 * @param {number} max - Maximum bound
 * @returns {number} The clamped value
 */
export function clamp(value, min, max) {
  if (min > max) {
    throw new Error('min cannot be greater than max');
  }
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}
