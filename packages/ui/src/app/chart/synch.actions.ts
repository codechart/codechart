import { AppComponent } from '../app.component';
import { ChartWrapper } from './chart.wrapper';
import { ChartUtils } from './chart.utils';
import { CreateUtils } from './create.utils';
import { Utils } from './Utils';
import { FileId, FileNode, MatchNode, VisiNode, ReloadFilesResponse } from '../types.nodejs';
import { Edge, IdType, Node } from 'vis';
import { diffLines, findSimilarLine, isSimilarLine } from '../text-diff/text.comparison';
import { NodeChange } from '../text-diff/textDiffTypes';



export interface ReloadOptions {
    addFailedReloadToDiagram?: boolean;
    markNullFiles?: boolean;
}

export class SynchActions {
    private chart: ChartWrapper;
    
    constructor(private app: AppComponent) {
    }

    initialize() {
        this.chart = this.app.chart;
    }

    public reloadAllFileNodes(files: ReloadFilesResponse[], options: ReloadOptions = { markNullFiles: true }): number {
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

        return newNodesAndItems.filter((i: MatchNode) => { return (ChartUtils.isMatchNode(i) && i.d.type === 'failedSync') }).length
    }



    public reloadSingleFileNode(fileNode: FileNode, newFile: ReloadFilesResponse, options: ReloadOptions): Array<Node | Edge> {
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
        console.log('Starting file comparison');
        
        // Fix originalIndex values before calling diffLines
        sortedSuspectItems.forEach(item => {
            if (item.node.d && typeof item.node.d.lineNumber === 'number') {
                item.originalIndex = item.node.d.lineNumber;
                if (originalFileContentAsArray[item.originalIndex]) {
                    item.originalLineText = originalFileContentAsArray[item.originalIndex];
                }
            }
        });
        
        // Preserve original text before diffLines corrupts it
        const preservedOriginalText = new Map();
        sortedSuspectItems.forEach(item => {
            preservedOriginalText.set(item.node.id, item.originalLineText);
        });
        
        const sortedChangedItems = this.diffLines(sortedSuspectItems, fileNode, newFile, originalFileContentAsArray, newContentAsArray);
        // update matches and file node
        let failedNodes: Node[] = []
        let changedNodes: MatchNode[] = sortedChangedItems.map((i: NodeChange) => {
            try {
                let newLineText = i.newLineText;
                let newLineNumber = i.indexInNewContent;

                const originalText = preservedOriginalText.get(i.node.id) || i.originalLineText;
                const lineAtNewPosition = newLineNumber >= 0 ? newContentAsArray[newLineNumber] : null;
                
                if (newLineNumber === -1 || (lineAtNewPosition && !lineAtNewPosition.includes(originalText.trim()))) {
                    if (i.newLineText === '' || i.newLineText.trim() === '') {
                        let similarIndex = findSimilarLine(originalText, newContentAsArray, 
                            i.originalIndex - 1);
                        
                        if (similarIndex !== null) {
                            console.log(`Found similar line at position ${similarIndex}`);
                            i.node.d.line = newContentAsArray[similarIndex];
                            i.node.d.lineNumber = similarIndex;
                            i.node.d.endLineNumber = similarIndex;
                            return i.node;
                        } else {
                            failedNodes = failedNodes.concat(this.addFailedReloadToArray(i.node, i.originalLineText, options));
                            return i.node;
                        }
                    } else {
                        failedNodes = failedNodes.concat(this.addFailedReloadToArray(i.node, i.originalLineText, options));
                        return i.node;
                    }
                }

                if (!isSimilarLine(i.newLineText, i.originalLineText)) {
                    let similarIndex = findSimilarLine(i.originalLineText, newContentAsArray, newLineNumber);

                    if (similarIndex !== null) {
                        newLineText = newContentAsArray[similarIndex];
                        newLineNumber = similarIndex;
                        i.node.d.line = newLineText;
                        i.node.d.lineNumber = newLineNumber;
                        i.node.d.endLineNumber = newLineNumber;
                    } else {
                        // similar line not found – treat as failed reload
                        failedNodes = failedNodes.concat(this.addFailedReloadToArray(i.node, "?", options));
                    }
                }
                else {
                    i.node.d.line = newLineText;
                    i.node.d.lineNumber = newLineNumber;
                    i.node.d.endLineNumber = newLineNumber;
                }

                return i.node;

            } catch (ex) {
                returnedItems = returnedItems.concat(this.addFailedReloadToArray(i.node, "?", options));
                return i.node;
            }
        });
        
        console.log('Line mapping completed');
        return changedNodes.concat(failedNodes as MatchNode[]);
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
        return diffLines(sortedChangedNodes, fileNode, newFile, originalFileContentAsArray, newContentAsArray);
    }
    
} 