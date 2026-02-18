/**
 * Validates that a value is a finite number
 * @param {*} value - Value to validate
 * @param {string} name - Parameter name for error message
 * @throws {TypeError} If value is not a number
 */
function validateNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the sine of an angle
 * @param {number} angle - The angle
 * @param {boolean} [useDegrees=true] - If true, angle is in degrees; if false, radians
 * @returns {number} The sine of the angle
 */
export function sin(angle, useDegrees = true) {
  validateNumber(angle, 'angle');
  const radians = useDegrees ? degreesToRadians(angle) : angle;
  return Math.sin(radians);
}

/**
 * Calculates the cosine of an angle
 * @param {number} angle - The angle
 * @param {boolean} [useDegrees=true] - If true, angle is in degrees; if false, radians
 * @returns {number} The cosine of the angle
 */
export function cos(angle, useDegrees = true) {
  validateNumber(angle, 'angle');
  const radians = useDegrees ? degreesToRadians(angle) : angle;
  return Math.cos(radians);
}

/**
 * Calculates the tangent of an angle
 * @param {number} angle - The angle
 * @param {boolean} [useDegrees=true] - If true, angle is in degrees; if false, radians
 * @returns {number} The tangent of the angle
 * @throws {RangeError} If angle is at a point where tangent is undefined (90°, 270°, etc.)
 */
export function tan(angle, useDegrees = true) {
  validateNumber(angle, 'angle');
  const radians = useDegrees ? degreesToRadians(angle) : angle;

  // Check for undefined points (where cos = 0)
  const cosValue = Math.cos(radians);
  if (Math.abs(cosValue) < 1e-10) {
    throw new RangeError('Tangent is undefined at this angle (90°, 270°, etc.)');
  }

  return Math.tan(radians);
}
