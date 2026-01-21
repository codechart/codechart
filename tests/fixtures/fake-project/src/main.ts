// Main application entry point
// This file contains the core functions

import { helper, formatOutput } from './utils';

export function mainFunction() {
  const x = 1;
  const y = 2;
  return helper(x) + helper(y);
}

export function secondFunction(input: string) {
  const processed = input.toUpperCase();
  return formatOutput(processed);
}

export function thirdFunction() {
  return mainFunction() + 100;
}

export class MainClass {
  private value: number;

  constructor(initial: number) {
    this.value = initial;
  }

  calculate() {
    return this.value * 2;
  }

  process(input: string) {
    return secondFunction(input);
  }
}
