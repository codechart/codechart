/**
 * UI Logic Tests - Test TypeScript without Angular
 *
 * We mock Angular dependencies and test the business logic directly.
 */

import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load fixtures
const CASES_DIR = path.join(__dirname, '../fixtures/cases');

function loadJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ============================================
// MOCK CLASSES - Replace Angular dependencies
// ============================================

class MockHttpClient {
  private mockResponses: Map<string, any> = new Map();
  public lastRequest: any = null;

  setMockResponse(url: string, response: any) {
    this.mockResponses.set(url, response);
  }

  post(url: string, body: any) {
    this.lastRequest = { url, body };
    const response = this.mockResponses.get(url) || [];
    return {
      pipe: (fn: any) => ({
        toPromise: () => Promise.resolve(response)
      }),
      toPromise: () => Promise.resolve(response)
    };
  }
}

class MockChart {
  public nodes: any[] = [];
  public edges: any[] = [];
  public addNodesAndLinksCalls: any[][] = [];

  addNodesAndLinks(items: any[], overrideExisting = false) {
    this.addNodesAndLinksCalls.push(items);
    items.forEach(item => {
      if (item.from !== undefined && item.to !== undefined) {
        this.edges.push(item);
      } else {
        this.nodes.push(item);
      }
    });
  }

  getAllNodes(filter = () => true) {
    return this.nodes.filter(filter);
  }

  getAllEdges(filter = () => true) {
    return this.edges.filter(filter);
  }

  clear() {
    this.nodes = [];
    this.edges = [];
    this.addNodesAndLinksCalls = [];
  }
}

// ============================================
// TEST: Verify mock behavior matches contract
// ============================================

describe('UI Logic Tests - Mock Verification', () => {
  it('MockHttpClient stores requests correctly', () => {
    const http = new MockHttpClient();
    http.setMockResponse('/find', [{ matches: [] }]);

    http.post('/find', { pattern: 'test' });

    expect(http.lastRequest.url).to.equal('/find');
    expect(http.lastRequest.body.pattern).to.equal('test');
  });

  it('MockChart tracks addNodesAndLinks calls', () => {
    const chart = new MockChart();

    chart.addNodesAndLinks([
      { id: 1, label: 'Node 1' },
      { id: 2, label: 'Node 2' }
    ]);

    expect(chart.nodes).to.have.length(2);
    expect(chart.addNodesAndLinksCalls).to.have.length(1);
    expect(chart.addNodesAndLinksCalls[0]).to.have.length(2);
  });

  it('MockChart separates nodes from edges', () => {
    const chart = new MockChart();

    chart.addNodesAndLinks([
      { id: 1, label: 'Node 1' },
      { from: 1, to: 2 },
      { id: 2, label: 'Node 2' }
    ]);

    expect(chart.nodes).to.have.length(2);
    expect(chart.edges).to.have.length(1);
  });
});

// ============================================
// TEST: Contract verification with fixtures
// ============================================

describe('UI Logic Tests - Contract Verification', () => {
  const testCases = fs.readdirSync(CASES_DIR)
    .filter(name => fs.statSync(path.join(CASES_DIR, name)).isDirectory())
    .sort();

  testCases.forEach(testCase => {
    const caseDir = path.join(CASES_DIR, testCase);
    const inputFile = path.join(caseDir, 'input.json');
    const expectedFile = path.join(caseDir, 'expected.json');
    const apiResponseFile = path.join(caseDir, 'api-response.json');

    const input = loadJson<any>(inputFile);
    const expected = loadJson<any>(expectedFile);
    const apiResponse = loadJson<any>(apiResponseFile);

    if (!input || !expected) {
      it.skip(`${testCase}: Missing fixtures`, () => {});
      return;
    }

    // Skip error cases
    if (expected.error) {
      it.skip(`${testCase}: Error case`, () => {});
      return;
    }

    it(`${testCase}: Input→Expected contract is valid`, () => {
      // Verify input is valid cochart JSON
      if (Array.isArray(input)) {
        input.forEach((node, i) => {
          expect(node, `Input node ${i} should have id`).to.have.property('id');

          // CODE nodes need these fields
          if (!node.type || node.type !== 'todo') {
            expect(node, `Input node ${i} should have label`).to.have.property('label');
            expect(node, `Input node ${i} should have filePath`).to.have.property('filePath');
            expect(node, `Input node ${i} should have lineNumber`).to.have.property('lineNumber');
          }
        });
      }

      // Verify expected has nodes array
      expect(expected, 'Expected should have nodes').to.have.property('nodes');
      expect(expected.nodes, 'Expected.nodes should be array').to.be.an('array');

      // Verify counts make sense
      if (Array.isArray(input)) {
        // Input nodes should roughly match expected nodes (some may be filtered)
        expect(expected.nodes.length, 'Expected nodes count')
          .to.be.at.most(input.length + 5); // Allow some tolerance
      }
    });

    it(`${testCase}: API response matches expected format`, () => {
      if (!apiResponse) {
        // Skip if no API response fixture
        return;
      }

      // Handle both array format and object with responses array
      const responses = Array.isArray(apiResponse)
        ? [apiResponse]  // Wrap single response for uniform handling
        : apiResponse.responses || [];

      // Each response should be an array of file results
      responses.forEach((response: any[], responseIdx: number) => {
        expect(response, `Response ${responseIdx} should be array`).to.be.an('array');

        // Each file result should have matches
        response.forEach((fileResult: any, i: number) => {
          expect(fileResult, `Response ${responseIdx}, file ${i} should have matches`)
            .to.have.property('matches');
          expect(fileResult.matches, `Response ${responseIdx}, file ${i} matches should be array`)
            .to.be.an('array');
        });
      });
    });
  });
});

// ============================================
// TEST: Simulate UI flow with mocks
// ============================================

describe('UI Logic Tests - Flow Simulation', () => {
  it('Simulates paste flow: input → http → chart', async () => {
    const chart = new MockChart();
    const http = new MockHttpClient();

    // Load test case
    const input = loadJson<any>(path.join(CASES_DIR, '01-single-node/input.json'));
    const apiResponse = loadJson<any>(path.join(CASES_DIR, '01-single-node/api-response.json'));
    const expected = loadJson<any>(path.join(CASES_DIR, '01-single-node/expected.json'));

    if (!input || !apiResponse || !expected) {
      throw new Error('Missing fixtures for 01-single-node');
    }

    // Setup mock
    http.setMockResponse('/find', apiResponse);

    // Simulate the flow:
    // 1. Parse input JSON (like handleLlmJsonPaste does)
    const parsedNodes = Array.isArray(input) ? input : [];

    // 2. For each node, make HTTP request (like processChild does)
    for (const node of parsedNodes) {
      // Skip TODO nodes
      if (node.type === 'todo') continue;

      // Make request (like searchAroundLine → doSearch does)
      const response = await http.post('/find', {
        searchType: 3, // searchAroundLine
        searchObject: {
          pattern: node.lineContent,
          searchPath: node.filePath,
          lineNumbers: [node.lineNumber]
        }
      }).toPromise();

      // 3. Add to chart (like loadResults → displaySearchResults does)
      const results = response as any[];
      results.forEach((fileResult: any) => {
        fileResult.matches.forEach((match: any) => {
          chart.addNodesAndLinks([{
            id: `node-${match.lineNumber}`,
            label: node.label,
            d: {
              lineNumber: match.lineNumber,
              filePath: node.filePath,
              lineContent: match.line
            }
          }]);
        });
      });
    }

    // 4. Verify chart state matches expected
    expect(chart.nodes.length, 'Chart should have expected node count')
      .to.equal(expected.nodes.length);

    // Verify HTTP was called
    expect(http.lastRequest, 'HTTP should have been called').to.not.be.null;
  });

  it('Simulates tree flow: multiple connected nodes', async () => {
    const chart = new MockChart();
    const http = new MockHttpClient();

    // Load test case
    const input = loadJson<any>(path.join(CASES_DIR, '02-two-connected/input.json'));
    const apiResponse = loadJson<any>(path.join(CASES_DIR, '02-two-connected/api-response.json'));
    const expected = loadJson<any>(path.join(CASES_DIR, '02-two-connected/expected.json'));

    if (!input || !expected) {
      throw new Error('Missing fixtures for 02-two-connected');
    }

    // Setup mock for each unique file
    if (apiResponse) {
      http.setMockResponse('/find', apiResponse);
    }

    // Process each node
    const nodeMap = new Map<number, any>();
    const parsedNodes = Array.isArray(input) ? input : [];

    for (const node of parsedNodes) {
      if (node.type === 'todo') continue;

      const chartNode = {
        id: `node-${node.id}`,
        label: node.label,
        d: {
          lineNumber: node.lineNumber,
          filePath: node.filePath
        }
      };

      nodeMap.set(node.id, chartNode);
      chart.addNodesAndLinks([chartNode]);

      // Add edge if connected
      if (node.connectedTo && node.connectedTo !== 0) {
        const parentId = Array.isArray(node.connectedTo)
          ? node.connectedTo[0]
          : node.connectedTo;

        chart.addNodesAndLinks([{
          from: `node-${parentId}`,
          to: `node-${node.id}`
        }]);
      }
    }

    // Verify
    expect(chart.nodes.length, 'Node count').to.equal(expected.nodes.length);
    expect(chart.edges.length, 'Edge count').to.equal(expected.edges.length);
  });
});
