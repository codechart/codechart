// Advanced mathematical functions

/**
 * Calculate the nth Fibonacci number
 * @param {number} n - The position in the Fibonacci sequence (0-indexed)
 * @returns {number} The nth Fibonacci number
 */
export function fibonacci(n) {
  if (n < 0) return NaN;
  if (n === 0) return 0;
  if (n === 1) return 1;

  let prev = 0;
  let curr = 1;
  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
}

/**
 * Check if a number is prime
 * @param {number} n - The number to check
 * @returns {boolean} True if the number is prime, false otherwise
 */
export function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;

  const sqrt = Math.sqrt(n);
  for (let i = 3; i <= sqrt; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * Calculate the greatest common divisor of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The greatest common divisor
 */
export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);

  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}
