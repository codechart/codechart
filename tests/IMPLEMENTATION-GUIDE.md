# Test Implementation Guide for Claude

Instructions for implementing E2E tests for Cochart diagram creation.

## Goal

Test that diagrams are created correctly: given an input (paste/search/IDE click), verify the canvas shows expected nodes and edges.

## Environment Constraints

- UI (Angular 4) needs Node 14
- API (Node.js) needs Node 20
- Dockerfile has both configured
- Playwright available for E2E

## Folder Structure to Create

```
tests/
├── README.md
├── fixtures/
│   ├── fake-project/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── utils.ts
│   │   │   └── nested/deep.ts
│   │   └── package.json
│   └── cases/
│       ├── 01-single-node/
│       │   ├── input.json
│       │   ├── api-request.json
│       │   ├── api-response.json
│       │   └── expected.json
│       ├── 02-two-connected/
│       ├── 03-code-plus-todo/
│       ├── 04-tree-structure/
│       ├── 05-convergence/
│       ├── 06-ide-click/
│       ├── 07-search-text/
│       ├── 08-search-around-line/
│       ├── 09-load-saved/
│       ├── 10-invalid-path/
│       ├── 11-fuzzy-match/
│       └── 12-nested-tree/
├── api/
│   ├── search.test.ts
│   └── package.json
├── ui/
│   ├── paste-flow.test.ts
│   └── package.json
└── e2e/
    ├── playwright.config.ts
    ├── diagram.spec.ts
    └── package.json
```

## Step-by-Step Implementation

### Step 1: Create fake-project Fixture

Create a small codebase with KNOWN content at KNOWN line numbers.

**fake-project/src/main.ts:**
```typescript
// Line 1: Comment
// Line 2: Empty
import { helper } from './utils';    // Line 3

export function mainFunction() {     // Line 5
  const x = 1;                       // Line 6
  return helper(x);                  // Line 7
}

export function secondFunction() {   // Line 10
  return 'test';                     // Line 11
}
```

**fake-project/src/utils.ts:**
```typescript
export function helper(n: number) {  // Line 1
  return n * 2;                      // Line 2
}
```

### Step 2: Create Test Case Fixtures

For each test case, create 4 files:

**Example: 01-single-node/**

`input.json` - What gets pasted:
```json
[
  {
    "id": 1,
    "label": "main function",
    "filePath": "src/main.ts",
    "lineNumber": 5,
    "lineContent": "export function mainFunction() {",
    "connectedTo": 0
  }
]
```

`api-request.json` - Expected HTTP request to /find:
```json
{
  "projectPath": "tests/fixtures/fake-project",
  "filePath": "src/main.ts",
  "lineNumbers": [5],
  "pattern": "export function mainFunction() {",
  "searchType": "searchAroundLine"
}
```

`api-response.json` - What API should return:
```json
[
  {
    "fullLocalPath": "tests/fixtures/fake-project/src/main.ts",
    "matches": [
      {
        "lineNumber": 5,
        "lineContent": "export function mainFunction() {",
        "startContentLine": 5,
        "endContentLine": 8
      }
    ]
  }
]
```

`expected.json` - Expected nodes/edges on canvas:
```json
{
  "nodes": [
    {
      "label": "main function",
      "filePath": "src/main.ts",
      "lineNumber": 5
    }
  ],
  "edges": []
}
```

### Step 3: Implement API Tests

**tests/api/search.test.ts:**
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'mocha';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

const API_URL = 'http://localhost:2900';
const CASES_DIR = path.join(__dirname, '../fixtures/cases');

// Get all test case directories
const testCases = fs.readdirSync(CASES_DIR);

describe('API Search Tests', () => {
  testCases.forEach(testCase => {
    const caseDir = path.join(CASES_DIR, testCase);

    // Skip if not a directory or missing files
    if (!fs.statSync(caseDir).isDirectory()) return;
    const requestFile = path.join(caseDir, 'api-request.json');
    const responseFile = path.join(caseDir, 'api-response.json');
    if (!fs.existsSync(requestFile) || !fs.existsSync(responseFile)) return;

    it(`${testCase}: API returns expected response`, async () => {
      const request = JSON.parse(fs.readFileSync(requestFile, 'utf-8'));
      const expectedResponse = JSON.parse(fs.readFileSync(responseFile, 'utf-8'));

      const response = await fetch(`${API_URL}/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const actual = await response.json();

      // Compare matches (ignore extra fields)
      expect(actual.length).to.equal(expectedResponse.length);
      actual.forEach((file, i) => {
        expect(file.matches.length).to.equal(expectedResponse[i].matches.length);
        file.matches.forEach((match, j) => {
          expect(match.lineNumber).to.equal(expectedResponse[i].matches[j].lineNumber);
          expect(match.lineContent).to.contain(expectedResponse[i].matches[j].lineContent);
        });
      });
    });
  });
});
```

### Step 4: Implement UI Logic Tests

**tests/ui/paste-flow.test.ts:**
```typescript
// This test runs the REAL UI services, only mocking HTTP

import { SearchActions } from '../../packages/ui/src/app/search/search.actions';
import { LlmJsonActions } from '../../packages/ui/src/app/search/llmJson.actions';
import * as fs from 'fs';
import * as path from 'path';

const CASES_DIR = path.join(__dirname, '../fixtures/cases');

// Mock HTTP client
function createMockHttp(responseFile: string) {
  const response = JSON.parse(fs.readFileSync(responseFile, 'utf-8'));
  return {
    post: jest.fn().mockResolvedValue(response)
  };
}

// Real chart wrapper (or minimal implementation that stores nodes)
class TestChart {
  nodes: any[] = [];
  edges: any[] = [];

  addNodesAndLinks(items: any[]) {
    items.forEach(item => {
      if (item.from !== undefined) {
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
}

describe('UI Paste Flow Tests', () => {
  const testCases = fs.readdirSync(CASES_DIR);

  testCases.forEach(testCase => {
    const caseDir = path.join(CASES_DIR, testCase);
    if (!fs.statSync(caseDir).isDirectory()) return;

    const inputFile = path.join(caseDir, 'input.json');
    const responseFile = path.join(caseDir, 'api-response.json');
    const expectedFile = path.join(caseDir, 'expected.json');

    if (!fs.existsSync(inputFile) || !fs.existsSync(expectedFile)) return;

    it(`${testCase}: Creates correct nodes on canvas`, async () => {
      const input = fs.readFileSync(inputFile, 'utf-8');
      const expected = JSON.parse(fs.readFileSync(expectedFile, 'utf-8'));

      const chart = new TestChart();
      const mockHttp = createMockHttp(responseFile);

      // Create real services with mock HTTP
      const searchActions = new SearchActions(chart, mockHttp);
      const llmJsonActions = new LlmJsonActions(searchActions, chart);

      // Execute paste flow
      await llmJsonActions.processLlmJson(input);

      // Verify canvas state
      const actualNodes = chart.getAllNodes();
      const actualEdges = chart.getAllEdges();

      expect(actualNodes.length).toBe(expected.nodes.length);
      expect(actualEdges.length).toBe(expected.edges.length);

      expected.nodes.forEach((expectedNode, i) => {
        expect(actualNodes[i].label).toBe(expectedNode.label);
        expect(actualNodes[i].lineNumber).toBe(expectedNode.lineNumber);
      });
    });
  });
});
```

### Step 5: Implement E2E Tests

**tests/e2e/diagram.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const CASES_DIR = path.join(__dirname, '../fixtures/cases');
const APP_URL = 'http://localhost:4200';

test.describe('E2E Diagram Tests', () => {
  const testCases = fs.readdirSync(CASES_DIR);

  testCases.forEach(testCase => {
    const caseDir = path.join(CASES_DIR, testCase);
    if (!fs.statSync(caseDir).isDirectory()) return;

    const inputFile = path.join(caseDir, 'input.json');
    const expectedFile = path.join(caseDir, 'expected.json');
    if (!fs.existsSync(inputFile) || !fs.existsSync(expectedFile)) return;

    test(`${testCase}: Diagram renders correctly`, async ({ page }) => {
      const input = fs.readFileSync(inputFile, 'utf-8');
      const expected = JSON.parse(fs.readFileSync(expectedFile, 'utf-8'));

      await page.goto(APP_URL);

      // Set project path to fake-project
      await page.evaluate(() => {
        window['app'].searchManagement.searchObject.projectPath = 'tests/fixtures/fake-project';
      });

      // Paste the input JSON
      await page.evaluate((json) => {
        window['app'].handleLlmJsonPaste(json);
      }, input);

      // Wait for async operations
      await page.waitForTimeout(1000);

      // Read nodes from chart
      const actualNodes = await page.evaluate(() => {
        return window['app'].chart.getAllNodes(() => true).map(n => ({
          label: n.label,
          lineNumber: n.d?.lineNumber,
          filePath: n.d?.filePath
        }));
      });

      const actualEdges = await page.evaluate(() => {
        return window['app'].chart.getAllEdges(() => true).map(e => ({
          from: e.from,
          to: e.to
        }));
      });

      // Assert
      expect(actualNodes.length).toBe(expected.nodes.length);
      expect(actualEdges.length).toBe(expected.edges.length);

      expected.nodes.forEach((expectedNode, i) => {
        expect(actualNodes[i].label).toBe(expectedNode.label);
        expect(actualNodes[i].lineNumber).toBe(expectedNode.lineNumber);
      });
    });
  });
});
```

### Step 6: Create Run Scripts

**tests/api/run.sh:**
```bash
#!/bin/bash
cd "$(dirname "$0")"

# Start API in background
cd ../../packages/api
npm run serve &
API_PID=$!
sleep 3

# Run tests
cd ../../tests/api
npm test
TEST_EXIT=$?

# Cleanup
kill $API_PID
exit $TEST_EXIT
```

**tests/e2e/run.sh:**
```bash
#!/bin/bash
cd "$(dirname "$0")"

# Use Docker to run with correct Node versions
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

## Test Cases Detail

| # | Case | Input | Expected |
|---|------|-------|----------|
| 01 | single-node | 1 CODE node | 1 node, 0 edges |
| 02 | two-connected | 2 CODE nodes (1→2) | 2 nodes, 1 edge |
| 03 | code-plus-todo | 1 CODE + 1 TODO | 2 nodes, 1 edge |
| 04 | tree-structure | 1→2, 1→3 | 3 nodes, 2 edges |
| 05 | convergence | 1→3, 2→3 | 3 nodes, 2 edges |
| 06 | ide-click | IDE message | 1 node added |
| 07 | search-text | Search "helper" | Matching nodes |
| 08 | search-around-line | Line 5, fuzzy | Node at/near line 5 |
| 09 | load-saved | Saved diagram JSON | Restored state |
| 10 | invalid-path | Non-existent file | Error, no node |
| 11 | fuzzy-match | Wrong lineContent | Corrected line |
| 12 | nested-tree | 3-level hierarchy | Full tree |

## How to Add a New Test Case

1. Create folder: `tests/fixtures/cases/NN-description/`
2. Create `input.json` - the trigger (paste JSON, search params, etc.)
3. Create `api-request.json` - expected HTTP request body
4. Create `api-response.json` - what API should return
5. Create `expected.json` - expected nodes/edges on canvas
6. Run tests - they auto-discover new cases

## Validation

Before running tests, validate fixtures:
```bash
# Check all input.json files are valid cochart format
for f in tests/fixtures/cases/*/input.json; do
  node .claude/commands/scripts/llm-validate-covalent.js "$f"
done
```

## Common Issues

1. **Line numbers shifted**: Update fake-project and all fixtures that reference it
2. **API response format changed**: Update all api-response.json files
3. **New node properties**: Update expected.json schema and assertions
