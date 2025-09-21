// Using local PatienceDiff.js since npm package 'patience-diff' is different
const patienceDiffModule = require('../../../../../discussions/synch-issue/difflines-testing/PatienceDiff-dev/PatienceDiff.js');
import { FileNode, MatchNode, ReloadFilesResponse } from '../types.nodejs';

interface NodeChange {
    wasConflict?: boolean;
    label?: string;
    node: MatchNode;
    startOffset: number;
    endOffset: number;
    originalLineText: string;
    newLineText: string;
    originalIndex: number;
    indexInNewContent: number;
}

export function textCompare(
    sortedChangedNodes: NodeChange[], 
    fileNode: FileNode, 
    newFile: ReloadFilesResponse, 
    originalArray: string[], 
    newArray: string[]
): NodeChange[] {
    console.log(`\n📊 PATIENCE DIFF CALCULATION:`);
    console.log(`  Processing ${sortedChangedNodes.length} nodes`);
    
    // Use patienceDiffPlus to get moved line detection
    const diffResult = patienceDiffModule.patienceDiffPlus(originalArray, newArray);
    
    console.log(`  Diff result: ${diffResult.lineCountDeleted} deleted, ${diffResult.lineCountInserted} inserted, ${diffResult.lineCountMoved} moved`);
    
    // Build a map from original line number to new line number
    const lineMapping = new Map<number, number>();
    
    diffResult.lines.forEach(diffLine => {
        // aIndex is 0-based index in original, bIndex is 0-based index in new
        if (diffLine.aIndex !== -1) {
            // Line exists in original (might be deleted, moved, or unchanged)
            const originalLineNum = diffLine.aIndex + 1; // Convert to 1-based
            
            if (diffLine.bIndex !== -1) {
                // Line exists in new file (unchanged or moved)
                const newLineNum = diffLine.bIndex + 1; // Convert to 1-based
                lineMapping.set(originalLineNum, newLineNum);
            } else {
                // Line was deleted
                lineMapping.set(originalLineNum, -1);
            }
        }
        // Lines with aIndex === -1 are insertions, not relevant for tracking original lines
    });
    
    // Process each node and find its new position
    sortedChangedNodes.forEach(nodeChange => {
        const originalLineNum = nodeChange.node.d.lineNumber;
        nodeChange.originalIndex = originalLineNum;
        
        // Initialize offset fields (not used with Patience Diff but required by interface)
        nodeChange.startOffset = 0;
        nodeChange.endOffset = 0;
        
        // Get original line text (1-based to 0-based)
        if (originalLineNum > 0 && originalLineNum <= originalArray.length) {
            nodeChange.originalLineText = originalArray[originalLineNum - 1];
        } else {
            nodeChange.originalLineText = '';
        }
        
        // Find new position from mapping
        const newLineNum = lineMapping.get(originalLineNum);
        
        if (newLineNum !== undefined) {
            if (newLineNum > 0) {
                // Line exists in new position
                nodeChange.indexInNewContent = newLineNum;
                // Get new line text (1-based to 0-based)
                if (newLineNum <= newArray.length) {
                    nodeChange.newLineText = newArray[newLineNum - 1];
                } else {
                    nodeChange.newLineText = '';
                }
                
                console.log(`    🎯 NODE ${nodeChange.node.id}: line ${originalLineNum} → ${newLineNum}`);
                console.log(`      Original: "${nodeChange.originalLineText}"`);
                console.log(`      New: "${nodeChange.newLineText}"`);
            } else {
                // Line was deleted
                nodeChange.indexInNewContent = -1;
                nodeChange.newLineText = '';
                console.log(`    ❌ NODE ${nodeChange.node.id}: line ${originalLineNum} DELETED`);
            }
        } else {
            // Line not found in diff result - treat as deleted
            nodeChange.indexInNewContent = -1;
            nodeChange.newLineText = '';
            console.log(`    ⚠️ NODE ${nodeChange.node.id}: line ${originalLineNum} NOT FOUND in diff`);
        }
    });
    
    console.log(`  Processed ${sortedChangedNodes.length} nodes with Patience Diff`);
    
    return sortedChangedNodes;
}