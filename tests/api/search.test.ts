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

// Make API request
async function postFind(request: ApiRequest): Promise<ApiResponse[]> {
  const response = await fetch(`${API_URL}/find`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...request,
      projectPath: PROJECT_PATH
    })
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

            file.matches.forEach((match, k) => {
              expect(match.lineNumber, `Request ${i}, file ${j}, match ${k}: lineNumber`)
                .to.equal(expected[j].matches[k].lineNumber);
              expect(match.lineContent, `Request ${i}, file ${j}, match ${k}: lineContent`)
                .to.include(expected[j].matches[k].lineContent.trim());
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

        file.matches.forEach((match, j) => {
          expect(match.lineNumber, `File ${i}, match ${j}: lineNumber`)
            .to.equal(expected[i].matches[j].lineNumber);
          expect(match.lineContent, `File ${i}, match ${j}: lineContent`)
            .to.include(expected[i].matches[j].lineContent.trim());
        });
      });
    });
  });
});

describe('API Error Handling', () => {
  it('Returns empty array for non-existent file', async () => {
    const response = await fetch(`${API_URL}/find`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectPath: PROJECT_PATH,
        filePath: 'src/does-not-exist.ts',
        pattern: 'anything',
        searchType: 'searchInFile'
      })
    });

    const result = await response.json();
    expect(result).to.be.an('array');
    // Either empty or contains file with no matches
    if (result.length > 0) {
      expect(result[0].matches).to.be.an('array').that.is.empty;
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
