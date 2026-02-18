import { power, sqrt, factorial } from './advanced.js';
import { fibonacci, isPrime, gcd } from '../advanced.js';

describe('power function', () => {
  test('calculates positive integer exponents', () => {
    expect(power(2, 3)).toBe(8);
    expect(power(5, 2)).toBe(25);
  });

  test('calculates power of zero exponent', () => {
    expect(power(10, 0)).toBe(1);
    expect(power(0, 0)).toBe(1);
  });

  test('calculates negative exponents', () => {
    expect(power(2, -1)).toBe(0.5);
    expect(power(4, -2)).toBe(0.0625);
  });

  test('calculates fractional exponents', () => {
    expect(power(4, 0.5)).toBe(2);
    expect(power(27, 1/3)).toBeCloseTo(3, 10);
  });

  test('throws TypeError for non-number input', () => {
    expect(() => power('2', 3)).toThrow(TypeError);
    expect(() => power(2, null)).toThrow(TypeError);
    expect(() => power(Infinity, 2)).toThrow(TypeError);
  });
});

describe('sqrt function', () => {
  test('calculates square root of perfect squares', () => {
    expect(sqrt(4)).toBe(2);
    expect(sqrt(9)).toBe(3);
    expect(sqrt(100)).toBe(10);
  });

  test('calculates square root of non-perfect squares', () => {
    expect(sqrt(2)).toBeCloseTo(1.414, 3);
    expect(sqrt(5)).toBeCloseTo(2.236, 3);
  });

  test('calculates square root of zero', () => {
    expect(sqrt(0)).toBe(0);
  });

  test('throws RangeError for negative numbers', () => {
    expect(() => sqrt(-1)).toThrow(RangeError);
    expect(() => sqrt(-100)).toThrow('Cannot calculate square root of negative number');
  });

  test('throws TypeError for non-number input', () => {
    expect(() => sqrt('4')).toThrow(TypeError);
    expect(() => sqrt(NaN)).toThrow(TypeError);
  });
});

describe('factorial function', () => {
  test('calculates factorial of small numbers', () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
    expect(factorial(5)).toBe(120);
    expect(factorial(10)).toBe(3628800);
  });

  test('calculates factorial of larger numbers', () => {
    expect(factorial(12)).toBe(479001600);
    expect(factorial(20)).toBe(2432902008176640000);
  });

  test('throws TypeError for negative numbers', () => {
    expect(() => factorial(-1)).toThrow(TypeError);
    expect(() => factorial(-5)).toThrow(TypeError);
  });

  test('throws TypeError for non-integers', () => {
    expect(() => factorial(3.5)).toThrow(TypeError);
    expect(() => factorial(1.1)).toThrow(TypeError);
  });

  test('throws TypeError for non-number input', () => {
    expect(() => factorial('5')).toThrow(TypeError);
    expect(() => factorial(null)).toThrow(TypeError);
  });
});

describe('fibonacci function', () => {
  test('returns correct values for base cases', () => {
    expect(fibonacci(0)).toBe(0);
    expect(fibonacci(1)).toBe(1);
  });

  test('calculates Fibonacci sequence correctly', () => {
    expect(fibonacci(2)).toBe(1);
    expect(fibonacci(3)).toBe(2);
    expect(fibonacci(4)).toBe(3);
    expect(fibonacci(5)).toBe(5);
    expect(fibonacci(6)).toBe(8);
    expect(fibonacci(10)).toBe(55);
  });

  test('calculates larger Fibonacci numbers', () => {
    expect(fibonacci(20)).toBe(6765);
    expect(fibonacci(30)).toBe(832040);
  });

  test('returns NaN for negative input', () => {
    expect(fibonacci(-1)).toBeNaN();
    expect(fibonacci(-10)).toBeNaN();
  });
});

describe('isPrime function', () => {
  test('returns false for numbers less than 2', () => {
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(-5)).toBe(false);
  });

  test('returns true for prime numbers', () => {
    expect(isPrime(2)).toBe(true);
    expect(isPrime(3)).toBe(true);
    expect(isPrime(5)).toBe(true);
    expect(isPrime(7)).toBe(true);
    expect(isPrime(11)).toBe(true);
    expect(isPrime(13)).toBe(true);
    expect(isPrime(97)).toBe(true);
  });

  test('returns false for composite numbers', () => {
    expect(isPrime(4)).toBe(false);
    expect(isPrime(6)).toBe(false);
    expect(isPrime(9)).toBe(false);
    expect(isPrime(15)).toBe(false);
    expect(isPrime(100)).toBe(false);
  });

  test('handles larger prime numbers', () => {
    expect(isPrime(101)).toBe(true);
    expect(isPrime(997)).toBe(true);
  });
});

describe('gcd function', () => {
  test('calculates GCD of two positive numbers', () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(48, 18)).toBe(6);
    expect(gcd(100, 25)).toBe(25);
  });

  test('calculates GCD when one number is zero', () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(7, 0)).toBe(7);
  });

  test('calculates GCD of coprime numbers', () => {
    expect(gcd(17, 23)).toBe(1);
    expect(gcd(13, 7)).toBe(1);
  });

  test('handles negative numbers', () => {
    expect(gcd(-12, 18)).toBe(6);
    expect(gcd(12, -18)).toBe(6);
    expect(gcd(-12, -18)).toBe(6);
  });

  test('handles equal numbers', () => {
    expect(gcd(5, 5)).toBe(5);
    expect(gcd(100, 100)).toBe(100);
  });
});
