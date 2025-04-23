export const LlmToWebviewPrompt = `
## COVALENT DIAGRAMS
when I ask for a Covalent diagram, AND ONL WHEN I ASK FOR A COVALENT DIAGRAM, follow these instructions:
### How to a write Covalent diagram
#### general description
Here you find instructions how to write a Covalent diagram
how to write results, and what should be the logic

### how to describe logic
#### general
- we want to follow high level logic first, with branches for lower level logic, inner logic, declerations and configurations
- we want to describe logic as branch in the tree. inner logic goes seperately into a new branch
- we want a reasonable amount of nodes, not too many, not too few
- dont go too much into details

#### detailed
- follow logic, making nodes for method calls, or other actios, linked to each other.
- inner logic for actions start a new branch
- each method call is  linked to its implementation, and to the next logical step/action/method
- method implementations start a new branch of the tree
- type declarations are connected to where they are used first
- think of every inner method as another logic branch, repeating same concepts for this branch

#### output format

[{
id: number // running id, starting with 1
label: string // human explanation, not more than a few words, but meaningful
filePath: string // relative path to file in project,
lineContent: string // the actual content of the line to search for
connectedTo: number // id of node logically previous in flow. 0 for first
lineNumber: number // line number in file, 0 if refering to file as a whole
}]
`

const WebviewToLlmPrompt = `
describe the code you see in following json array include relevant code sections
<JSON>
`

import { Edge, Node as VisNode } from 'vis';
import { ProjectPath } from '../app.component';
import { ChartActions } from '../chart/chart.actions';
import { ChartUtils } from '../chart/chart.utils';
import { ChartWrapper } from '../chart/chart.wrapper';
import { MatchNode, VisiNode, SearchEnum, MatchInfo } from '../types.nodejs';
import { SearchActions } from './search.actions';

export interface LlmJsonItem {
    lineNumber: number,
    filePath: string,
    label: string,
    connectedTo: number | number[],
    id: number,
    lineContent: string
}

export class LlmJsonActions {
    projectPath: ProjectPath;
    constructor(
        private chartWrapper: ChartWrapper,
        private searchActions: SearchActions,
        private chartActions: ChartActions
    ) { }

    public parseLlmJson(jsonString: string): LlmJsonItem[] {
        try {
            const items: LlmJsonItem[] = JSON.parse(jsonString);

            items.forEach((item, i) => {
                if (!item.hasOwnProperty('lineNumber')) throw new Error(`Missing lineNumber in item ${item.id}`);
                if (!item.hasOwnProperty('filePath')) throw new Error(`Missing filePath in item ${item.id}`);
                if (!item.hasOwnProperty('label')) throw new Error(`Missing label in item ${item.id}`);
                if (!item.hasOwnProperty('connectedTo')) throw new Error(`Missing connectedTo in item ${item.id}`);
                if (!item.hasOwnProperty('id')) throw new Error(`Missing id field in item ${i}`);
                if (!item.hasOwnProperty('lineContent')) throw new Error(`Missing lineContent in item ${item.id}`);

                if (typeof item.lineNumber !== 'number') throw new Error(`Invalid lineNumber in item ${item.id}`);
                if (typeof item.filePath !== 'string') throw new Error(`Invalid filePath in item ${item.id}`);
                if (typeof item.label !== 'string') throw new Error(`Invalid label in item ${item.id}`);
                if (typeof item.connectedTo !== 'number') throw new Error(`Invalid connectedTo in item ${item.id}`);
                if (typeof item.id !== 'number') throw new Error(`Invalid id field in item ${i}`);
                if (typeof item.lineContent !== 'string') throw new Error(`Invalid lineContent in item ${item.id}`);
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
            results = await this.searchActions.searchFile(normalizedFullPath, jsonItem.lineContent);
            if (results.length === 0) {
                results = await this.searchActions.searchLineInFile(normalizedFullPath, jsonItem.lineNumber)
            }
        } catch (e) {
            console.error(`Error loading node: ${e.message}`);
            throw e;
        }

        const matchNode = results.filter(i => ChartUtils.isMatchNode(i))[0] as MatchNode;

        this.chartActions.setNodeTitle(matchNode, jsonItem.label);
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
    private async processChildren(parentItem: LlmJsonItem, childrenItems: LlmJsonItem[], parentNode: VisiNode): Promise<void> {
        // Get all nodes directly connected to the parent
        const children = childrenItems.filter(n => n.connectedTo === parentItem.id);

        for (let i = 0; i < children.length; i++) {
            const child = children[i];

            // Load the child
            const childNode = await this.loadNode(child);

            // If the child has children, select it
            const childHasChildren = childrenItems.some(n => n.connectedTo === child.id);
            if (childHasChildren) {
                this.selectNode(childNode);
            }

            // Process this child's children before moving on
            await this.processChildren(child, childrenItems, childNode);

            // After processing child's branch, if there is a next sibling,
            // re-select the parent node
            if (i < children.length - 1) {
                this.selectNode(parentNode);
            }
        }
    }

    /**
     * Processes all nodes starting from the root.
     * @param items Array of LlmJsonItems to process
     */
    public async processAllItems(items: LlmJsonItem[], projectPath: ProjectPath): Promise<void> {
        this.projectPath = projectPath
        const root = items.find(n => n.connectedTo === 0);
        if (!root) {
            throw new Error("Root node not found");
        }

        // For the root node, load it and then select it
        const rootNode = await this.loadNode(root);

        this.selectNode(rootNode);

        // Process all children of the root
        await this.processChildren(root, items, rootNode);

        this.selectNode(rootNode);
    }

    public mapForLlmJson(): string {
        const allEdges = this.chartWrapper.getAllEdges(i => true)
        const savedIds: { originalId: string, incremental: number }[] = []
        const resultJson: LlmJsonItem[] = this.chartWrapper.getAllMatchNodes().map((node: MatchNode, index: number) => {
            savedIds.push({ originalId: node.id as string, incremental: index })
            return {
                id: index,
                label: node.label,
                filePath: node.d.ofFile.path,
                lineNumber: node.d.lineNumber,
                lineContent: node.d.line,
                connectedTo: null
            }
        })

        // Process connections using the savedIds map to convert original IDs to incremental IDs
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
                }).filter(i=>i!==null)

                // Use array for multiple connections, single number for just one connection
                resultItem.connectedTo = connectedIncrementalIds.length === 1 ?
                    connectedIncrementalIds[0] :
                    connectedIncrementalIds
            }
        })

        console.log(resultJson.map(i=>i.connectedTo))
        return JSON.stringify(resultJson)
    }
}
