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

        return newNodesAndItems.filter((i: MatchNode) => { return (ChartUtils.isMatchNode(i) && i.d.type === NodeTypes.failedSync) }).length
    }



    public reloadSingleFileNode(fileNode: FileNode, newFile: ReloadFilesResponse, options: ReloadOptions): Array<Node | Edge> {

        console.log('-----------------' + fileNode.label + '-----------------')

        let returnedItems: Array<Node | Edge> = [];
        if (newFile.content === fileNode.d.fileContent) return []

        options = Object.assign({ markNullFiles: true }, options)
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


        const sortedChangedItems = this.diffLines(sortedSuspectItems, fileNode, newFile, originalFileContentAsArray, newContentAsArray);
        // update matches and file node
        let changedNodes: MatchNode[] = sortedChangedItems.map((i: NodeChange) => {
            try {
                if (!this.checkLinesSimilarity(i.newLineText, i.originalLineText)) {
                    returnedItems = returnedItems.concat(this.addFailedReloadToArray(i.node, i.originalLineText, options));
                }

                i.node.d.line = i.newLineText
                i.node.d.lineNumber += i.startOffset;
                if (i.node.d.endLineNumber) i.node.d.endLineNumber += i.endOffset
                return i.node;
            } catch (ex) {
                console.log(ex)
                returnedItems = returnedItems.concat(this.addFailedReloadToArray(i.node, "?", options));
                return i.node;
            }
        });

        sortedSuspectItems = sortedSuspectItems.map(i => {
            i.wasConflict = !this.checkLinesSimilarity(i.newLineText, i.originalLineText)
            i.label = i.node.label
            return i
        })
        sortedSuspectItems.forEach(i => {
            const {node, ...rest} = i;
            console.log(Object.keys(rest).map(k => `${k}: ${rest[k]}`).join(', '));
        })

        returnedItems = returnedItems.concat(changedNodes);

        fileNode.d.fileContent = newFile.content
        returnedItems.push(fileNode)

        return returnedItems;
    }

    private checkLinesSimilarity(line1: string, line2: string) {
        // Remove whitespace variations and parameters
        const normalize = str => str
            .replace(/\s+/g, '')  // Remove all whitespace
            .replace(/\([^)]*\)/g, '()')  // Replace parameters with empty ()
            .toLowerCase();

        const norm1 = normalize(line1);
        const norm2 = normalize(line2);

        return norm1.startsWith(norm2) || norm2.startsWith(norm1);
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
        let sortedMatchNodesEndLines = []
        sortedChangedNodes.forEach(i => { if (i.node.d.endLineNumber) sortedMatchNodesEndLines.push(i) })
        let startLineMatchNodeIndex = 0;
        let endLineMatchNodeIndex = 0;
        let currentMatchStartLine = () => sortedChangedNodes[startLineMatchNodeIndex].node.d.lineNumber;
        let currentMatchEndLine = () => sortedMatchNodesEndLines[endLineMatchNodeIndex].node.d.endLineNumber;
        let lineOffset = 0;
        let indexInOriginalContent = 0
        // calculate offset for each match. we go over the merged lines, increasing/decreasing offset as we meet '+'/'-'.
        // we increase these in the matching match nodes by checking line number
        let diff = this.diffLib(fileNode.d.fileContent, newFile.content)
        let diffAsArray = diff.split('\n')
        diffAsArray.forEach((diffLine, index) => {
            if (diffLine.startsWith('+')) { lineOffset++; return; }
            if (startLineMatchNodeIndex < sortedChangedNodes.length && indexInOriginalContent === currentMatchStartLine()) {
                let updatedMatchNode = sortedChangedNodes[startLineMatchNodeIndex];
                updatedMatchNode.startOffset = lineOffset;
                const indexInNewContent = indexInOriginalContent + lineOffset
                updatedMatchNode.originalLineText = originalFileContentAsArray[indexInOriginalContent];
                updatedMatchNode.newLineText = newContentAsArray[indexInNewContent];
                updatedMatchNode.originalIndex = indexInOriginalContent
                updatedMatchNode.indexInNewContent = indexInNewContent
                startLineMatchNodeIndex++;
            }
            if (endLineMatchNodeIndex < sortedMatchNodesEndLines.length && indexInOriginalContent === currentMatchEndLine()) {
                sortedMatchNodesEndLines[endLineMatchNodeIndex].endOffset = lineOffset;
                endLineMatchNodeIndex++;
            }

            if (diffLine.startsWith('-')) lineOffset--
            indexInOriginalContent++
        });
        return sortedChangedNodes;
    }

} 