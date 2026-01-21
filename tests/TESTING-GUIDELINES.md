# Cochart Testing Guidelines

Principles for writing reliable, maintainable tests.

## Core Principles

### 1. Don't Mock Internal Methods

**Bad:**
```typescript
// Mocking internal method - if implementation changes, test still passes
mockSearchActions.doSearch = jest.fn().mockResolvedValue([...]);
```

**Good:**
```typescript
// Mock only at system boundary (HTTP)
mockHttp.post = jest.fn().mockResolvedValue(apiResponse);
// Let real doSearch run, it will use mocked HTTP
```

**Why:** If you mock `doSearch` and someone changes its signature or behavior, your test still passes but real code is broken.

---

### 2. Shared Contract Fixtures

Same JSON file used by multiple test layers:

```
fixtures/cases/01-single-node/
├── api-request.json    ← UI sends this, API expects this
├── api-response.json   ← API returns this, UI mocks this
└── expected.json       ← Both verify canvas matches this
```

| Test Layer | api-response.json |
|------------|-------------------|
| API test | Asserts API returns this |
| UI test | Mocks HTTP with this |

**Why:** Single source of truth. If API response format changes:
1. API test fails
2. You update api-response.json
3. UI test automatically uses new format

---

### 3. Read Actual Output

**Bad:**
```typescript
// Checking mock was called - doesn't verify actual result
expect(mockChart.addNodesAndLinks).toHaveBeenCalledWith(expectedNodes);
```

**Good:**
```typescript
// Read actual chart state
const actualNodes = chart.getAllNodes(() => true);
expect(actualNodes.length).toBe(expected.nodes.length);
expect(actualNodes[0].lineNumber).toBe(expected.nodes[0].lineNumber);
```

**Why:** Mocks can lie. Reading actual state verifies real behavior.

---

### 4. Test Input → Output

Focus on observable behavior, not implementation:

```
Input:  Paste this JSON
Output: Canvas has these nodes/edges
```

**Don't test:**
- Which internal functions were called
- Order of internal operations
- Private method behavior

**Do test:**
- Given input X, output is Y
- Error cases produce correct error

---

### 5. Deterministic Fixtures

**fake-project/** has known content at known lines:

```typescript
// fake-project/src/main.ts
// Line 1: comment
// Line 2: blank
import { helper } from './utils';    // Line 3 - ALWAYS line 3
// Line 4: blank
export function mainFunction() {     // Line 5 - ALWAYS line 5
```

**Why:** Tests must be deterministic. If fixture content shifts, update ALL dependent test cases.

---

### 6. Three Test Layers

| Layer | What Runs Real | What's Mocked | Verifies |
|-------|---------------|---------------|----------|
| **API** | API server, filesystem | Nothing | Response JSON matches fixture |
| **UI Logic** | UI services, chart | HTTP calls | Chart state matches expected |
| **E2E** | Everything | Nothing | Canvas renders correctly |

**Coverage:**
- API tests catch: search logic bugs, file handling bugs
- UI tests catch: paste parsing bugs, node creation bugs
- E2E tests catch: integration bugs, rendering bugs

---

## Test Case Structure

Each test case is a folder with 4 files:

```
cases/NN-description/
├── input.json          # Trigger (paste JSON, search params)
├── api-request.json    # Expected HTTP request to API
├── api-response.json   # Expected API response (contract)
└── expected.json       # Expected canvas state
```

### input.json
What triggers the test (cochart JSON to paste, search parameters, etc.)

### api-request.json
Expected HTTP request body. Used to verify UI sends correct request.

### api-response.json
What API returns. Used by:
- API test: assert response matches
- UI test: mock HTTP response

### expected.json
Expected nodes and edges on canvas:
```json
{
  "nodes": [
    { "label": "...", "lineNumber": 5, "filePath": "src/main.ts" }
  ],
  "edges": [
    { "from": 1, "to": 2 }
  ]
}
```

---

## Adding a New Test Case

1. Create folder: `tests/fixtures/cases/NN-description/`
2. Write `input.json` - what triggers the test
3. Write `api-request.json` - expected HTTP request
4. Write `api-response.json` - expected API response
5. Write `expected.json` - expected canvas state
6. Run tests - they auto-discover new cases

---

## Common Mistakes

| Mistake | Problem | Solution |
|---------|---------|----------|
| Mocking internal methods | Code changes don't break tests | Mock only HTTP boundary |
| Hardcoding expected values | Drift from fixture | Reference fixture files |
| Testing implementation | Brittle tests | Test input → output only |
| Skipping API tests | Contract drift | Always test both sides |
