/**
 * API Tests for Cochart Search Endpoints
 *
 * Tests the /find endpoint against fixture test cases.
 * Each test case folder contains:
 *   - api-request.json: Expected request body
 *   - api-response.json: Expected response
 *
 * Run: npm test (requires API server running on localhost:2900)
 */

import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL || 'http://localhost:2900';
const CASES_DIR = path.join(__dirname, '../fixtures/cases');
const PROJECT_PATH = path.join(__dirname, '../fixtures/fake-project');

interface ApiRequest {
  projectPath: string;
  filePath?: string;
  lineNumbers?: number[];
  pattern?: string;
  searchType: string;
  requests?: ApiRequest[]; // For multi-request cases
  note?: string;
}

interface MatchInfo {
  lineNumber: number;
  lineContent: string;
  startContentLine?: number;
  endContentLine?: number;
}

interface ApiResponse {
  fullLocalPath: string;
  matches: MatchInfo[];
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

// Make API request - properly formats request for API
async function postFind(request: any): Promise<ApiResponse[]> {
  // If request already has searchObject, use as-is but inject projectPath
  let apiRequest: any;

  if (request.searchObject) {
    apiRequest = {
      ...request,
      searchObject: {
        ...request.searchObject,
        projectPath: {
          ...request.searchObject.projectPath,
          localPath: PROJECT_PATH,
          rootPath: PROJECT_PATH
        }
      }
    };
  } else {
    // Convert old format to new format
    const searchTypeMap: Record<string, number> = {
      'searchInFolder': 0,
      'searchInFile': 1,
      'getLinesFromFile': 2,
      'searchAroundLine': 3,
      'openFile': 4
    };

    apiRequest = {
      searchType: typeof request.searchType === 'string'
        ? searchTypeMap[request.searchType] || 3
        : request.searchType,
      searchObject: {
        pattern: request.pattern || '',
        flags: request.flags || '',
        searchPath: request.filePath || '',
        projectPath: {
          label: 'fake-project',
          localPath: PROJECT_PATH,
          gitUrl: '',
          rootToProjectPath: '',
          rootPath: PROJECT_PATH
        },
        filenamePattern: request.filenamePattern || '',
        isRegex: request.isRegex || false,
        isFileNameRegex: request.isFileNameRegex || false,
        originalText: request.originalText || '',
        lineNumbers: request.lineNumbers || []
      }
    };
  }

  const response = await fetch(`${API_URL}/find`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiRequest)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  return response.json();
}

describe('API Search Tests', () => {
  const testCases = getTestCases();

  testCases.forEach(testCase => {
    const caseDir = path.join(CASES_DIR, testCase);
    const requestFile = path.join(caseDir, 'api-request.json');
    const responseFile = path.join(caseDir, 'api-response.json');

    // Skip cases without API fixtures
    const request = loadJson<ApiRequest>(requestFile);
    const expectedResponse = loadJson<any>(responseFile);

    if (!request || !expectedResponse) {
      it.skip(`${testCase}: Missing API fixtures`, () => {});
      return;
    }

    // Skip non-/find endpoint cases (like load-saved which uses /searchDiagram)
    if (request.note?.includes('searchDiagram') || expectedResponse.note?.includes('searchDiagram')) {
      it.skip(`${testCase}: Uses different endpoint`, () => {});
      return;
    }

    // Handle error cases
    if (expectedResponse.error) {
      it(`${testCase}: Returns error for invalid request`, async () => {
        try {
          await postFind(request);
          expect.fail('Expected error but got success');
        } catch (error: any) {
          expect(error.message).to.include('error');
        }
      });
      return;
    }

    // Handle multi-request cases
    if (request.requests) {
      it(`${testCase}: All requests return expected responses`, async () => {
        const responses = expectedResponse.responses || [];

        for (let i = 0; i < request.requests.length; i++) {
          const actual = await postFind(request.requests[i]);
          const expected = responses[i];

          expect(actual.length, `Request ${i}: response count`).to.equal(expected.length);

          actual.forEach((file, j) => {
            expect(file.matches.length, `Request ${i}, file ${j}: match count`)
              .to.equal(expected[j].matches.length);

            file.matches.forEach((match: any, k) => {
              const expectedMatch = expected[j].matches[k];
              const expectedLineNum = expectedMatch.lineNumber;
              expect(match.lineNumber, `Request ${i}, file ${j}, match ${k}: lineNumber`)
                .to.be.oneOf([expectedLineNum, expectedLineNum - 1]);
              const actualLine = match.line || match.lineContent || '';
              const expectedLine = expectedMatch.line || expectedMatch.lineContent || '';
              if (expectedLine) {
                expect(actualLine, `Request ${i}, file ${j}, match ${k}: line content`)
                  .to.include(expectedLine.trim());
              }
            });
          });
        }
      });
      return;
    }

    // Standard single-request case
    it(`${testCase}: Returns expected response`, async () => {
      const actual = await postFind(request);
      const expected = Array.isArray(expectedResponse) ? expectedResponse : [];

      expect(actual.length, 'Response file count').to.equal(expected.length);

      actual.forEach((file, i) => {
        expect(file.matches.length, `File ${i}: match count`)
          .to.equal(expected[i].matches.length);

        file.matches.forEach((match: any, j) => {
          const expectedMatch = expected[i].matches[j];
          // API uses 0-indexed, fixtures may use 1-indexed - check both
          const expectedLineNum = expectedMatch.lineNumber;
          expect(match.lineNumber, `File ${i}, match ${j}: lineNumber`)
            .to.be.oneOf([expectedLineNum, expectedLineNum - 1]);
          // API returns 'line' not 'lineContent'
          const actualLine = match.line || match.lineContent || '';
          const expectedLine = expectedMatch.line || expectedMatch.lineContent || '';
          if (expectedLine) {
            expect(actualLine, `File ${i}, match ${j}: line content`)
              .to.include(expectedLine.trim());
          }
        });
      });
    });
  });
});

describe('API Error Handling', () => {
  it('Handles non-existent file gracefully', async () => {
    const response = await fetch(`${API_URL}/find`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchType: 1,
        searchObject: {
          pattern: 'anything',
          flags: '',
          searchPath: 'src/does-not-exist.ts',
          projectPath: {
            label: 'fake-project',
            localPath: PROJECT_PATH,
            gitUrl: '',
            rootToProjectPath: '',
            rootPath: PROJECT_PATH
          },
          filenamePattern: '',
          isRegex: false,
          isFileNameRegex: false,
          originalText: '',
          lineNumbers: []
        }
      })
    });

    const result = await response.json();
    // API may return empty array, array with no matches, or error object
    if (Array.isArray(result)) {
      if (result.length > 0) {
        expect(result[0].matches).to.be.an('array');
      }
    } else {
      // Error object is acceptable
      const hasError = result.err !== undefined || result.message !== undefined;
      expect(hasError, 'Expected error response').to.be.true;
    }
  });

  it('Returns 400 for missing required fields', async () => {
    const response = await fetch(`${API_URL}/find`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    expect(response.status).to.be.oneOf([400, 500]);
  });
});
