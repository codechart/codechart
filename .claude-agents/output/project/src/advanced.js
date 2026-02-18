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
 * Validates that a value is a non-negative integer
 * @param {*} value - Value to validate
 * @param {string} name - Parameter name for error message
 * @throws {TypeError} If value is not a non-negative integer
 */
function validateNonNegativeInteger(value, name) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative integer`);
  }
}

/**
 * Raises base to the power of exponent
 * @param {number} base - The base number
 * @param {number} exponent - The exponent
 * @returns {number} base raised to the power of exponent
 */
export function power(base, exponent) {
  validateNumber(base, 'base');
  validateNumber(exponent, 'exponent');
  return Math.pow(base, exponent);
}

/**
 * Calculates the square root of a number
 * @param {number} n - The number to find the square root of
 * @returns {number} The square root of n
 * @throws {RangeError} If n is negative
 */
export function sqrt(n) {
  validateNumber(n, 'n');
  if (n < 0) {
    throw new RangeError('Cannot calculate square root of negative number');
  }
  return Math.sqrt(n);
}

/**
 * Calculates the factorial of a non-negative integer
 * @param {number} n - The non-negative integer
 * @returns {number} The factorial of n (n!)
 * @throws {TypeError} If n is not a non-negative integer
 */
export function factorial(n) {
  validateNonNegativeInteger(n, 'n');
  if (n === 0 || n === 1) {
    return 1;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
