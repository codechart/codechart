export const LlmToWebviewPrompt = `
describe your answer as code: a json, an array of objects , in this format: 
[{
id: number // running id,
label: string // human explanation,
filePath: string // relative path to file in project, 
lineNumber: number // line number in file, 
lineContent: string // the actual content of the line to search for,
connectedTo: number // id of node logically previous in flow 
}] 
start with id 1, the first node is connected 0
`

const WebviewToLlmPrompt = `
describe the code you see in following json array include relevant code sections
<JSON>
`

import { Edge } from 'vis';
import { ProjectPath } from '../app.component';
import { ChartActions } from '../chart/chart.actions';
import { ChartUtils } from '../chart/chart.utils';
import { ChartWrapper } from '../chart/chart.wrapper';
import { MatchNode, VisiNode, SearchEnum } from '../types.nodejs';
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
        const searchObject = {
            projectPath: this.projectPath,
            searchPath: normalizedFullPath,
            filenamePattern: null,
            isFileNameRegex: false,
            isRegex: false,
            flags: 'gi',
            originalText: '',
            pattern: jsonItem.lineContent,
            title: null,
            lineNumbers: null
        };
        const results = await this.searchActions.doSearch(searchObject, SearchEnum.searchInFile);
        const matchNode = results.filter(i=>ChartUtils.isMatchNode(i))[0] as VisiNode;
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
        const allEdges = this.chartWrapper.getAllEdges(i=>true)
        const savedIds: {originalId, incremental}[] = []
        const resultJson: LlmJsonItem[] =this.chartWrapper.getAllMatchNodes().map((node: MatchNode, index: number)=>{
            savedIds.push({originalId: node.id, incremental: index})
            return {
                id: index,
                label: node.label,
                filePath: node.d.ofFile.path,
                lineNumber: node.d.lineNumber,
                lineContent: node.d.line,
                connectedTo: allEdges
                    .filter(edge => edge.to === node.id)
                    .map(edge => edge.id as any)
            }
        })
        resultJson.map((resultItem) => {
            resultItem.connectedTo = savedIds
                .filter(id => id.originalId === resultItem.connectedTo)
                .map(j=>j.incremental)
                .filter(id => id !== undefined)
            return resultItem;
        });
        return JSON.stringify(resultJson)
    }
}
