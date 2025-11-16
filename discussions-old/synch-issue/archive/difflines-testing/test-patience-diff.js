// Test file for Patience Diff implementation
const fs = require('fs');
const path = require('path');
// Use local PatienceDiff.js since npm package is different
const patienceDiffModule = require('./PatienceDiff-dev/PatienceDiff.js');
const patienceDiffPlus = patienceDiffModule.patienceDiffPlus;

// Read test files
const originalContent = fs.readFileSync(path.join(__dirname, 'sample-original.ts'), 'utf8');
const modifiedContent = fs.readFileSync(path.join(__dirname, 'sample-modified.ts'), 'utf8');

const originalLines = originalContent.split('\n');
const modifiedLines = modifiedContent.split('\n');

// Test data - specific lines we want to track
const testNodes = [
    { 
        id: 'constructor', 
        originalLine: 14, 
        description: 'Constructor method',
        expectedModifiedLine: 15,
        expectedResult: 'MOVED (exact match)'
    },
    { 
        id: 'justLoad', 
        originalLine: 19, 
        description: 'justLoad method',
        expectedModifiedLine: 24,  // justBoad method
        expectedResult: 'DELETED (similar content but different name)'
    },
    { 
        id: 'loadingVar', 
        originalLine: 11, 
        description: 'loading variable',
        expectedModifiedLine: 12,  // isLoading variable
        expectedResult: 'DELETED (similar but different variable name)'
    },
    { 
        id: 'deleteMethod', 
        originalLine: 35, 
        description: 'deleteUser method',
        expectedModifiedLine: null,
        expectedResult: 'DELETED (completely removed)'
    },
    { 
        id: 'errorLine', 
        originalLine: 28, 
        description: 'console.error line',
        expectedModifiedLine: 32,  // different error message
        expectedResult: 'DELETED (similar structure but different content)'
    },
    { 
        id: 'simpleMethod', 
        originalLine: 42, 
        description: 'simpleMethod',
        expectedModifiedLine: 45,  // moved down by empty lines
        expectedResult: 'DELETED (exact match but moved with empty lines added)'
    }
];

console.log('=== TESTING PATIENCE DIFF DIRECTLY ===\n');
console.log('Original file lines:', originalLines.length);
console.log('Modified file lines:', modifiedLines.length);

// Show what we're testing - original lines
console.log('\n=== ORIGINAL LINES BEING TRACKED ===');
testNodes.forEach(test => {
    const originalLine = originalLines[test.originalLine - 1] || '[LINE NOT FOUND]';
    console.log(`${test.id} (${test.description}):`);
    console.log(`  Original line ${test.originalLine}: "${originalLine}"`);
    
    if (test.expectedModifiedLine) {
        const modifiedLine = modifiedLines[test.expectedModifiedLine - 1] || '[LINE NOT FOUND]';
        console.log(`  Expected in modified line ${test.expectedModifiedLine}: "${modifiedLine}"`);
    } else {
        console.log(`  Expected in modified: NOT PRESENT (deleted)`);
    }
    console.log(`  Expected PatienceDiff result: ${test.expectedResult}`);
    console.log();
});

// Run PatienceDiffPlus
console.log('\n--- Running patienceDiffPlus ---');
const diffResult = patienceDiffPlus(originalLines, modifiedLines);

console.log(`\nDiff statistics:`);
console.log(`  Lines deleted: ${diffResult.lineCountDeleted}`);
console.log(`  Lines inserted: ${diffResult.lineCountInserted}`);
console.log(`  Lines moved: ${diffResult.lineCountMoved}`);

// Build line mapping
const lineMapping = new Map();

diffResult.lines.forEach(diffLine => {
    if (diffLine.aIndex !== -1) {
        const originalLineNum = diffLine.aIndex + 1; // Convert to 1-based
        
        if (diffLine.bIndex !== -1) {
            const newLineNum = diffLine.bIndex + 1; // Convert to 1-based
            lineMapping.set(originalLineNum, newLineNum);
        } else {
            lineMapping.set(originalLineNum, -1); // Deleted
        }
    }
});

// Check how many lines were actually marked as moved in the diff result
console.log('\n=== ANALYZING MOVED LINES DISCREPANCY ===');
console.log(`PatienceDiff reports ${diffResult.lineCountMoved} moved lines`);

let actualMovedCount = 0;
diffResult.lines.forEach(diffLine => {
    if (diffLine.moved === true) {
        actualMovedCount++;
        console.log(`Line marked as moved: aIndex=${diffLine.aIndex}, bIndex=${diffLine.bIndex}, content="${diffLine.line}"`);
    }
});

console.log(`Lines actually marked with moved=true: ${actualMovedCount}`);
if (diffResult.lineCountMoved !== actualMovedCount) {
    console.log(`⚠️  DISCREPANCY: lineCountMoved (${diffResult.lineCountMoved}) != actual moved lines (${actualMovedCount})`);
}

console.log('\n=== PATIENCE DIFF RESULTS BY TEST CASE ===\n');

testNodes.forEach(test => {
    console.log(`━━━ ${test.id.toUpperCase()} (${test.description}) ━━━`);
    
    const originalLine = originalLines[test.originalLine - 1] || '[LINE NOT FOUND]';
    console.log(`Original line ${test.originalLine}: "${originalLine}"`);
    
    if (test.expectedModifiedLine) {
        const expectedLine = modifiedLines[test.expectedModifiedLine - 1] || '[LINE NOT FOUND]';
        console.log(`Expected line ${test.expectedModifiedLine}: "${expectedLine}"`);
    } else {
        console.log(`Expected: DELETED (not present in modified file)`);
    }
    
    console.log(`Expected result: ${test.expectedResult}`);
    console.log('');
    
    const actualLineNum = lineMapping.get(test.originalLine);
    
    console.log('PATIENCE DIFF ACTUAL RESULT:');
    if (actualLineNum === undefined) {
        console.log(`  ❌ NOT FOUND in diff mapping`);
    } else if (actualLineNum === -1) {
        console.log(`  ✓ DELETED (as expected for non-exact matches)`);
    } else {
        const actualLine = modifiedLines[actualLineNum - 1] || '[LINE NOT FOUND]';
        console.log(`  ✓ MOVED to line ${actualLineNum}: "${actualLine}"`);
        
        if (originalLine === actualLine) {
            console.log(`  ✓ EXACT MATCH - content unchanged`);
        } else {
            console.log(`  ⚠️  CONTENT CHANGED during move`);
        }
    }
    
    // Check if result matches expectation
    const expectedDeleted = test.expectedResult.includes('DELETED');
    const actualDeleted = actualLineNum === -1 || actualLineNum === undefined;
    const expectedMoved = test.expectedResult.includes('MOVED');
    const actualMoved = actualLineNum !== undefined && actualLineNum !== -1;
    
    console.log('');
    if ((expectedDeleted && actualDeleted) || (expectedMoved && actualMoved)) {
        console.log(`✅ RESULT MATCHES EXPECTATION`);
    } else {
        console.log(`❌ RESULT DIFFERS FROM EXPECTATION`);
        console.log(`   Expected: ${expectedDeleted ? 'DELETED' : 'MOVED'}`);
        console.log(`   Actual: ${actualDeleted ? 'DELETED' : 'MOVED'}`);
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
});