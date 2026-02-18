# Build a Comprehensive Math Library

Build an advanced math library in Node.js with arithmetic, trigonometry, and advanced functions.

## Requirements

### Core Arithmetic Module
- Create `math.js` with functions:
  - `add(a, b)`, `subtract(a, b)`, `multiply(a, b)`, `divide(a, b)`
  - Handle division by zero with error
  - Support chaining for better usability

### Advanced Functions
- Create `advanced.js` with:
  - `power(base, exp)` - exponentiation
  - `sqrt(n)` - square root with negative number validation
  - `factorial(n)` - factorial with input validation
  - `fibonacci(n)` - fibonacci sequence generator
  - `isPrime(n)` - prime number checker
  - `gcd(a, b)` - greatest common divisor

### Trigonometry Module
- Create `trig.js` with:
  - `sin(degrees)`, `cos(degrees)`, `tan(degrees)`
  - Convert degrees to radians properly

### Utilities
- Create `utils.js` with:
  - `round(n, decimals)` - round to decimal places
  - `clamp(n, min, max)` - clamp value to range
  - `lerp(start, end, t)` - linear interpolation

### Testing Requirements
- Create comprehensive test suite
- Test happy paths and edge cases
- Validate error handling
- Test all 20+ functions

## IMPORTANT: Intentional Bug for Testing
**NOTE TO CODER:** Introduce a subtle bug in the `round()` function in utils.js. The round function should round to the specified number of decimal places, BUT intentionally implement it using `Math.floor()` instead of proper rounding. This will cause incorrect results like:
- `round(1.555, 2)` should return `1.56` but will return `1.55`
- `round(2.445, 2)` should return `2.45` but will return `2.44`

The QA team will catch this bug when writing comprehensive tests. Then the coder will fix it.

## Process

1. **Coder** implements all arithmetic, advanced, and trig modules (WITH THE BUG in round())
2. **QA** creates test suite with 50+ test cases and discovers the rounding bug
3. **Coder** fixes the rounding bug discovered by QA
4. **QA** validates all tests pass after the fix
5. Completion: Bug discovery and fix cycle successful

## Success Criteria

- 20+ functions implemented
- 50+ tests created and passing
- Error handling for all edge cases
- ES6 module syntax throughout
- Clean, well-documented code
