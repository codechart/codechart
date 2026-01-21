/**
 * E2E Tests for Cochart Diagram Creation
 *
 * Tests the full flow from input (paste/search/IDE click) to canvas output.
 * Uses Playwright to control the browser and read chart state.
 *
 * Prerequisites:
 *   - UI running on localhost:4200 (or APP_URL env var)
 *   - API running on localhost:2900
 *   - Project path set to fake-project fixture
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const CASES_DIR = path.join(__dirname, '../fixtures/cases');
const PROJECT_PATH = path.join(__dirname, '../fixtures/fake-project');

interface ExpectedNode {
  label: string;
  filePath?: string;
  lineNumber?: number;
  type?: string;
}

interface ExpectedEdge {
  from: number | string;
  to: number | string;
}

interface Expected {
  nodes: ExpectedNode[];
  edges: ExpectedEdge[];
  error?: string;
}

interface ActualNode {
  id: string | number;
  label: string;
  lineNumber?: number;
  filePath?: string;
  type?: string;
}

interface ActualEdge {
  from: string | number;
  to: string | number;
}

// Get all test case directories
function getTestCases(): string[] {
  return fs.readdirSync(CASES_DIR)
    .filter(name => fs.statSync(path.join(CASES_DIR, name)).isDirectory())
    .sort();
}

// Load JSON file
function loadJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Setup: Set project path to fake-project
async function setupProjectPath(page: Page): Promise<void> {
  await page.evaluate((projectPath) => {
    const app = (window as any).app;
    if (app?.searchManagement?.searchObject) {
      app.searchManagement.searchObject.projectPath = projectPath;
    }
  }, PROJECT_PATH);
}

// Get all nodes from chart
async function getChartNodes(page: Page): Promise<ActualNode[]> {
  return page.evaluate(() => {
    const app = (window as any).app;
    if (!app?.chart?.getAllNodes) return [];

    return app.chart.getAllNodes(() => true).map((n: any) => ({
      id: n.id,
      label: n.label,
      lineNumber: n.d?.lineNumber,
      filePath: n.d?.filePath,
      type: n.d?.type
    }));
  });
}

// Get all edges from chart
async function getChartEdges(page: Page): Promise<ActualEdge[]> {
  return page.evaluate(() => {
    const app = (window as any).app;
    if (!app?.chart?.getAllEdges) return [];

    return app.chart.getAllEdges(() => true).map((e: any) => ({
      from: e.from,
      to: e.to
    }));
  });
}

// Paste JSON into the app
async function pasteJson(page: Page, json: string): Promise<void> {
  await page.evaluate((jsonStr) => {
    const app = (window as any).app;
    if (app?.handleLlmJsonPaste) {
      app.handleLlmJsonPaste(jsonStr);
    }
  }, json);
}

// Wait for async operations to complete
async function waitForChartUpdate(page: Page, expectedNodes: number): Promise<void> {
  await page.waitForFunction(
    (count) => {
      const app = (window as any).app;
      if (!app?.chart?.getAllNodes) return false;
      return app.chart.getAllNodes(() => true).length >= count;
    },
    expectedNodes,
    { timeout: 10000 }
  );
}

// Compare nodes (flexible matching)
function compareNodes(actual: ActualNode[], expected: ExpectedNode[]): void {
  expect(actual.length, 'Node count mismatch').toBe(expected.length);

  expected.forEach((expectedNode, i) => {
    const actualNode = actual.find(n =>
      n.label === expectedNode.label ||
      n.label?.includes(expectedNode.label)
    );

    expect(actualNode, `Node not found: ${expectedNode.label}`).toBeDefined();

    if (expectedNode.lineNumber !== undefined) {
      expect(actualNode!.lineNumber, `Line number mismatch for ${expectedNode.label}`)
        .toBe(expectedNode.lineNumber);
    }

    if (expectedNode.filePath !== undefined) {
      expect(actualNode!.filePath, `File path mismatch for ${expectedNode.label}`)
        .toContain(expectedNode.filePath);
    }

    if (expectedNode.type !== undefined) {
      expect(actualNode!.type, `Type mismatch for ${expectedNode.label}`)
        .toBe(expectedNode.type);
    }
  });
}

// Compare edges
function compareEdges(actual: ActualEdge[], expected: ExpectedEdge[]): void {
  expect(actual.length, 'Edge count mismatch').toBe(expected.length);
  // Note: Edge comparison is tricky since IDs may differ
  // We just verify count for now
}

test.describe('E2E Diagram Tests', () => {
  const testCases = getTestCases();

  testCases.forEach(testCase => {
    const caseDir = path.join(CASES_DIR, testCase);
    const inputFile = path.join(caseDir, 'input.json');
    const expectedFile = path.join(caseDir, 'expected.json');

    const input = loadJson<any>(inputFile);
    const expected = loadJson<Expected>(expectedFile);

    if (!input || !expected) {
      test.skip(`${testCase}: Missing fixtures`, () => {});
      return;
    }

    // Skip non-paste tests for now (IDE click, search, load-saved need different handling)
    if (input.type && input.type !== 'paste') {
      test.skip(`${testCase}: Non-paste test (${input.type})`, () => {});
      return;
    }

    // Skip error cases
    if (expected.error) {
      test.skip(`${testCase}: Error case`, () => {});
      return;
    }

    test(`${testCase}: Creates correct diagram`, async ({ page }) => {
      // Navigate to app
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Setup project path
      await setupProjectPath(page);

      // Clear existing chart
      await page.evaluate(() => {
        const app = (window as any).app;
        if (app?.chart?.clear) {
          app.chart.clear();
        }
      });

      // Paste input JSON
      const inputJson = Array.isArray(input) ? JSON.stringify(input) : JSON.stringify(input);
      await pasteJson(page, inputJson);

      // Wait for chart to update
      await waitForChartUpdate(page, expected.nodes.length);

      // Give a bit more time for edges
      await page.waitForTimeout(500);

      // Get actual chart state
      const actualNodes = await getChartNodes(page);
      const actualEdges = await getChartEdges(page);

      // Compare
      compareNodes(actualNodes, expected.nodes);
      compareEdges(actualEdges, expected.edges);
    });
  });
});

test.describe('E2E Error Handling', () => {
  test('Shows error for invalid JSON', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      const app = (window as any).app;
      if (app?.handleLlmJsonPaste) {
        app.handleLlmJsonPaste('{ invalid json }');
      }
    });

    // Should not crash, nodes should be empty or show error
    const nodes = await getChartNodes(page);
    expect(nodes.length).toBe(0);
  });

  test('App loads without errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that app object exists
    const hasApp = await page.evaluate(() => {
      return !!(window as any).app;
    });

    expect(hasApp).toBe(true);
  });
});
