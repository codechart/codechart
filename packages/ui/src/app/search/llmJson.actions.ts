import { LlmToWebviewPrompt, LlmReadDiagramPrompt, WebviewToLlmPrompt } from './llmJson.prompts';
import { Edge, IdType, Node as VisNode } from 'vis';
import { AppComponent, ProjectPath } from '../app.component';
import { ChartActions } from '../chart/chart.actions';
import { ChartUtils } from '../chart/chart.utils';
import { ChartWrapper } from '../chart/chart.wrapper';
import { MatchNode, VisiNode, SearchEnum, MatchInfo, VisiEdge } from '../types.nodejs';
import { SearchActions } from './search.actions';
import { NodeTypes } from '../chart/chart.consts';

export interface LlmJsonItem {
    lineNumber?: number,
    filePath?: string,
    label: string,
    connectedTo: number | number[],
    id: number,
    lineContent?: string,
    linkLabel?: string,
    type?: NodeTypes
    content?: string
}

/*asda*/ export class LlmJsonActions {
    projectPath: ProjectPath;
    constructor(
        private chartWrapper: ChartWrapper,
        private searchActions: SearchActions,
        private chartActions: ChartActions,
        private appComponent: AppComponent
    ) { }

    public parseLlmJson(jsonString: string): LlmJsonItem[] {
        try {
            const initialItems: LlmJsonItem[] = JSON.parse(jsonString);
            const items = this.expandConnectedTo(initialItems)

            items.forEach((item, i) => {
                // Basic validation for all nodes
                if (!item.hasOwnProperty('id')) throw new Error(`Missing id field in item ${i}`);
                if (typeof item.id !== 'number') throw new Error(`Invalid id field in item ${i}`);
                if (!item.hasOwnProperty('label')) throw new Error(`Missing label in item ${item.id}`);
                if (typeof item.label !== 'string') throw new Error(`Invalid label in item ${item.id}`);
                if (!item.hasOwnProperty('connectedTo')) throw new Error(`Missing connectedTo in item ${item.id}`);
                if (
                    typeof item.connectedTo !== 'number' &&
                    !(
                        Array.isArray(item.connectedTo) &&
                        item.connectedTo.every((v: any) => typeof v === 'number')
                    )
                ) {
                    throw new Error(`Invalid connectedTo in item ${item.id}`);
                }

                // Handle TODO nodes differently from CODE nodes
                if (item.type === 'todo') {
                    // Validate TODO node specific fields
                    if (!item.hasOwnProperty('content')) throw new Error(`Missing content in TODO item ${item.id}`);
                    if (typeof item.content !== 'string') throw new Error(`Invalid content in TODO item ${item.id}`);
                } else {
                    // Validate CODE node required fields
                    if (!item.hasOwnProperty('filePath')) throw new Error(`Missing filePath in item ${item.id}`);
                    if (typeof item.filePath !== 'string') throw new Error(`Invalid filePath in item ${item.id}`);
                    if (!item.hasOwnProperty('lineContent')) throw new Error(`Missing lineContent in item ${item.id}`);
                    if (typeof item.lineContent !== 'string') throw new Error(`Invalid lineContent in item ${item.id}`);
                    if (!item.hasOwnProperty('lineNumber')) throw new Error(`Missing lineNumber in item ${item.id}`);
                    if (typeof item.lineNumber !== 'number') throw new Error(`Invalid lineNumber in item ${item.id}`);

                    // Ensure filePath is relative
                    if (item.filePath.startsWith('/') || item.filePath.match(/^[A-Za-z]:\\/)) {
                        throw new Error(`filePath must be relative in item ${item.id}: ${item.filePath}`);
                    }
                }
            });

            return items;

        } catch (e) {
            throw new Error('Failed to parse items: ' + e.message);
        }

    }

    private normalizePath(filePath: string) {
        let normalizedPath = filePath.replace(/\\/g, '/')
        normalizedPath = normalizedPath.startsWith(this.projectPath.localPath)
            ? normalizedPath.substring((this.projectPath.localPath).length)
            : normalizedPath
        return normalizedPath
    }
    private async loadNode(jsonItem: LlmJsonItem): Promise<VisiNode> {
        const normalizedFullPath = this.normalizePath(jsonItem.filePath);

        let results: VisNode[] = null
        try {
            // Use search around line with unlimited radius
            results = await this.searchActions.searchAroundLine(normalizedFullPath, jsonItem.lineNumber, jsonItem.lineContent, null, true);
        } catch (e) {
            console.error(`Error loading node: ${e.message}`);
            throw e;
        }

        if(results.length===0) {
            const message = `node ${jsonItem.id}, ${jsonItem.filePath}: ${jsonItem.lineContent}`
            if(this.appComponent.ideConnect.getIsInIde())
                this.appComponent.addMessage("failed fetching", message, -1)
            else
                this.appComponent.ideConnect.ideJsMessage("failed fetching: " + message)
        }

        const matchNode = results.filter(i => ChartUtils.isMatchNode(i))[0] as MatchNode;
        const matchEdge = results.filter(i => ChartUtils.isMatchEdge(i))[0] as VisiEdge
        this.chartActions.setItemTitle(matchNode, jsonItem.label);
        if (jsonItem.linkLabel && matchEdge) this.chartActions.setItemTitle(matchEdge, jsonItem.linkLabel)
        return matchNode;
    }

    /**
     * Selects a node in the chart
     */
    private selectNode(node: VisiNode): void {
        this.chartWrapper.setSelection({ nodes: [node.id], edges: [] });
    }

    private delay(ms: number): Promise<void> {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
    }

    /**
     * Processes all children of a given parent node.
     *
     * For each child:
     *   1. Load the child by adding it as a search match
     *   2. If the child has children, select it as the active node
     *   3. Process the child's own children before moving to the next sibling
     *   4. After finishing a child's branch, re-select the parent if more siblings exist
     */
    private async processChildren(parentItem: LlmJsonItem, childrenItems: LlmJsonItem[], parentNode: VisiNode, addedItems: Map<IdType, VisiNode>): Promise<void> {
        console.log('processing', parentItem, childrenItems)
        // Get all nodes directly connected to the parent
        const children = childrenItems.filter(n => n.connectedTo === parentItem.id);

        for (let i = 0; i < children.length; i++) {
            const child = children[i];

            // Load the child
            let childNode = await this.processChild(child)
            addedItems.set(childNode.id, childNode)

            // If the child has children, select it
            const childHasChildren = childrenItems.some(n => n.connectedTo === child.id);
            if (childHasChildren) {
                this.selectNode(childNode);
            }

            // Process this child's children before moving on
            await this.processChildren(child, childrenItems, childNode, addedItems);

            // After processing child's branch, if there is a next sibling,
            // re-select the parent node
            if (i < children.length - 1) {
                this.selectNode(parentNode);
            }
        }
    }

    public async processChild(child: LlmJsonItem): Promise<VisiNode> {
        if (child.type === 'todo') {
            return this.appComponent.createToDoNode(false, child.content, child.label)
        } else {
            return await this.loadNode(child);
        }
    }

    /**
     * Processes all nodes starting from the root.
     * @param items Array of LlmJsonItems to process
     */
    public async processAllItems(items: LlmJsonItem[], projectPath: ProjectPath): Promise<void> {
        this.projectPath = projectPath
        const root = items.filter(n => (n.connectedTo === 0));
        if (!root) {
            throw new Error("Root node not found");
        }

        // For the root node, load it and then select it
        const addedItems = new Map<IdType, VisiNode>();
        for (const currentRoot of root) {
            const rootNode = await this.processChild(currentRoot);
            addedItems.set(rootNode.id, rootNode as VisiNode)

            this.selectNode(rootNode);

            // Process all children of the root
            await this.processChildren(currentRoot, items, rootNode, addedItems);

            this.selectNode(rootNode);
        }


        window.setTimeout(()=>{
            this.chartActions.positionNonMatchNodes(Array.from(addedItems.values()))
        }, 100)
    }

    private isNodeExcludedForLlm(node: VisNode) {
        !ChartUtils.isFilenameNode(node)
        && ChartUtils.isFileNode(node)
        && (node as VisiNode).d.type !== NodeTypes.boundaryNode
    }

    public mapForLlmJson(): string {
        const allEdges = this.chartWrapper.getAllEdges(i => true);
        const savedIds: { originalId: string, incremental: number }[] = []        // Get all nodes and filter out filename nodes using ChartUtils
        const allNodes = this.chartWrapper.getAllNodes(i => true).filter(node => {
            return (this.isNodeExcludedForLlm(node));
        }); const resultJson: LlmJsonItem[] = allNodes
            .map((node: VisiNode, index: number) => {
                savedIds.push({ originalId: node.id as string, incremental: index + 1 });
                const type = node.d.type

                if (ChartUtils.isMatchNode(node)) {
                    // Handle CODE nodes (MatchNode) using ChartUtils methods
                    const matchNode = node as MatchNode;
                    const ofFileNode = ChartUtils.getOfFileId(matchNode);
                    return {
                        id: index + 1,
                        label: matchNode.label,
                        filePath: ofFileNode.path,
                        lineNumber: ChartUtils.getLineNumber(matchNode),
                        lineContent: ChartUtils.getLine(matchNode),
                        connectedTo: null,
                        type: type
                    }
                } else {

                    // Handle TODO nodes and other node types - try different content properties
                    const content = ChartUtils.isCustomNode(node) ? ChartUtils.getFileNodeContent(node) : ""

                    return {
                        id: index + 1,
                        label: node.label,
                        type: type,
                        content: content,
                        connectedTo: null
                    }
                }
            })// Process connections using the savedIds map to convert original IDs to incremental IDs
        resultJson.forEach((resultItem, index) => {
            const originalId = savedIds[index].originalId
            const connectedEdges = allEdges.filter(edge => edge.to === originalId)

            if (connectedEdges.length === 0) {
                resultItem.connectedTo = 0 // Default if not connected to anything
            } else {
                // Map from original IDs to incremental IDs
                const connectedIncrementalIds = connectedEdges.map(edge => {
                    const connectedId = savedIds.find(mapping => mapping.originalId === edge.from)
                    return connectedId ? connectedId.incremental : null
                }).filter(i => i !== null)

                // Use array for multiple connections, single number for just one connection
                resultItem.connectedTo = connectedIncrementalIds.length === 1 ?
                    connectedIncrementalIds[0] :
                    connectedIncrementalIds
            }
        })

        console.log(resultJson.map(i => i.connectedTo))
        return JSON.stringify(resultJson)
    }

    private expandConnectedTo(nodes: any[]): any[] {
        const expandedNodes: any[] = [];

        nodes.forEach((node) => {
            if (Array.isArray(node.connectedTo)) {
                node.connectedTo.forEach((targetId, index) => {
                    const newNode = {
                        ...node,
                        id: node.id,
                        connectedTo: targetId
                    };
                    expandedNodes.push(newNode);
                });
            } else {
                expandedNodes.push(node);
            }
        });

        return expandedNodes;
    }

}
