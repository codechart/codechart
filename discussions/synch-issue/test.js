// Test execution file - Runs specific scenarios based on parameters
const setup = require('./setup');

// Parse command line arguments
const args = process.argv.slice(2);
const scenarioArg = args.find(arg => arg.startsWith('--scenario=') || arg.startsWith('-s='));
const listArg = args.includes('--list') || args.includes('-l');

// Available test types mapping
const testTypeMap = {
    'exact': ['constructor'],
    'similar-same': ['similarMethod'], 
    'similar-diff': ['loadingVar'],
    'deleted': ['deleteMethod'],
    'different': ['errorLine'],
    'empty-lines': ['emptyLinesMethod'],
    'all': ['constructor', 'similarMethod', 'loadingVar', 'deleteMethod', 'errorLine', 'emptyLinesMethod']
};

const testTypeDescriptions = {
    'exact': 'Exact Match, Different Position - Line text identical, position changed',
    'similar-same': 'Similar Text, Same Length - Similar content, same character count',
    'similar-diff': 'Similar Text, Different Length - Similar content, different character count',
    'deleted': 'Line Deleted - Line exists in original but removed from modified',
    'different': 'Line Completely Different - Completely different content',
    'empty-lines': 'Empty Lines Added Before Match - Line moved down by added empty lines'
};

// Show help if --list is used
if (listArg) {
    console.log('Available test types:');
    Object.keys(testTypeDescriptions).forEach(key => {
        console.log(`  ${key}: ${testTypeDescriptions[key]}`);
    });
    console.log('\nUsage:');
    console.log('  node test.js --scenario=exact        # Run exact match test only');
    console.log('  node test.js -s=similar-same,deleted # Run similar-same and deleted tests');
    console.log('  node test.js --scenario=all          # Run all tests (default)');
    console.log('  node test.js --list                  # Show this help');
    process.exit(0);
}

// Determine which scenarios to run
let scenariosToRun = ['all'];
if (scenarioArg) {
    const scenarioValue = scenarioArg.split('=')[1];
    scenariosToRun = scenarioValue.split(',').map(s => s.trim());
}

// Get node IDs to test
let nodeIdsToTest = [];
scenariosToRun.forEach(testType => {
    if (testTypeMap[testType]) {
        nodeIdsToTest = nodeIdsToTest.concat(testTypeMap[testType]);
    } else {
        console.error(`Unknown test type: ${testType}`);
        process.exit(1);
    }
});

// Remove duplicates
nodeIdsToTest = [...new Set(nodeIdsToTest)];

console.log('=== COMPREHENSIVE TEST: compareFileContent Method ===');
if (scenariosToRun.includes('all')) {
    console.log('\nTesting all test types from sample files:');
    Object.values(testTypeDescriptions).forEach(desc => console.log(`  ${desc}`));
} else {
    console.log(`\nTesting types: ${scenariosToRun.join(', ')}`);
    scenariosToRun.forEach(s => {
        if (testTypeDescriptions[s]) console.log(`  ${testTypeDescriptions[s]}`);
    });
}

// Filter test nodes based on selected scenarios
const filteredSuspectItems = setup.sortedSuspectItems.filter(item => 
    nodeIdsToTest.includes(item.node.id)
);

// Capture original line numbers before algorithm modifies them
const originalLineNumbers = {};
filteredSuspectItems.forEach(item => {
    originalLineNumbers[item.node.id] = item.node.d.lineNumber;
});

console.log('\n--- Running compareFileContent ---');
console.log('Original nodes before processing:');
filteredSuspectItems.forEach(item => {
    console.log(`  ${item.node.id}: line ${item.node.d.lineNumber} - "${item.node.d.line}"`);
});

// Run the REAL compareFileContent method on the REAL SynchActions instance
const result = setup.synchActions.compareFileContent(
    filteredSuspectItems,
    setup.fileNode,
    setup.newFile,
    setup.originalLines,
    setup.newLines,
    [],
    { addFailedReloadToDiagram: true }
);

console.log('\n=== TEST RESULTS ===');
console.log(`Total returned nodes: ${result.length}`);

// Analyze results
const successfulUpdates = result.filter(node => node.d && node.d.type !== 'failedSync');
const failedNodes = result.filter(node => node.d && node.d.type === 'failedSync');

console.log(`Successful updates: ${successfulUpdates.length}`);
console.log(`Failed reload nodes: ${failedNodes.length}`);

console.log('\nSuccessful node updates:');
successfulUpdates.forEach(node => {
    console.log(`  ${node.id}: line ${node.d.lineNumber} - "${node.d.line}"`);
});

if (failedNodes.length > 0) {
    console.log('\nFailed reload nodes:');
    failedNodes.forEach(node => {
        console.log(`  ${node.id}: ${node.label}`);
    });
}

console.log('\n🔍 VERIFICATION: Checking line number correctness');

// Verify each result against expectations
let testsPassed = 0;
let testsTotal = 0;

Object.keys(setup.expectedResults).forEach(nodeId => {
    // Skip scenarios not selected for testing
    if (!nodeIdsToTest.includes(nodeId)) return;
    
    const expected = setup.expectedResults[nodeId];
    const actualNode = result.find(node => node.id === nodeId);
    testsTotal++;
    
    // Add comment explaining the test type
    let testType = '';
    if (nodeId === 'constructor') testType = 'Exact Match, Different Position';
    else if (nodeId === 'similarMethod') testType = 'Similar Text, Same Length';
    else if (nodeId === 'loadingVar') testType = 'Similar Text, Different Length';
    else if (nodeId === 'deleteMethod') testType = 'Line Deleted';
    else if (nodeId === 'errorLine') testType = 'Line Completely Different';
    else if (nodeId === 'emptyLinesMethod') testType = 'Empty Lines Added Before Match';
    
    console.log(`\nTesting ${nodeId} (${testType}):`);
    
    if (!expected.shouldSucceed) {
        // Should be a failed node
        const isFailedNode = actualNode && actualNode.d && actualNode.d.type === 'failedSync';
        if (isFailedNode) {
            console.log(`  ✅ Correctly identified as failed reload`);
            testsPassed++;
        } else {
            console.log(`  ❌ Expected failed reload but got: ${actualNode ? actualNode.d.lineNumber : 'not found'}`);
        }
    } else {
        // Should succeed with correct line number and text
        if (actualNode && actualNode.d) {
            // Get original line number from captured values
            const originalLineNumber = originalLineNumbers[nodeId] || 'unknown';
            
            const correctLineNumber = actualNode.d.lineNumber === expected.expectedLineNumber;
            const correctLineText = actualNode.d.line.trim() === expected.expectedLineText.trim();
            const lineNumberUpdated = actualNode.d.lineNumber !== originalLineNumber;
            
            console.log(`  Original: line ${originalLineNumber}`);
            console.log(`  Expected: line ${expected.expectedLineNumber} - "${expected.expectedLineText}"`);
            console.log(`  Actual:   line ${actualNode.d.lineNumber} - "${actualNode.d.line}"`);
            console.log(`  Line number updated: ${lineNumberUpdated ? '✅ YES' : '❌ NO'}`);
            
            if (correctLineNumber && correctLineText) {
                console.log(`  ✅ Perfect match!`);
                testsPassed++;
            } else if (correctLineNumber) {
                console.log(`  🟡 Line number correct, but text differs`);
            } else if (correctLineText) {
                console.log(`  🟡 Text correct, but line number differs`);  
            } else {
                console.log(`  ❌ Both line number and text incorrect`);
            }
        } else {
            console.log(`  ❌ Node not found in results`);
        }
    }
});

console.log(`\n📊 FINAL SCORE: ${testsPassed}/${testsTotal} tests passed`);
if (testsPassed === testsTotal) {
    console.log('🎉 All line number verifications PASSED!');
} else {
    console.log('💥 Some line number verifications FAILED!');
}

console.log('\n✅ Comprehensive compareFileContent test with verification completed!');