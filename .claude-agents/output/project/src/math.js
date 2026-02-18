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
 * Adds two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
export function add(a, b) {
  validateNumber(a, 'a');
  validateNumber(b, 'b');
  return a + b;
}

/**
 * Subtracts second number from first
 * @param {number} a - Number to subtract from
 * @param {number} b - Number to subtract
 * @returns {number} Difference of a and b
 */
export function subtract(a, b) {
  validateNumber(a, 'a');
  validateNumber(b, 'b');
  return a - b;
}

/**
 * Multiplies two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Product of a and b
 */
export function multiply(a, b) {
  validateNumber(a, 'a');
  validateNumber(b, 'b');
  return a * b;
}

/**
 * Divides first number by second
 * @param {number} a - Dividend
 * @param {number} b - Divisor
 * @returns {number} Quotient of a and b
 * @throws {RangeError} If divisor is zero
 */
export function divide(a, b) {
  validateNumber(a, 'a');
  validateNumber(b, 'b');
  if (b === 0) {
    throw new RangeError('Cannot divide by zero');
  }
  return a / b;
}

/**
 * Chainable calculator class for fluent math operations
 */
export class Calculator {
  constructor(value = 0) {
    validateNumber(value, 'initial value');
    this._value = value;
  }

  get value() {
    return this._value;
  }

  add(n) {
    this._value = add(this._value, n);
    return this;
  }

  subtract(n) {
    this._value = subtract(this._value, n);
    return this;
  }

  multiply(n) {
    this._value = multiply(this._value, n);
    return this;
  }

  divide(n) {
    this._value = divide(this._value, n);
    return this;
  }

  reset(value = 0) {
    validateNumber(value, 'reset value');
    this._value = value;
    return this;
  }
}

/**
 * Creates a new chainable calculator starting with the given value
 * @param {number} value - Starting value
 * @returns {Calculator} Chainable calculator instance
 */
export function chain(value = 0) {
  return new Calculator(value);
}
