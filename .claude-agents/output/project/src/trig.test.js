import { sin, cos, tan } from './trig.js';

describe('sin function', () => {
  describe('degrees mode (default)', () => {
    test('sin(0) equals 0', () => {
      expect(sin(0)).toBeCloseTo(0);
    });

    test('sin(30) equals 0.5', () => {
      expect(sin(30)).toBeCloseTo(0.5);
    });

    test('sin(90) equals 1', () => {
      expect(sin(90)).toBeCloseTo(1);
    });

    test('sin(180) equals 0', () => {
      expect(sin(180)).toBeCloseTo(0);
    });

    test('sin(270) equals -1', () => {
      expect(sin(270)).toBeCloseTo(-1);
    });

    test('sin(360) equals 0', () => {
      expect(sin(360)).toBeCloseTo(0);
    });
  });

  describe('radians mode', () => {
    test('sin(0) in radians equals 0', () => {
      expect(sin(0, false)).toBeCloseTo(0);
    });

    test('sin(PI/2) in radians equals 1', () => {
      expect(sin(Math.PI / 2, false)).toBeCloseTo(1);
    });

    test('sin(PI) in radians equals 0', () => {
      expect(sin(Math.PI, false)).toBeCloseTo(0);
    });
  });

  describe('validation', () => {
    test('throws TypeError for non-number input', () => {
      expect(() => sin('90')).toThrow(TypeError);
      expect(() => sin('90')).toThrow('angle must be a finite number');
    });

    test('throws TypeError for NaN', () => {
      expect(() => sin(NaN)).toThrow(TypeError);
    });

    test('throws TypeError for Infinity', () => {
      expect(() => sin(Infinity)).toThrow(TypeError);
    });
  });
});

describe('cos function', () => {
  describe('degrees mode (default)', () => {
    test('cos(0) equals 1', () => {
      expect(cos(0)).toBeCloseTo(1);
    });

    test('cos(60) equals 0.5', () => {
      expect(cos(60)).toBeCloseTo(0.5);
    });

    test('cos(90) equals 0', () => {
      expect(cos(90)).toBeCloseTo(0);
    });

    test('cos(180) equals -1', () => {
      expect(cos(180)).toBeCloseTo(-1);
    });

    test('cos(270) equals 0', () => {
      expect(cos(270)).toBeCloseTo(0);
    });

    test('cos(360) equals 1', () => {
      expect(cos(360)).toBeCloseTo(1);
    });
  });

  describe('radians mode', () => {
    test('cos(0) in radians equals 1', () => {
      expect(cos(0, false)).toBeCloseTo(1);
    });

    test('cos(PI/3) in radians equals 0.5', () => {
      expect(cos(Math.PI / 3, false)).toBeCloseTo(0.5);
    });

    test('cos(PI) in radians equals -1', () => {
      expect(cos(Math.PI, false)).toBeCloseTo(-1);
    });
  });

  describe('validation', () => {
    test('throws TypeError for non-number input', () => {
      expect(() => cos(null)).toThrow(TypeError);
    });

    test('throws TypeError for undefined', () => {
      expect(() => cos(undefined)).toThrow(TypeError);
    });
  });
});

describe('tan function', () => {
  describe('degrees mode (default)', () => {
    test('tan(0) equals 0', () => {
      expect(tan(0)).toBeCloseTo(0);
    });

    test('tan(45) equals 1', () => {
      expect(tan(45)).toBeCloseTo(1);
    });

    test('tan(180) equals 0', () => {
      expect(tan(180)).toBeCloseTo(0);
    });

    test('tan(-45) equals -1', () => {
      expect(tan(-45)).toBeCloseTo(-1);
    });
  });

  describe('radians mode', () => {
    test('tan(0) in radians equals 0', () => {
      expect(tan(0, false)).toBeCloseTo(0);
    });

    test('tan(PI/4) in radians equals 1', () => {
      expect(tan(Math.PI / 4, false)).toBeCloseTo(1);
    });

    test('tan(PI) in radians equals 0', () => {
      expect(tan(Math.PI, false)).toBeCloseTo(0);
    });
  });

  describe('undefined angle handling', () => {
    test('throws RangeError at 90 degrees', () => {
      expect(() => tan(90)).toThrow(RangeError);
      expect(() => tan(90)).toThrow('Tangent is undefined at this angle');
    });

    test('throws RangeError at 270 degrees', () => {
      expect(() => tan(270)).toThrow(RangeError);
    });

    test('throws RangeError at -90 degrees', () => {
      expect(() => tan(-90)).toThrow(RangeError);
    });

    test('throws RangeError at PI/2 radians', () => {
      expect(() => tan(Math.PI / 2, false)).toThrow(RangeError);
    });
  });

  describe('validation', () => {
    test('throws TypeError for string input', () => {
      expect(() => tan('45')).toThrow(TypeError);
    });

    test('throws TypeError for object input', () => {
      expect(() => tan({})).toThrow(TypeError);
    });
  });
});
