// Text comparison utilities
import { FileNode, ReloadFilesResponse } from '../types.nodejs';
import { NodeChange } from './textDiffTypes';

// Import diff-lines package for diff functionality
import * as diffLines_pkg from 'diff-lines';

// Declare global diff function loaded by Angular scripts (for browser environment)
declare var diff: any;



// Similarity comparison utilities
export function isSimilarLine(line1: string, line2: string): boolean {
    const tokenize = (str) => {
        // Remove leading/trailing whitespace
        str = str.trim();

        // Extract parameters if present
        let params = [];
        const parenMatch = str.match(/\((.*)\)$/);
        if (parenMatch) {
            const paramStr = parenMatch[1].trim();
            if (paramStr) {
                params = paramStr.split(',').map(p => p.trim());
            }
            // Remove parameters from the main string for comparison
            str = str.replace(/\s*\(.*\)$/, '');
        }

        // Split into tokens (words, operators, punctuation)
        const tokens = str.match(/\w+|[^\w\s]/g) || [];

        return {
            baseTokens: tokens,
            params: params,
            length: tokens.length + params.length
        };
    };

    const tokens1 = tokenize(line1);
    const tokens2 = tokenize(line2);

    // Don't match empty or whitespace-only lines
    if (tokens1.length === 0 || tokens2.length === 0) {
        return false;
    }

    // Special handling for @Injectable() - exact match required
    if (line1.trim() === '@Injectable()' || line2.trim() === '@Injectable()') {
        return line1.trim() === line2.trim();
    }

    // Special handling for class declarations - must have same class name
    if (line1.includes('class ') && line2.includes('class ')) {
        const class1 = line1.match(/class\s+(\w+)/);
        const class2 = line2.match(/class\s+(\w+)/);
        if (class1 && class2) {
            return class1[1] === class2[1];
        }
    }

    // Token-based similarity comparison
    if (tokens1.length === tokens2.length && tokens1.length > 0) {
        let matchingTokens = 0;
        for (let i = 0; i < tokens1.baseTokens.length; i++) {
            if (tokens1.baseTokens[i] === tokens2.baseTokens[i] ||
                tokens1.baseTokens[i].startsWith(tokens2.baseTokens[i]) ||
                tokens2.baseTokens[i].startsWith(tokens1.baseTokens[i])) {
                matchingTokens++;
            }
        }

        // Use 70% threshold for similarity
        const threshold = Math.ceil(tokens1.baseTokens.length * 0.7);
        const result = matchingTokens >= threshold;

        return result;
    }

    return false;
}

export function findSimilarLine(targetLine: string, contentArray: string[], currentIndex: number): number | null {
    let forward = currentIndex + 1;
    let backward = currentIndex - 1;

    while (forward < contentArray.length || backward >= 0) {
        if (forward < contentArray.length) {
            if (isSimilarLine(targetLine, contentArray[forward])) {
                return forward;
            }
            forward++;
        }

        if (backward >= 0) {
            if (isSimilarLine(targetLine, contentArray[backward])) {
                return backward;
            }
            backward--;
        }
    }

    return null;
}

export function diffLines(sortedChangedNodes: NodeChange[], fileNode: FileNode, newFile: ReloadFilesResponse, originalFileContentAsArray: string[], newContentAsArray: string[]): NodeChange[] {
    let sortedMatchNodesEndLines = []
    sortedChangedNodes.forEach(i => { if (i.node.d.endLineNumber) sortedMatchNodesEndLines.push(i) })
    let startLineMatchNodeIndex = 0;
    let endLineMatchNodeIndex = 0;
    let currentMatchStartLine = () => sortedChangedNodes[startLineMatchNodeIndex].node.d.lineNumber;
    let currentMatchEndLine = () => sortedMatchNodesEndLines[endLineMatchNodeIndex].node.d.endLineNumber;
    let lineOffset = 0;
    // let indexInOriginalContent = 0;  // ORIGINAL BROKEN LOGIC (commented out)
    // The original logic had a bug: indexInOriginalContent was 0-based but compared to 1-based line numbers
    let indexInOriginalContent = 1;  // FIX: Start at 1 to match 1-based line numbers
    // let originalLineNumber = 1;  // ALTERNATIVE FIX: Track actual line number in original file (1-based)


    // calculate offset for each match. we go over the merged lines, increasing/decreasing offset as we meet '+'/'-'.
    // we increase these in the matching match nodes by checking line number
    let diffResult = typeof diff !== 'undefined' ? diff(fileNode.d.fileContent, newFile.content) : diffLines_pkg(fileNode.d.fileContent, newFile.content)
    let diffAsArray = diffResult.split('\n')


    diffAsArray.forEach((diffLine, index) => {
        if (diffLine.startsWith('+')) {
            lineOffset++;
            return;
        }

        // Check nodes against BROKEN index logic (original bug)
        if (startLineMatchNodeIndex < sortedChangedNodes.length && indexInOriginalContent === currentMatchStartLine()) {
            let updatedMatchNode = sortedChangedNodes[startLineMatchNodeIndex];
            updatedMatchNode.startOffset = lineOffset;
            const indexInNewContent = indexInOriginalContent + lineOffset
            // Line numbers are 1-based, but array indices are 0-based
            updatedMatchNode.originalLineText = originalFileContentAsArray[indexInOriginalContent - 1];

            // FIX: Check if the calculated line exists in the new content
            if (indexInNewContent - 1 < newContentAsArray.length && indexInNewContent > 0) {
                const calculatedLine = newContentAsArray[indexInNewContent - 1];
                updatedMatchNode.newLineText = calculatedLine;
                updatedMatchNode.originalIndex = indexInOriginalContent
                updatedMatchNode.indexInNewContent = indexInNewContent
            } else {
                // Line doesn't exist in new content - mark as deleted
                updatedMatchNode.newLineText = '';
                updatedMatchNode.originalIndex = indexInOriginalContent
                updatedMatchNode.indexInNewContent = -1; // Invalid index to indicate deletion
            }

            // FIXED VERSION (commented out):
            // if (startLineMatchNodeIndex < sortedChangedNodes.length && originalLineNumber === currentMatchStartLine()) {
            //     let updatedMatchNode = sortedChangedNodes[startLineMatchNodeIndex];
            //     updatedMatchNode.startOffset = lineOffset;
            //     const indexInNewContent = originalLineNumber + lineOffset
            //     // Line numbers are 1-based, but array indices are 0-based
            //     updatedMatchNode.originalLineText = originalFileContentAsArray[originalLineNumber - 1];
            //     updatedMatchNode.newLineText = newContentAsArray[indexInNewContent - 1];
            //     updatedMatchNode.originalIndex = originalLineNumber
            //     updatedMatchNode.indexInNewContent = indexInNewContent

            startLineMatchNodeIndex++;
        }
        if (endLineMatchNodeIndex < sortedMatchNodesEndLines.length && indexInOriginalContent === currentMatchEndLine()) {
            sortedMatchNodesEndLines[endLineMatchNodeIndex].endOffset = lineOffset;
            endLineMatchNodeIndex++;
        }

        // ORIGINAL BROKEN INCREMENT LOGIC (commented out)
        // if (diffLine.startsWith('-')) {
        //     lineOffset--;
        // } else {
        //     // Unchanged line (starts with space)
        //     indexInOriginalContent++;
        // }

        // FIX: Increment for both deleted and unchanged lines (they both exist in original)
        if (diffLine.startsWith('-')) {
            lineOffset--;
            indexInOriginalContent++;  // Deleted lines are in original file
        } else if (!diffLine.startsWith('+')) {
            // Unchanged line (starts with space)
            indexInOriginalContent++;
        }

        // FIXED VERSION (commented out):
        // if (diffLine.startsWith('-')) {
        //     lineOffset--;
        //     originalLineNumber++;  // Deleted line was in original file
        // } else {
        //     // Unchanged line (starts with space)
        //     originalLineNumber++;
        // }
    });

    return sortedChangedNodes;
}

