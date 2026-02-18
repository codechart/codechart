/**
 * Test suite for utils.js
 * Tests round, clamp, and lerp functions
 */

import { round, clamp, lerp } from './utils.js';

describe('round', () => {
  describe('integer rounding (decimals=0)', () => {
    test('rounds 2.5 to 3 (standard rounding)', () => {
      expect(round(2.5, 0)).toBe(3);
    });

    test('rounds 2.4 to 2', () => {
      expect(round(2.4, 0)).toBe(2);
    });

    test('rounds 2.6 to 3', () => {
      expect(round(2.6, 0)).toBe(3);
    });

    test('rounds negative numbers correctly (-2.5 should round to -2)', () => {
      expect(round(-2.5, 0)).toBe(-2);
    });
  });

  describe('decimal rounding', () => {
    test('rounds to 1 decimal place', () => {
      expect(round(3.14159, 1)).toBe(3.1);
    });

    test('rounds 3.15 to 1 decimal (should be 3.2)', () => {
      expect(round(3.15, 1)).toBe(3.2);
    });

    test('rounds to 2 decimal places', () => {
      expect(round(3.14159, 2)).toBe(3.14);
    });
  });

  describe('edge cases', () => {
    test('handles zero', () => {
      expect(round(0, 0)).toBe(0);
    });
  });
});

describe('clamp', () => {
  describe('value within range', () => {
    test('returns value when within bounds', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    test('returns value at lower bound', () => {
      expect(clamp(0, 0, 10)).toBe(0);
    });

    test('returns value at upper bound', () => {
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('value outside range', () => {
    test('clamps to min when value is below', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    test('clamps to max when value is above', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('edge cases', () => {
    test('works with negative range', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
    });

    test('throws error when min > max', () => {
      expect(() => clamp(5, 10, 0)).toThrow('min cannot be greater than max');
    });
  });
});

describe('lerp', () => {
  describe('basic interpolation', () => {
    test('returns start when t=0', () => {
      expect(lerp(0, 10, 0)).toBe(0);
    });

    test('returns end when t=1', () => {
      expect(lerp(0, 10, 1)).toBe(10);
    });

    test('returns midpoint when t=0.5', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
    });

    test('interpolates at t=0.25', () => {
      expect(lerp(0, 100, 0.25)).toBe(25);
    });
  });

  describe('edge cases', () => {
    test('works with negative values', () => {
      expect(lerp(-10, 10, 0.5)).toBe(0);
    });

    test('extrapolates when t > 1', () => {
      expect(lerp(0, 10, 2)).toBe(20);
    });

    test('extrapolates when t < 0', () => {
      expect(lerp(0, 10, -0.5)).toBe(-5);
    });
  });
});
