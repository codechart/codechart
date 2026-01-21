// Deeply nested module

import { helper } from '../utils';

export function deepFunction(value: number) {
  const doubled = helper(value);
  return doubled + 10;
}

export function anotherDeepFunction() {
  return deepFunction(5);
}

export class DeepClass {
  run() {
    return anotherDeepFunction();
  }
}
