// Test execution file - Runs specific scenarios with comprehensive results table
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
    console.log('  node test.js --lines=14,19,26        # Track specific line numbers');
    console.log('  node test.js --scenario=exact --lines=50,75  # Combine scenarios and custom lines');
    console.log('  node test.js --list                  # Show this help');
    console.log('  node test.js --original=path --modified=path  # Use custom test files');
    process.exit(0);
}

// Determine which scenarios to run
let scenariosToRun = [];
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

// Add custom line node IDs
if (setup.customLineNumbers && setup.customLineNumbers.length > 0) {
    const customNodeIds = setup.customLineNumbers.map(lineNum => `line_${lineNum}`);
    nodeIdsToTest = nodeIdsToTest.concat(customNodeIds);
}

// Remove duplicates
nodeIdsToTest = [...new Set(nodeIdsToTest)];

// Print file names being tested
console.log('=== TEST FILE INFORMATION ===');
console.log(`Original file: ${setup.originalFile}`);
console.log(`Modified file: ${setup.modifiedFile}`);
if (setup.customLineNumbers && setup.customLineNumbers.length > 0) {
    console.log(`Custom lines tracked: ${setup.customLineNumbers.join(', ')}`);
}
console.log('');

// Filter test nodes based on selected scenarios
const filteredSuspectItems = setup.sortedSuspectItems.filter(item => 
    nodeIdsToTest.includes(item.node.id)
);

// Capture original line numbers before algorithm modifies them
const originalNodeData = {};
filteredSuspectItems.forEach(item => {
    originalNodeData[item.node.id] = {
        lineNumber: item.node.d.lineNumber,
        lineText: item.node.d.line
    };
});

// Data capture structures - we'll capture from the intermediate NodeChange objects
const capturedData = {};

// Create a deep copy to track intermediate states
const trackingItems = JSON.parse(JSON.stringify(filteredSuspectItems));

// Run the REAL compareFileContent method and capture intermediate data
const result = setup.synchActions.compareFileContent(
    trackingItems,
    setup.fileNode,
    setup.newFile,
    setup.originalLines,
    setup.newLines,
    [],
    { addFailedReloadToDiagram: true }
);

// After compareFileContent runs, capture data from the trackingItems which were modified
trackingItems.forEach(item => {
    if (!capturedData[item.node.id]) {
        capturedData[item.node.id] = {};
    }
    // Capture diff-related data from the NodeChange objects
    capturedData[item.node.id].diffLineNumber = item.indexInNewContent;
    capturedData[item.node.id].diffLineText = item.newLineText;
    
    // Try to determine if similarity search was used by comparing original vs final
    const finalNode = result.find(r => r.id === item.node.id);
    if (finalNode && finalNode.d) {
        // If the final line is different from the original but similar, similarity was used
        if (finalNode.d.line !== item.originalLineText && finalNode.d.lineNumber !== item.node.d.lineNumber) {
            capturedData[item.node.id].similarLineText = finalNode.d.line;
            capturedData[item.node.id].similarLineNumber = finalNode.d.lineNumber;
        }
    }
});

// Capture final updated node data
const updatedNodeData = {};
result.forEach(node => {
    if (originalNodeData[node.id]) {
        updatedNodeData[node.id] = {
            lineNumber: node.d ? node.d.lineNumber : null,
            lineText: node.d ? node.d.line : null,
            isFailed: node.d && node.d.type === 'failedSync'
        };
    }
});

// Format comprehensive results table
console.log('=== COMPREHENSIVE RESULTS TABLE ===');
console.log('');

// Table header
const headers = [
    'Node ID',
    'Type',
    'Original Line',
    'Original #',
    'Diff Line',
    'Diff #',
    'Similar Line',
    'Similar #',
    'Updated Line',
    'Updated #'
];

// Calculate column widths
const columnWidths = headers.map(h => h.length);
const tableData = [];

nodeIdsToTest.forEach(nodeId => {
    const original = originalNodeData[nodeId] || {};
    const captured = capturedData[nodeId] || {};
    const updated = updatedNodeData[nodeId] || {};
    const isCustom = nodeId.startsWith('line_');
    
    const row = [
        nodeId,
        isCustom ? 'Custom' : 'Test',
        truncate(original.lineText || '', 40),
        original.lineNumber || '',
        truncate(captured.diffLineText || '', 40),
        captured.diffLineNumber === -1 ? 'DELETED' : (captured.diffLineNumber || ''),
        truncate(captured.similarLineText || '', 40),
        captured.similarLineNumber || '',
        updated.isFailed ? 'FAILED SYNC' : truncate(updated.lineText || '', 40),
        updated.isFailed ? 'N/A' : (updated.lineNumber || '')
    ];
    
    tableData.push(row);
    
    // Update column widths
    row.forEach((cell, i) => {
        columnWidths[i] = Math.max(columnWidths[i], String(cell).length);
    });
});

// Print table header
console.log(headers.map((h, i) => h.padEnd(columnWidths[i])).join(' | '));
console.log(columnWidths.map(w => '-'.repeat(w)).join('-+-'));

// Print table rows
tableData.forEach(row => {
    console.log(row.map((cell, i) => String(cell).padEnd(columnWidths[i])).join(' | '));
});

// Utility function to truncate long strings
function truncate(str, maxLength) {
    if (!str) return '';
    str = str.trim();
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}

console.log('\n=== Test Complete ===');