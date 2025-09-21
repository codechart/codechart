const fs = require('fs');

// Mock browser globals for Node.js
global.window = {
    location: { href: 'http://localhost' },
    document: { createElement: () => ({}) }
};
global.document = global.window.document;

// Setup TypeScript compilation
const TS_NODE_PROJECT = '../../packages/ui/tsconfig.json';
process.env.TS_NODE_PROJECT = TS_NODE_PROJECT;
require('ts-node/register');

// Import required classes
const { SynchActions } = require('../../packages/ui/src/app/chart/synch.actions.ts');
const { textCompare } = require('../../packages/ui/src/app/chart/textCompare.ts');

console.log('=== ISOLATED DIFFLINES COMPARISON TEST ===\n');

// Load test data
const originalContent = fs.readFileSync('./sample-original.ts', 'utf8');
const modifiedContent = fs.readFileSync('./sample-modified.ts', 'utf8');

const originalArray = originalContent.split('\n');
const newArray = modifiedContent.split('\n');

// Create test nodes (same 6 nodes we've been testing)
const createTestNodes = () => [
    {
        node: { id: 'loadingVar', d: { lineNumber: 11 } },
        originalLineText: '  loading = false;',
        originalIndex: 11,
        indexInNewContent: -1,
        newLineText: '',
        startOffset: 0
    },
    {
        node: { id: 'constructor', d: { lineNumber: 14 } },
        originalLineText: '  constructor(private http: HttpClient) {}',
        originalIndex: 14,
        indexInNewContent: -1,
        newLineText: '',
        startOffset: 0
    },
    {
        node: { id: 'similarMethod', d: { lineNumber: 19 } },
        originalLineText: '    justLoad(var a, var b) {',
        originalIndex: 19,
        indexInNewContent: -1,
        newLineText: '',
        startOffset: 0
    },
    {
        node: { id: 'errorLine', d: { lineNumber: 28 } },
        originalLineText: "          console.error('Failed to load users:', err);",
        originalIndex: 28,
        indexInNewContent: -1,
        newLineText: '',
        startOffset: 0
    },
    {
        node: { id: 'deleteMethod', d: { lineNumber: 35 } },
        originalLineText: '    deleteUser(id: number) {',
        originalIndex: 35,
        indexInNewContent: -1,
        newLineText: '',
        startOffset: 0
    },
    {
        node: { id: 'emptyLinesMethod', d: { lineNumber: 42 } },
        originalLineText: '    simpleMethod() {',
        originalIndex: 42,
        indexInNewContent: -1,
        newLineText: '',
        startOffset: 0
    }
];

// Mock file objects
const fileNode = { d: { fileContent: originalContent } };
const newFile = { content: modifiedContent };

// Test 1: Original diffLines method
console.log('🔄 TESTING ORIGINAL DIFFLINES METHOD\n');

const synchActions = new SynchActions();
const testNodes1 = createTestNodes();
const originalResults = synchActions.diffLines_ORIGINAL(testNodes1, fileNode, newFile, originalArray, newArray);

console.log('=== ORIGINAL DIFFLINES RESULTS ===');
originalResults.forEach(node => {
    const status = node.indexInNewContent === -1 ? 'DELETED' : 
                  node.newLineText === node.originalLineText ? 'MATCHED' : 'MOVED';
    
    console.log(`${node.node.id}:`);
    console.log(`  Original: line ${node.originalIndex} - "${node.originalLineText}"`);
    if (node.indexInNewContent === -1) {
        console.log(`  Mapped to: NO MATCH (${status})`);
    } else {
        console.log(`  Mapped to: line ${node.indexInNewContent} - "${node.newLineText}" (${status})`);
    }
    console.log(`  Offset: ${node.startOffset}`);
    console.log('');
});

console.log('\n' + '='.repeat(60) + '\n');

// Test 2: PatienceDiff method
console.log('🔄 TESTING PATIENCE DIFF METHOD\n');

const testNodes2 = createTestNodes();
const patienceResults = textCompare(testNodes2, fileNode, newFile, originalArray, newArray);

console.log('=== PATIENCE DIFF RESULTS ===');
patienceResults.forEach(node => {
    const status = node.indexInNewContent === -1 ? 'DELETED' : 
                  node.newLineText === node.originalLineText ? 'MATCHED' : 'MOVED';
    
    console.log(`${node.node.id}:`);
    console.log(`  Original: line ${node.originalIndex} - "${node.originalLineText}"`);
    if (node.indexInNewContent === -1) {
        console.log(`  Mapped to: NO MATCH (${status})`);
    } else {
        console.log(`  Mapped to: line ${node.indexInNewContent} - "${node.newLineText}" (${status})`);
    }
    console.log(`  Offset: ${node.startOffset || 'N/A'}`);
    console.log('');
});

console.log('\n' + '='.repeat(60) + '\n');

// Comparison analysis
console.log('🔍 SIDE-BY-SIDE COMPARISON\n');

console.log('=== COMPARISON TABLE ===');
console.log('| Node | Original Method | Patience Diff | Winner |');
console.log('|------|----------------|---------------|--------|');

let originalCorrect = 0;
let patienceCorrect = 0;

// Expected correct mappings (manually verified)
const expectedMappings = {
    'loadingVar': { line: 11, text: '  isLoading = false;' },  // Similar but different
    'constructor': { line: 15, text: '  constructor(private http: HttpClient) {}' },  // Exact match moved
    'similarMethod': { line: 24, text: '    justBoad(var a, var b) {' },  // Similar typo
    'errorLine': { line: 32, text: "          console.error('Failed to fetch users:', err);" },  // Different message
    'deleteMethod': { line: -1, text: '' },  // Deleted
    'emptyLinesMethod': { line: 45, text: '    simpleMethod() {' }  // Moved by empty lines
};

testNodes1.forEach((_, index) => {
    const origResult = originalResults[index];
    const patienceResult = patienceResults[index];
    const nodeId = origResult.node.id;
    const expected = expectedMappings[nodeId];
    
    // Check accuracy
    const isOrigCorrect = (origResult.indexInNewContent === expected.line && 
                          (expected.line === -1 || origResult.newLineText.trim() === expected.text.trim()));
    const isPatienceCorrect = (patienceResult.indexInNewContent === expected.line && 
                              (expected.line === -1 || patienceResult.newLineText.trim() === expected.text.trim()));
    
    if (isOrigCorrect) originalCorrect++;
    if (isPatienceCorrect) patienceCorrect++;
    
    const winner = isOrigCorrect && isPatienceCorrect ? 'TIE' :
                   isOrigCorrect ? 'ORIGINAL' :
                   isPatienceCorrect ? 'PATIENCE' : 'BOTH WRONG';
    
    console.log(`| ${nodeId.padEnd(12)} | line ${origResult.indexInNewContent.toString().padEnd(2)} | line ${patienceResult.indexInNewContent.toString().padEnd(2)} | ${winner.padEnd(6)} |`);
});

console.log('\n=== DETAILED COMPARISON ===\n');

testNodes1.forEach((_, index) => {
    const origResult = originalResults[index];
    const patienceResult = patienceResults[index];
    const nodeId = origResult.node.id;
    
    console.log(`📍 ${nodeId.toUpperCase()}:`);
    console.log(`  Original method: line ${origResult.originalIndex} → ${origResult.indexInNewContent}`);
    console.log(`    Content: "${origResult.newLineText}"`);
    console.log(`  Patience method: line ${patienceResult.originalIndex} → ${patienceResult.indexInNewContent}`);
    console.log(`    Content: "${patienceResult.newLineText}"`);
    
    if (origResult.indexInNewContent === patienceResult.indexInNewContent && 
        origResult.newLineText === patienceResult.newLineText) {
        console.log(`  ✅ IDENTICAL RESULTS`);
    } else {
        console.log(`  ❌ DIFFERENT RESULTS`);
    }
    console.log('');
});

console.log('=== FINAL SUMMARY ===');
console.log(`Original diffLines accuracy: ${originalCorrect}/6 (${Math.round(originalCorrect/6*100)}%)`);
console.log(`Patience Diff accuracy: ${patienceCorrect}/6 (${Math.round(patienceCorrect/6*100)}%)`);

if (patienceCorrect > originalCorrect) {
    console.log('🏆 WINNER: Patience Diff');
} else if (originalCorrect > patienceCorrect) {
    console.log('🏆 WINNER: Original diffLines');
} else {
    console.log('🤝 TIE: Both methods performed equally');
}

console.log('\n✅ diffLines comparison test completed!');