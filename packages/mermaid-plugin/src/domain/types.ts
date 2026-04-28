export type NodeType = 'code' | 'note' | 'unknown';
export type EntityType = NodeType | 'file' | 'group';
export type IssueSeverity = 'error' | 'warning' | 'info';

export interface DiagramIssue {
  id: string;
  severity: IssueSeverity;
  nodeId: string | null;
  message: string;
}

export interface BasePath {
  name: string;
  localPath: string;
  gitAlias?: string;
  used: boolean;
}

export interface GitAlias {
  alias: string;
  url: string;
}

export interface LegendEntry {
  color: string;
  meaning: string;
}

export interface ClassDefinition {
  id: string;
  styles: Record<string, string>;
}

export interface CodeLocation {
  path: string;
  basePathName?: string;
  relativePath: string;
  resolvedPath?: string;
  startLine: number;
  endLine: number;
  identifier: string;
  gitUrl: string;
}

export interface DiagramNode {
  id: string;
  type: NodeType;
  rawLabel: string;
  shape: string;
  description?: string;
  classes: string[];
  primaryGroupId?: string;
  groupIds: string[];
  compositeId?: string;
  code?: CodeLocation;
  note?: string;
  overlaps: OverlapRef[];
}

export interface DiagramFile {
  id: string;
  type: 'file';
  rawTitle: string;
  path: string;
  basePathName?: string;
  relativePath: string;
  identifier: string;
  gitUrl: string;
  description?: string;
  classes: string[];
  primaryGroupId?: string;
  groupIds: string[];
  childIds: string[];
  compositeId: string;
}

export interface DiagramGroup {
  id: string;
  type: 'group';
  name: string;
  parentGroupId?: string;
  childIds: string[];
  classes: string[];
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  operator: string;
  label?: string;
  raw: string;
}

export interface OverlapRef {
  nodeId: string;
  startLine: number;
  endLine: number;
}

export interface DiagramModel {
  source: string;
  direction: string;
  diagramDescription?: string;
  basePaths: Record<string, BasePath>;
  gitAliases: Record<string, GitAlias>;
  legend: LegendEntry[];
  classDefs: Record<string, ClassDefinition>;
  nodes: Record<string, DiagramNode>;
  files: Record<string, DiagramFile>;
  groups: Record<string, DiagramGroup>;
  edges: DiagramEdge[];
  orphanDescriptions: Record<string, string>;
  issues: DiagramIssue[];
}

export type DiagramEntity = DiagramNode | DiagramFile | DiagramGroup;
