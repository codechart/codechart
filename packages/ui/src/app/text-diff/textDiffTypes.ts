import { MatchNode } from '../types.nodejs';

export interface NodeChange {
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