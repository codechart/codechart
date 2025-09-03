# Test Plan: LLM Action → API Contract Testing

## Overview
Create comprehensive unit tests to validate the contract between `llmJson.actions.ts` and the API without requiring HTTP calls or running servers.

## Test Structure

### 1. Contract Interface Tests (`contract-test.spec.ts`)
- **Mock API Response Generator**: Create helper that generates valid FindInFilesResponse objects
- **Search Request Validator**: Verify SearchRequest format matches API expectations  
- **Response Parser Tests**: Test UI parsing of API responses into MatchNodes

### 2. Integration Mock Tests (`llm-api-integration.spec.ts`)
- **Mock HTTP Client**: Stub `searchActions.http.post()` to return controlled responses
- **End-to-End Flow**: Test `loadNode() → searchAroundLine() → API response → MatchNode creation`
- **Mock Error Simulation**: Test simulated network errors by making mock HTTP client throw exceptions

### 3. API Method Unit Tests (`api-spiral-search.spec.ts`) 
- **Direct Method Testing**: Test `searchAroundLineInFile()` with our test files
- **Bug Validation**: Prove current indexing bug and validate remembered fix
- **Invalid Line Number Tests**: 
  - Line 999 (beyond file end of 30 lines) → should return error
  - Line 0 → should return error  
  - Line -5 (negative) → should return error
  - Line 31 (just beyond end) → should return error

### 4. Test Data
- Use existing `test-sample.ts` (30 lines) and `manual-test-diagram-example.json`
- Create mock ProjectPath and SearchObject fixtures
- Generate expected/actual response comparison data

### 5. Test Scenarios
- ✅ Valid: Exact line match at correct position
- ✅ Valid: Spiral search finding nearby identical lines  
- ✅ Valid: Multiple identical lines (test which one spiral chooses)
- ✅ Valid: Wrong line numbers in request vs actual content
- ❌ Invalid: Line numbers beyond file bounds (31, 50, 999) → API returns error
- ❌ Invalid: Zero or negative line numbers (0, -5) → API returns error
- ❌ Invalid: Non-existent files → API returns error
- ❌ Invalid: Malformed API responses → UI handles gracefully

## Benefits
- **No HTTP Dependencies**: Pure unit tests using mocks
- **Contract Validation**: Ensures UI/API communicate correctly  
- **Error Boundary Testing**: Validates API returns errors for invalid line numbers
- **Bug Documentation**: Proves spiral search issue and validates fix
- **Regression Prevention**: Catches future breaking changes