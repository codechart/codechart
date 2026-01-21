# Cochart Tests

Automated tests for diagram creation and search functionality.

## Test Structure

```
tests/
├── fixtures/
│   ├── fake-project/        # Test codebase with known content
│   │   ├── src/main.ts      # Line 6: mainFunction, Line 12: secondFunction
│   │   ├── src/utils.ts     # Line 3: helper, Line 7: formatOutput
│   │   └── src/nested/deep.ts
│   └── cases/               # Test cases (12 total)
│       ├── 01-single-node/
│       ├── 02-two-connected/
│       └── ...
├── api/                     # API endpoint tests
├── e2e/                     # Full E2E tests with Playwright
├── TESTING-GUIDELINES.md    # Testing principles
└── IMPLEMENTATION-GUIDE.md  # Detailed implementation guide
```

## Test Cases

| # | Case | Description |
|---|------|-------------|
| 01 | single-node | Paste 1 CODE node |
| 02 | two-connected | Paste 2 connected nodes |
| 03 | code-plus-todo | CODE node + TODO node |
| 04 | tree-structure | Tree: 1→2, 1→3 |
| 05 | convergence | Converge: 1→3, 2→3 |
| 06 | ide-click | IDE click adds node |
| 07 | search-text | Search for text |
| 08 | search-around-line | Search around specific line |
| 09 | load-saved | Load saved diagram |
| 10 | invalid-path | Non-existent file |
| 11 | fuzzy-match | Wrong line number, correct content |
| 12 | nested-tree | 3-level deep tree |

## Running Tests

### Prerequisites

- **API tests**: Node 20+, API server running
- **E2E tests**: Node 14 for UI, Node 20 for API, both running

### API Tests

```bash
# Start API server first
cd packages/api
npm run serve

# Run tests (in another terminal)
cd tests/api
npm install
npm test
```

### E2E Tests

```bash
# Start both UI and API (requires correct Node versions)
# Option 1: Use Docker
docker-compose up

# Option 2: Manual
cd packages/api && npm run serve  # Node 20
cd packages/ui && ng serve        # Node 14

# Run E2E tests
cd tests/e2e
npm install
npm test
```

### Using Docker (Recommended)

```bash
# Build and run tests
docker-compose -f docker-compose.test.yml up --build
```

## Fixture Format

Each test case has 4 files:

| File | Purpose |
|------|---------|
| `input.json` | What triggers the test (paste JSON, search params) |
| `api-request.json` | Expected HTTP request to API |
| `api-response.json` | Expected API response (used by UI mock) |
| `expected.json` | Expected nodes/edges on canvas |

## Adding New Test Cases

1. Create folder: `tests/fixtures/cases/NN-description/`
2. Create all 4 fixture files
3. Tests auto-discover new cases

## Key Files in fake-project

**src/main.ts:**
- Line 6: `export function mainFunction() {`
- Line 12: `export function secondFunction(input: string) {`
- Line 17: `export function thirdFunction() {`
- Line 21: `export class MainClass {`

**src/utils.ts:**
- Line 3: `export function helper(n: number): number {`
- Line 7: `export function formatOutput(text: string): string {`
- Line 11: `export function validateInput(input: unknown): boolean {`

**src/nested/deep.ts:**
- Line 5: `export function deepFunction(value: number) {`
- Line 10: `export function anotherDeepFunction() {`
