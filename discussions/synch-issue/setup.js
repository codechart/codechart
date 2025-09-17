// Test setup file - All mocks, utilities, and test data preparation
const fs = require('fs');
const path = require('path');

// Read test data from actual sample files
const ORIGINAL_CODE = fs.readFileSync(path.join(__dirname, 'sample-original.ts'), 'utf8');
const MODIFIED_CODE = fs.readFileSync(path.join(__dirname, 'sample-modified.ts'), 'utf8');

// Add browser mocks before importing TypeScript
global.window = {
    location: { href: 'http://localhost' },
    document: { createElement: () => ({}) }
};
global.document = {
    createElement: () => ({}),
    getElementById: () => null,
    querySelector: () => null
};
global.navigator = { userAgent: 'node.js' };
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

// Utility functions needed for createNode
const Utils = {
    deepMerge: function(...sources) {
        let dummyObj = {}
        dummyObj = Utils.deepMerge1(dummyObj, ...sources)
        return dummyObj
    },

    deepMerge1: function(target, ...sources) {
        let isObject = (item) => {
            return (item && typeof item === 'object' && !Array.isArray(item));
        };
        if (!sources.length) return target;
        const source = sources.shift();

        if (isObject(target) && isObject(source)) {
            for (const key in source) {
                if (isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    Utils.deepMerge1(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return Utils.deepMerge1(target, ...sources);
    }
};

// Chart styles needed for createNode
const chosenFunc = {
    node: function (values, id, selected, hovering) {
        values.size = values.size * 1.5
        values.borderWidth = 5
        values.borderColor = "#125D98"
    }
};

const CcItemStyles = {
    baseNode: {
        physics: false,
        shape: 'box',
        widthConstraint: {},
        font: { align: 'left', background: "white", color: "black", size: 20 },
        chosen: { node: chosenFunc.node },
        borderWidth: 0
    }
};

// Import the REAL SynchActions class
let SynchActions;
try {
    require('ts-node/register');
    const synchModule = require('/mnt/c/dev/codechart/packages/ui/src/app/chart/synch.actions.ts');
    SynchActions = synchModule.SynchActions;
    console.log('✅ Successfully imported real SynchActions class');
} catch (error) {
    console.error('❌ Failed to import real SynchActions:', error.message);
    console.error('Full error:', error);
    process.exit(1);
}

// Create a proper mock app object that SynchActions needs
const mockApp = {
    chart: {
        addToHistory: () => {},
        addNodesAndLinks: () => {},
        getNodes: () => [],
        getNeighboursByEdge: () => ({ nodes: [], edges: [] }),
        getItem: () => ({}),
        deleteItems: () => {},
        // Add the real createNode implementation
        createNode: function(id, label, otherAttributes) {
            let node = Utils.deepMerge(
                { id: id },
                CcItemStyles.baseNode,
                otherAttributes
            );
            if (label) node.label = label.trim();
            if (!node.d) node.d = {};
            node = Utils.deepMerge(node, otherAttributes);
            return node;
        },
        // Add createLink method for failed sync nodes
        createLink: function(fromId, toId, otherAttributes, options) {
            return {
                id: (options && options.idPrefix) ? `${options.idPrefix}_${fromId}_${toId}` : `${fromId}_${toId}`,
                from: fromId,
                to: toId,
                ...otherAttributes
            };
        }
    },
    chartActions: {
        getFileNodeByPath: () => null,
        getFileNodeMatchNodes: () => []
    },
    currentFile: null
};

// Create REAL SynchActions instance
const synchActions = new SynchActions(mockApp);
synchActions.initialize();

// Test data setup
const fileNode = {
    d: { fileContent: ORIGINAL_CODE }
};
const newFile = { content: MODIFIED_CODE };
const originalLines = ORIGINAL_CODE.split('\n');
const newLines = MODIFIED_CODE.split('\n');

// Create test nodes for different scenarios matching sync-test-scenarios.md
const testNodes = [
    // SCENARIO 1: Exact Match, Different Position
    // Line has identical text but moved to different line number
    // Expected: Update line number only, text stays the same
    { 
        id: 'constructor', 
        d: { 
            lineNumber: 14, // constructor line in original (line after comment)
            line: "  constructor(private http: HttpClient) {}", 
            endLineNumber: 14 
        } 
    },
    
    // SCENARIO 2: Similar Text, Same Length  
    // Line has similar content with same character count
    // Expected: Update both text and line number via similarity matching
    { 
        id: 'similarMethod', 
        d: { 
            lineNumber: 19, // justLoad method line in original 
            line: "    justLoad(var a, var b) {", // Should find "    justBoad(var a, var b) {" via similarity
            endLineNumber: 19 
        } 
    },
    
    // SCENARIO 3: Similar Text, Different Length
    // Line has similar content but different character count
    // Expected: Fail similarity check due to length difference
    { 
        id: 'loadingVar', 
        d: { 
            lineNumber: 11, // loading variable line in original
            line: "  loading = false;", // 16 chars - should NOT match "  isLoading = false;" (18 chars)
            endLineNumber: 11 
        } 
    },
    
    // SCENARIO 4: Line Deleted
    // Line exists in original but completely removed from modified file
    // Expected: Failed sync node creation
    { 
        id: 'deleteMethod', 
        d: { 
            lineNumber: 35, // deleteUser method line in original
            line: "    deleteUser(id: number) {", 
            endLineNumber: 35 
        } 
    },
    
    // SCENARIO 5: Line Completely Different
    // Line has completely different content
    // Expected: Search for similar line, may succeed or fail based on similarity
    { 
        id: 'errorLine', 
        d: { 
            lineNumber: 28, // console.error line in original
            line: "          console.error('Failed to load users:', err);", 
            endLineNumber: 28 
        } 
    },

    // SCENARIO 6: Empty Lines Added Before Match
    // Line text identical, but moved down due to empty lines added before it
    // Expected: Update line number to reflect new position
    { 
        id: 'emptyLinesMethod', 
        d: { 
            lineNumber: 42, // simpleMethod line in original
            line: "    simpleMethod() {", 
            endLineNumber: 42 
        } 
    }
];

// Create NodeChange objects (as would be created by reloadSingleFileNode)
// Sort by line number first (like the real code does)
const sortedTestNodes = testNodes.sort((a, b) => a.d.lineNumber - b.d.lineNumber);
const sortedSuspectItems = sortedTestNodes.map(node => ({
    node: {
        id: node.id,
        d: { ...node.d } // copy the node data
    },
    startOffset: 0,
    endOffset: 0,
    originalLineText: node.d.line,
    newLineText: '',
    originalIndex: 0,
    indexInNewContent: 0
}));

// Expected results mapping for all five test scenarios
const expectedResults = {
    'constructor': {
        // SCENARIO 1: Exact Match, Different Position
        // Original: "  constructor(private http: HttpClient) {}" at line 14
        // Modified: "  constructor(private http: HttpClient) {}" at line 15 - shifted by import
        expectedLineNumber: 15,
        expectedLineText: "  constructor(private http: HttpClient) {}",
        shouldSucceed: true
    },
    'similarMethod': {
        // SCENARIO 2: Similar Text, Same Length
        // Original: "    justLoad(var a, var b) {" at line 19 
        // Modified: "    justBoad(var a, var b) {" at line 24  
        // Normalized: "just_load()" should match "just_boad()" via underscore-split comparison
        expectedLineNumber: 24,
        expectedLineText: "    justBoad(var a, var b) {",
        shouldSucceed: true  // Should succeed via similarity matching
    },
    'loadingVar': {
        // SCENARIO 3: Similar Text, Different Length
        // Original: "  loading = false;" at line 11 (16 chars)
        // Modified: "  isLoading = false;" at line 12 (18 chars)
        // Different lengths, should fail similarity check
        expectedLineNumber: null,
        expectedLineText: null,
        shouldSucceed: false  // Should fail due to length difference
    },
    'deleteMethod': {
        // SCENARIO 4: Line Deleted
        // Original: "    deleteUser(id: number) {" at line 35
        // Modified: method completely removed from file
        expectedLineNumber: null, // should be failed reload
        expectedLineText: null,
        shouldSucceed: false
    },
    'errorLine': {
        // SCENARIO 5: Line Completely Different
        // Original: "          console.error('Failed to load users:', err);" at line 28
        // Modified: "          return 'completely different code';" at line 33
        // Completely different content, should fail to find any similarity
        expectedLineNumber: null,  // Should be failed reload
        expectedLineText: null,
        shouldSucceed: false  // Should fail - no similarity possible
    },
    'emptyLinesMethod': {
        // SCENARIO 6: Empty Lines Added Before Match
        // Original: "    simpleMethod() {" at line 42
        // Modified: "    simpleMethod() {" at line 45 (moved down by 3 empty lines)
        // Exact same text, should update line number via offset calculation
        expectedLineNumber: 45,
        expectedLineText: "    simpleMethod() {",
        shouldSucceed: true  // Should succeed via exact match with offset
    }
};

// Export everything needed for the test
module.exports = {
    synchActions,
    fileNode,
    newFile,
    originalLines,
    newLines,
    sortedSuspectItems,
    expectedResults,
    ORIGINAL_CODE,
    MODIFIED_CODE
};