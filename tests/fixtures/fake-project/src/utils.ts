// Utility functions

export function helper(n: number): number {
  return n * 2;
}

export function formatOutput(text: string): string {
  return `[OUTPUT] ${text}`;
}

export function validateInput(input: unknown): boolean {
  if (typeof input === 'string') {
    return input.length > 0;
  }
  if (typeof input === 'number') {
    return !isNaN(input);
  }
  return false;
}

export const CONFIG = {
  maxRetries: 3,
  timeout: 5000,
  debug: false
};
