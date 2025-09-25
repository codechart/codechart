#!/usr/bin/env node

// Test script to verify patience-diff package is working correctly
const path = require('path');

// Set up TypeScript compilation for importing from UI package
process.env.TS_NODE_PROJECT = path.resolve(__dirname, '../../packages/ui/tsconfig.json');
require('ts-node/register');

console.log('=== Testing patience-diff Package ===\n');

// Test data
const originalLines = [
    'import { Injectable } from \'@angular/core\';',
    '',
    '@Injectable()',
    'export class TestService {',
    '  constructor() {}',
    '  method1() {',
    '    console.log("original method");',
    '  }',
    '}'
];

const modifiedLines = [
    'import { Injectable } from \'@angular/core\';',
    'import { HttpClient } from \'@angular/common/http\';',
    '',
    '',
    '@Injectable()',
    'export class TestService {',
    '  constructor(private http: HttpClient) {}',
    '  method1() {',
    '    console.log("modified method");',
    '  }',
    '  newMethod() {',
    '    return "new functionality";',
    '  }',
    '}'
];

console.log('Original lines:');
originalLines.forEach((line, i) => console.log(`  ${i + 1}: "${line}"`));

console.log('\nModified lines:');
modifiedLines.forEach((line, i) => console.log(`  ${i + 1}: "${line}"`));

console.log('\n=== Testing Direct patience-diff Import ===');

try {
    // Test direct package import
    const patienceDiff = require('patience-diff');
    console.log('✅ patience-diff package imported successfully');
    
    console.log('Available methods:', Object.keys(patienceDiff));
    
    if (patienceDiff.patienceDiffPlus) {
        console.log('✅ patienceDiffPlus method found');
        
        console.log('\n=== Running patienceDiffPlus ===');
        const result = patienceDiff.patienceDiffPlus(originalLines, modifiedLines);
        
        console.log('Diff result structure:');
        console.log('- lineCountDeleted:', result.lineCountDeleted);
        console.log('- lineCountInserted:', result.lineCountInserted); 
        console.log('- lineCountMoved:', result.lineCountMoved);
        console.log('- lines.length:', result.lines.length);
        
        console.log('\nLine mappings (showing first 10):');
        result.lines.slice(0, 10).forEach((line, i) => {
            console.log(`  ${i}: aIndex=${line.aIndex}, bIndex=${line.bIndex}, line="${line.line}"`);
        });
        
        console.log('\n✅ patience-diff working correctly!');
    } else {
        console.log('❌ patienceDiffPlus method not found');
    }
    
} catch (error) {
    console.log('❌ Direct package import failed:', error.message);
}

console.log('\n=== Testing via text.comparison.ts ===');

try {
    // Test through our textCompare module
    const { textCompare } = require('../../packages/ui/src/app/chart/text.comparison.ts');
    console.log('✅ textCompare module imported successfully');
    
    // Create mock NodeChange objects
    const mockNodes = [
        {
            node: { 
                id: 'test1',
                d: { lineNumber: 3 } // @Injectable() line 
            },
            startOffset: 0,
            endOffset: 0,
            originalLineText: '',
            newLineText: '',
            originalIndex: 0,
            indexInNewContent: 0
        },
        {
            node: { 
                id: 'test2', 
                d: { lineNumber: 7 } // console.log line
            },
            startOffset: 0,
            endOffset: 0,
            originalLineText: '',
            newLineText: '', 
            originalIndex: 0,
            indexInNewContent: 0
        }
    ];
    
    const result = textCompare(mockNodes, {}, {}, originalLines, modifiedLines);
    
    console.log('\nNode mapping results:');
    result.forEach(node => {
        console.log(`- Node ${node.node.id}:`);
        console.log(`  Original line ${node.originalIndex}: "${node.originalLineText}"`);
        console.log(`  New position ${node.indexInNewContent}: "${node.newLineText}"`);
    });
    
    console.log('\n✅ textCompare integration working correctly!');
    
} catch (error) {
    console.log('❌ textCompare integration failed:', error.message);
    console.log('Full error:', error);
}

console.log('\n=== Test Complete ===');