import { add, subtract, multiply, divide, Calculator, chain } from './math.js';

describe('add function', () => {
  test('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('adds negative numbers', () => {
    expect(add(-5, -3)).toBe(-8);
  });

  test('adds zero', () => {
    expect(add(10, 0)).toBe(10);
  });

  test('throws TypeError for non-number input', () => {
    expect(() => add('5', 3)).toThrow(TypeError);
    expect(() => add(5, null)).toThrow(TypeError);
  });
});

describe('subtract function', () => {
  test('subtracts two positive numbers', () => {
    expect(subtract(10, 4)).toBe(6);
  });

  test('subtracts to negative result', () => {
    expect(subtract(3, 7)).toBe(-4);
  });

  test('throws TypeError for invalid input', () => {
    expect(() => subtract(undefined, 3)).toThrow(TypeError);
  });
});

describe('multiply function', () => {
  test('multiplies two positive numbers', () => {
    expect(multiply(4, 5)).toBe(20);
  });

  test('multiplies by zero', () => {
    expect(multiply(100, 0)).toBe(0);
  });

  test('multiplies negative numbers', () => {
    expect(multiply(-3, -4)).toBe(12);
  });

  test('throws TypeError for NaN', () => {
    expect(() => multiply(NaN, 5)).toThrow(TypeError);
  });
});

describe('divide function', () => {
  test('divides two numbers', () => {
    expect(divide(20, 4)).toBe(5);
  });

  test('divides with decimal result', () => {
    expect(divide(7, 2)).toBe(3.5);
  });

  test('throws RangeError for division by zero', () => {
    expect(() => divide(10, 0)).toThrow(RangeError);
    expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
  });

  test('throws TypeError for Infinity', () => {
    expect(() => divide(Infinity, 2)).toThrow(TypeError);
  });
});

describe('Calculator class', () => {
  test('initializes with default value of 0', () => {
    const calc = new Calculator();
    expect(calc.value).toBe(0);
  });

  test('initializes with custom value', () => {
    const calc = new Calculator(10);
    expect(calc.value).toBe(10);
  });

  test('chains add operations', () => {
    const calc = new Calculator(5);
    calc.add(3).add(2);
    expect(calc.value).toBe(10);
  });

  test('chains subtract operations', () => {
    const calc = new Calculator(20);
    calc.subtract(5).subtract(3);
    expect(calc.value).toBe(12);
  });

  test('chains multiply operations', () => {
    const calc = new Calculator(2);
    calc.multiply(3).multiply(4);
    expect(calc.value).toBe(24);
  });

  test('chains divide operations', () => {
    const calc = new Calculator(100);
    calc.divide(2).divide(5);
    expect(calc.value).toBe(10);
  });

  test('chains mixed operations', () => {
    const calc = new Calculator(10);
    const result = calc.add(5).multiply(2).subtract(10).divide(5);
    expect(result.value).toBe(4);
  });

  test('reset changes value', () => {
    const calc = new Calculator(50);
    calc.reset(100);
    expect(calc.value).toBe(100);
  });

  test('reset defaults to zero', () => {
    const calc = new Calculator(50);
    calc.reset();
    expect(calc.value).toBe(0);
  });

  test('throws TypeError for invalid initial value', () => {
    expect(() => new Calculator('10')).toThrow(TypeError);
  });
});

describe('chain factory function', () => {
  test('creates Calculator with default value', () => {
    const calc = chain();
    expect(calc.value).toBe(0);
  });

  test('creates Calculator with custom value', () => {
    const calc = chain(25);
    expect(calc.value).toBe(25);
  });

  test('supports full method chaining', () => {
    const result = chain(10).add(5).multiply(2).subtract(5).divide(5).value;
    expect(result).toBe(5);
  });
});
