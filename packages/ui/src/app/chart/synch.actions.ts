import * as diff from 'diff-lines';
import { AppComponent } from '../app.component';
import { ChartWrapper } from './chart.wrapper';
import { ChartUtils } from './chart.utils';
import { CreateUtils } from './create.utils';
import { Utils } from './Utils';
import { FileId, FileNode, MatchNode, VisiNode, ReloadFilesResponse } from '../types.nodejs';
import { NodeTypes } from './chart.consts';
import { Edge, IdType, Node } from 'vis';

interface NodeChange {
    wasConflict?: boolean;
    label?: string;
    node: MatchNode,
    startOffset: number,
    endOffset: number,
    originalLineText: string,
    newLineText: string,
    originalIndex: number,
    indexInNewContent: number
}



export interface ReloadOptions {
    addFailedReloadToDiagram?: boolean;
    markNullFiles?: boolean;
}

export class SynchActions {
    private chart: ChartWrapper;
    private diffLib = diff;

    constructor(private app: AppComponent) {
    }

    initialize() {
        this.chart = this.app.chart;
    }

    public reloadAllFileNodes(files: ReloadFilesResponse[], options: ReloadOptions = { markNullFiles: true }): number {
        console.log('----------------- Starting Synching -----------------')
        options = Object.assign({ addFailedReloadToDiagram: true, markNullFiles: true }, options)
        let newNodesAndItems: Array<Node | Edge> = []
        files.forEach(file => {
            newNodesAndItems = newNodesAndItems.concat(this.reloadSingleFileNode(this.app.chartActions.getFileNodeByPath(file.fileId) as FileNode, file, options));
        });
        if (options.addFailedReloadToDiagram) {
            this.chart.addToHistory(false);
            this.chart.addNodesAndLinks(newNodesAndItems, true);
            this.app.currentFile = null
        }
        console.log('----------------- Finished Synching -----------------')

        return newNodesAndItems.filter((i: MatchNode) => { return (ChartUtils.isMatchNode(i) && i.d.type === 'failedSync') }).length
    }



    public reloadSingleFileNode(fileNode: FileNode, newFile: ReloadFilesResponse, options: ReloadOptions): Array<Node | Edge> {

        console.log('-----------------' + fileNode.label + '-----------------')

        let returnedItems: Array<Node | Edge> = [];
        if (newFile.content === fileNode.d.fileContent) return []

        options = Object.assign({ markNullFiles: true }, options)
        // file is missing, mark all as failed
        if (newFile.content !== undefined && newFile.content.length === 0) {
            let matchNodes = this.app.chartActions.getFileNodeMatchNodes(fileNode, false)
            matchNodes.forEach((i) => returnedItems = returnedItems.concat(this.addFailedReloadToArray(i, "NO SUCH FILE", options)))

            return returnedItems
        }


        let newContentAsArray = newFile.content.split('\n')
        let originalFileContentAsArray = fileNode.d.fileContent.split('\n')

        // sort matches of file by line number, add offset field for later use
        let sortedSuspectItems: NodeChange[] = this.app.chartActions.getFileNodeMatchNodes(fileNode, false)
            .sort((a, b) => ChartUtils.getLineNumber(a) - ChartUtils.getLineNumber(b))
            .map((i: MatchNode) => {
                let j = Utils.deepCopy(i)
                j.d.endLineNumber = i.d.endLineNumber ? i.d.endLineNumber : i.d.lineNumber
                return { node: j, startOffset: 0, endOffset: 0, contentOffset: 0, originalLineText: i.d.line, newLineText: '', originalIndex: 0, indexInNewContent: 0 };
            });

        if (sortedSuspectItems.length === 0) {
            return returnedItems;
        }


        const updatedNodes = this.compareFileContent(sortedSuspectItems, fileNode, newFile, originalFileContentAsArray, newContentAsArray, returnedItems, options);

        returnedItems = returnedItems.concat(updatedNodes);

        fileNode.d.fileContent = newFile.content
        returnedItems.push(fileNode)

        return returnedItems;
    }

    private compareFileContent(sortedSuspectItems: NodeChange[], fileNode: FileNode, newFile: ReloadFilesResponse, originalFileContentAsArray: string[], newContentAsArray: string[], returnedItems: (Node | Edge)[], options: ReloadOptions) {
        const sortedChangedItems = this.diffLines(sortedSuspectItems, fileNode, newFile, originalFileContentAsArray, newContentAsArray);
        // update matches and file node
        const failedNodes: Node[] = []
        let changedNodes: MatchNode[] = sortedChangedItems.map((i: NodeChange) => {
            // DEBUG LOGGING (enabled for debugging)
            console.log(`\n🔧 PROCESSING NODE: ${i.node.id}`);
            console.log(`  Original line: "${i.originalLineText}"`);
            console.log(`  New line (from diff): "${i.newLineText}"`);
            console.log(`  New line number (from diff): ${i.indexInNewContent}`);
            
            try {
                let newLineText = i.newLineText;
                let newLineNumber = i.indexInNewContent;

                // FIX: Check if line was deleted or no match found (marked with -1)
                if (newLineNumber === -1) {
                    // Check if this is a deletion vs. a different line that needs similarity search
                    if (i.newLineText === '') {
                        // Empty new line text indicates deletion or no direct match
                        // Try similarity search first
                        let similarIndex = this.findSimilarLine(i.originalLineText, newContentAsArray, 
                            i.originalIndex); // Use original index as starting point
                        
                        if (similarIndex !== null) {
                            // Found similar line
                            i.node.d.line = newContentAsArray[similarIndex];
                            i.node.d.lineNumber = similarIndex + 1; // Convert to 1-based
                            i.node.d.endLineNumber = similarIndex + 1;
                            console.log('sync similar', newContentAsArray[similarIndex], similarIndex + 1);
                            return i.node;
                        } else {
                            // No similar line found - create failed sync indicator
                            failedNodes.concat(this.addFailedReloadToArray(i.node, i.originalLineText, options));
                            console.log('failed sync no match', i.originalLineText, 'NO MATCH');
                            return i.node;
                        }
                    } else {
                        // This shouldn't happen with current logic, but handle gracefully
                        failedNodes.concat(this.addFailedReloadToArray(i.node, i.originalLineText, options));
                        console.log('failed sync unexpected', i.originalLineText, 'UNEXPECTED');
                        return i.node;
                    }
                }

                // console.log(`  🤔 Checking similarity between diff result and original...`);
                if (!this.checkLinesSimilarity(i.newLineText, i.originalLineText)) {
                    let similarIndex = this.findSimilarLine(i.originalLineText, newContentAsArray, newLineNumber);

                    if (similarIndex !== null) {
                        newLineText = newContentAsArray[similarIndex];
                        newLineNumber = similarIndex;
                        i.node.d.line = newLineText;
                        i.node.d.lineNumber = newLineNumber;
                        i.node.d.endLineNumber = newLineNumber;
                        console.log('sync similar', newLineText, newLineNumber);
                    } else {
                        // similar line not found – treat as failed reload
                        failedNodes.concat(this.addFailedReloadToArray(i.node, "?", options));
                        console.log('failed sync similar', newLineText, newLineNumber);
                    }
                }
                // MISSING ELSE BLOCK (original bug - now fixed):
                else {
                    // Lines are similar, update line number based on calculated position
                    i.node.d.line = newLineText;
                    i.node.d.lineNumber = newLineNumber;
                    i.node.d.endLineNumber = newLineNumber;
                    console.log('sync exact match', newLineText, newLineNumber);
                }

                return i.node;

            } catch (ex) {
                console.log(ex);
                returnedItems = returnedItems.concat(this.addFailedReloadToArray(i.node, "?", options));
                return i.node;
            }
        });
        return changedNodes.concat(failedNodes as MatchNode[]);
    }

    private checkLinesSimilarity(line1: string, line2: string) {
        // DEBUG LOGGING (commented out)
        // console.log(`🔍 SIMILARITY CHECK:`);
        // console.log(`  Line1: "${line1}" (length: ${line1.length})`);
        // console.log(`  Line2: "${line2}" (length: ${line2.length})`);
        
        // Remove whitespace variations and parameters
        const normalize = str => str
            .replace(/\s+/g, '')  // Remove all whitespace
            .replace(/\([^)]*\)/g, '()')  // Replace parameters with empty ()
            .replace(/([a-z])([A-Z])/g, '$1_$2')  // Convert camelCase to snake_case
            .toLowerCase();


        if (line1.length !== line2.length) {
            // console.log(`  ❌ Length mismatch: ${line1.length} vs ${line2.length}`);
            return false;
        }
        
        const norm1 = normalize(line1);
        const norm2 = normalize(line2);
        // console.log(`  Normalized1: "${norm1}"`);
        // console.log(`  Normalized2: "${norm2}"`);
        
        // Check for similarity using multiple approaches
        let result = norm1.startsWith(norm2) || norm2.startsWith(norm1);
        
        // If startsWith fails, try underscore-split comparison for camelCase similarities
        if (!result) {
            const parts1 = norm1.split('_');
            const parts2 = norm2.split('_');
            
            // Check if parts structure is similar and individual parts are close
            if (parts1.length === parts2.length) {
                let matchingParts = 0;
                for (let i = 0; i < parts1.length; i++) {
                    if (parts1[i] === parts2[i] || 
                        parts1[i].startsWith(parts2[i]) || 
                        parts2[i].startsWith(parts1[i])) {
                        matchingParts++;
                    }
                }
                // Consider similar if most parts match (70% threshold)
                result = matchingParts >= Math.ceil(parts1.length * 0.7);
                // console.log(`  Parts comparison: ${matchingParts}/${parts1.length} parts match, threshold: ${Math.ceil(parts1.length * 0.7)}`);
            }
        }
        
        // console.log(`  Result: ${result ? '✅ SIMILAR' : '❌ NOT SIMILAR'}`);

        return result;
    }

    private findSimilarLine(targetLine: string, contentArray: string[], currentIndex: number): number | null {
        // DEBUG LOGGING (commented out)
        // console.log(`🔎 FINDING SIMILAR LINE:`);
        // console.log(`  Target: "${targetLine}"`);
        // console.log(`  Starting from index: ${currentIndex}`);
        
        let forward = currentIndex + 1;
        let backward = currentIndex - 1;

        while (forward < contentArray.length || backward >= 0) {
            if (forward < contentArray.length) {
                // console.log(`  Checking forward[${forward}]: "${contentArray[forward]}"`);
                if (this.checkLinesSimilarity(targetLine, contentArray[forward])) {
                    // console.log(`  ✅ Found similar line at index ${forward}`);
                    return forward;
                }
                forward++;
            }
            if (backward >= 0) {
                // console.log(`  Checking backward[${backward}]: "${contentArray[backward]}"`);
                if (this.checkLinesSimilarity(targetLine, contentArray[backward])) {
                    // console.log(`  ✅ Found similar line at index ${backward}`);
                    return backward;
                }
                backward--;
            }
        }
        // console.log(`  ❌ No similar line found`);
        return null;
    }

    public clearFailedReloadNodesIndicators() {
        let indicatorNodes = this.chart.getNodes((i) => ChartUtils.isFailedSyncIndicator(i), 'id') as IdType[]
        indicatorNodes.forEach((i) => {
            let matchNodes = this.chart.getNeighboursByEdge(i, (edge) => {
                return ChartUtils.isFailedSyncIndicatorEdge(edge)
            }).nodes
            if (matchNodes.length > 0) {
                ChartUtils.setLine(this.chart.getItem(matchNodes[0]) as Node, this.chart.getItem(i)['d'].newLineText, this.chart)
            } else {
                console.warn(`could'nt find match of failed node ${i}`)
            }
        })
        this.chart.deleteItems({ nodes: indicatorNodes, edges: [] })
    }

    private addFailedReloadToArray(node: Node, originalLineText: string, options: ReloadOptions): Array<Node | Edge> {
        let failedItems: Array<Node | Edge> = [];
        if (options.addFailedReloadToDiagram === false) return []
        // if failed reload indicator exists, update it, else create a refresh failed indicator
        let existingIndicators = this.chart.getNeighboursByEdge(node.id, (edge) => ChartUtils.isFailedSyncIndicatorEdge(edge))
        if (existingIndicators.nodes.length > 0) {
            let indicatorNode = this.chart.getItem(existingIndicators.nodes[0]) as MatchNode
            indicatorNode.d.line = originalLineText
            failedItems = [indicatorNode, existingIndicators.edges[0] as Edge];
        } else {
            let failed = CreateUtils.createFailedSyncNode(node as MatchNode, this.chart, originalLineText);
            failedItems = [failed.node, failed.edge];
        }
        return failedItems;
    }


    private diffLines(sortedChangedNodes: NodeChange[], fileNode: FileNode, newFile: ReloadFilesResponse, originalFileContentAsArray: string[], newContentAsArray: string[]): NodeChange[] {
        // DEBUG LOGGING (commented out)
        console.log(`\n📊 DIFF LINES CALCULATION:`);
        console.log(`  Processing ${sortedChangedNodes.length} nodes`);
        
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
        
        console.log(`  Nodes to process: ${sortedChangedNodes.map(n => `${n.node.id}(line ${n.node.d.lineNumber})`).join(', ')}`);
        
        // calculate offset for each match. we go over the merged lines, increasing/decreasing offset as we meet '+'/'-'.
        // we increase these in the matching match nodes by checking line number
        let diff = this.diffLib(fileNode.d.fileContent, newFile.content)
        let diffAsArray = diff.split('\n')
        
        console.log(`  Diff has ${diffAsArray.length} lines`);
        
        diffAsArray.forEach((diffLine, index) => {
            if (diffLine.startsWith('+')) { 
                lineOffset++; 
                console.log(`    [${index}] ADD: offset now ${lineOffset}`);
                return; 
            }
            
            // console.log(`    [${index}] Checking line ${indexInOriginalContent} vs node line ${startLineMatchNodeIndex < sortedChangedNodes.length ? currentMatchStartLine() : 'none'}`);
            
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
                
                console.log(`    🎯 MATCHED NODE ${updatedMatchNode.node.id}:`);
                console.log(`      Original line ${indexInOriginalContent}: "${updatedMatchNode.originalLineText}"`);
                console.log(`      New line ${indexInNewContent}: "${updatedMatchNode.newLineText}"`);
                console.log(`      Offset: ${lineOffset}`);
                
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
        
        console.log(`  📋 Final node states:`);
        sortedChangedNodes.forEach(node => {
            console.log(`    ${node.node.id}: original[${node.originalIndex}] -> new[${node.indexInNewContent}] (offset: ${node.startOffset})`);
        });
        
        return sortedChangedNodes;
    }

} 