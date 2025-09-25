export const LlmToWebviewPrompt = `Only when I request a Cochart Diagram, follow these instructions:

Only when I request a Cochart Diagram, follow these instructions:

## Cochart Diagrams

### General Description
Cochart diagrams visually represent code relationships, where each node corresponds to a line of code, and links denote logical relationships between them. The diagram can show various relationships: execution flow, variable usage, inheritance structure, dependencies, or any other code relationships requested.

### Two-Step Process
#### Step 1: Build Main Code Flow (CODE nodes only)
Create the main relationship chain using ONLY CODE nodes:
- CODE → CODE → CODE → CODE...
- Each CODE node connects to the previous CODE node in the logical flow
- There could be different logical flows branching from same code node. 
- First CODE node has \`connectedTo: 0\`
    - This step is always required and forms the core of the diagram

#### Step 2: Add Planning Annotations (TODO nodes - OPTIONAL)
**TODO nodes are optional and only needed when planning work is requested.**
Many diagrams will have NO TODO nodes - they simply show existing code relationships.

When TODO nodes are needed:
- Add them after completing the main code flow
- Each TODO node points to ONE specific CODE node where work is needed
- TODO → CODE connections only
- TODO nodes do NOT connect to other TODO nodes
- TODO nodes are NOT part of the main flow

#### Connection Rules (CRITICAL)
- ✅ **CODE → CODE**: Main flow connections
- ✅ **TODO → CODE**: Planning annotations (when TODO nodes are used)
- ❌ **CODE → TODO**: FORBIDDEN
- ❌ **TODO → TODO**: FORBIDDEN

### Node Types and Field Usage

**CODE nodes** (main relationship flow):
- \`id\`: single running number sequence, starting from 1
- \`label\`: **what the existing code currently does** (e.g., "Filter state interface", "Data preparation function")
- \`filePath\`: **RELATIVE PATH ONLY** to existing file (never full/absolute paths)
- \`lineContent\`: **EXACT EXISTING LINE** of code content from the file
- \`lineNumber\`: line number in file
- \`connectedTo\`: id of previous CODE node in relationship flow (0 for first node)
- \`linkLabel\`: optional connection description

**TODO nodes** (optional planning annotations):
- \`id\`: continues the same running number sequence as CODE nodes
- \`type\`: "todo"
- \`label\`: **what needs to be done, or description of something**. IF its a todo, start with "TODO:" (e.g., "TODO: Add new field", "TODO: Modify parameters"). if not just put the label (e.g "Github Action runner")
- \`content\`: planning details, suggested code, or work description **formatted with \n for line breaks to prevent overflow**
- \`connectedTo\`: id of CODE node where this work is needed
- \`linkLabel\`: optional connection description
- **OMIT**: filePath, lineContent, lineNumber (TODO nodes don't reference existing code)

### Output Format
by default, write ito into /cochart/cochart.tmp.json file.
user might asks to write in a different file
do not print on screen, only in file

\`\`\`json
[{
    "id": number,              // single running sequence for all nodes, starting with 1
    "label": string,           // CODE: what code does; TODO: what needs doing
    "filePath": string,        // CODE nodes only - RELATIVE PATH
    "lineContent": string,     // CODE nodes only - EXISTING LINE
    "lineNumber": number,      // CODE nodes only
    "connectedTo": number,     // 0 for first CODE node, otherwise previous node id
    "linkLabel": string,       // optional
    "type": "todo",           // TODO nodes only
    "content": string         // TODO nodes only - use \n for line breaks
}]
\`\`\`

## user descrption
the user will tell you what to do, and what he wants to see: user wrote: $ARGUMENT
try to follow his request, shile adhearing to the guidelined above

\`\`\``;

export const LlmReadDiagramPrompt = `Read the diagram in the given file.
Cochart diagrams visually represent code relationships, where each node corresponds to a line of code, and links denote logical relationships between them. The diagram can show various relationships: execution flow, variable usage, inheritance structure, dependencies, or any other code relationships requested.

The structure will be as follows:

**CODE nodes** (main relationship flow):
- \`id\`: single running number sequence, starting from 1
- \`label\`: what the existing code currently does (e.g., "Filter state interface", "Data preparation function")
- \`filePath\`: RELATIVE PATH ONLY to existing file (never full/absolute paths)
- \`lineContent\`: EXACT EXISTING LINE of code content from the file
- \`lineNumber\`: line number in file
- \`connectedTo\`: id of previous CODE node in relationship flow (0 for first node)
- \`linkLabel\`: optional connection description

**GENERAL nodes** (optional planning annotations):
- \`id\`: continues the same running number sequence as CODE nodes
- \`type\`: "todo"/"section"/"remark". ignore "boundaryNode"
- \`label\`: what needs to be done, or description of something
- \`content\`: details
- \`connectedTo\`: id of CODE node where this work is needed
- \`linkLabel\`: optional connection description

The JSON structure is:
[{
  "id": number,
  "label": string,
  "type": string (optional),
  "content": string (optional),
  "filePath": string (optional),
  "lineNumber": number (optional),
  "lineContent": string (optional),
  "connectedTo": number or array
}]`;

const WebviewToLlmPrompt = `
`

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
        root.forEach(async (currentRoot) => {
            const rootNode = await this.processChild(currentRoot);
            addedItems.set(rootNode.id, rootNode as VisiNode)

            this.selectNode(rootNode);

            // Process all children of the root
            await this.processChildren(currentRoot, items, rootNode, addedItems);

            this.selectNode(rootNode);
        })


        window.setTimeout(()=>{this.chartActions.positionNonMatchNodes(Array.from(addedItems.values()))}, 100)
    }

    public mapForLlmJson(): string {
        const allEdges = this.chartWrapper.getAllEdges(i => true);
        const savedIds: { originalId: string, incremental: number }[] = []        // Get all nodes and filter out filename nodes using ChartUtils  
        const allNodes = this.chartWrapper.getAllNodes(i => true).filter(node => {
            return (!ChartUtils.isFilenameNode(node) && (node as VisiNode).d.type !== NodeTypes.boundaryNode);
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
