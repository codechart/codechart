import type {
  BasePath,
  ClassDefinition,
  DiagramEdge,
  DiagramFile,
  DiagramGroup,
  DiagramIssue,
  DiagramModel,
  DiagramNode,
  GitAlias,
  LegendEntry,
  OverlapRef,
} from './types';

const COMMENT_PREFIX = '%%';
const FLOWCHART_RE = /^\s*(flowchart|graph)\s+([A-Za-z]+)/;
const DESC_RE = /^%%\s*desc:([^=]+?)\s*=\s*(.*)$/;
const DIAGRAM_RE = /^%%\s*diagram:\s*(.*)$/;
const BASE_PATH_RE = /^%%\s*basePath:([^=]+?)\s*=\s*(.*)$/;
const GIT_URL_RE = /^%%\s*gitUrl:([^=]+?)\s*=\s*(.*)$/;
const LEGEND_RE = /^%%\s*legend:([^=]+?)\s*=\s*(.*)$/;
const CLASS_DEF_RE = /^\s*classDef\s+([A-Za-z0-9_-]+)\s+(.+)$/;
const SUBGRAPH_RE = /^\s*subgraph\s+([A-Za-z0-9_-]+)\s+(?:\["([^"]*)"\]|\[([^\]]*)\]|(.+))\s*$/;
const EDGE_RE = /^\s*([A-Za-z0-9_-]+)\s*([-.=xo<>]*-[-.=>xo<>]*)\s*([A-Za-z0-9_-]+)\s*$/;
const CLASS_ONLY_RE = /^\s*([A-Za-z0-9_-]+)((?:::[A-Za-z0-9_-]+)+)\s*$/;
const BARE_REFERENCE_RE = /^\s*([A-Za-z0-9_-]+)\s*$/;
const NODE_RE = /^\s*([A-Za-z0-9_-]+)(.*)$/;

interface ParseContext {
  model: DiagramModel;
  pendingDescriptions: Record<string, string>;
  groupStack: string[];
  fileStack: string[];
  membershipReferences: Map<string, Set<string>>;
  nodesInSubgraphs: Map<string, Set<string>>;
}

export function extractMermaidSource(input: string): string {
  const block = input.match(/```mermaid\s*([\s\S]*?)```/i);
  return (block?.[1] ?? input).trim();
}

export function parseMermaid(input: string): DiagramModel {
  const source = extractMermaidSource(input);
  const model: DiagramModel = {
    source,
    direction: 'TD',
    basePaths: {},
    gitAliases: {},
    legend: [],
    classDefs: {},
    nodes: {},
    files: {},
    groups: {},
    edges: [],
    orphanDescriptions: {},
    issues: [],
  };

  const context: ParseContext = {
    model,
    pendingDescriptions: {},
    groupStack: [],
    fileStack: [],
    membershipReferences: new Map(),
    nodesInSubgraphs: new Map(),
  };

  const lines = source.split(/\r?\n/);
  for (const [lineIndex, line] of lines.entries()) {
    parseLine(context, line, lineIndex + 1);
  }

  applyDescriptions(context);
  applyMemberships(context);
  detectUnusedBasePaths(model);
  detectMissingLegendEntries(model);
  detectOverlaps(model);

  return model;
}

function parseLine(context: ParseContext, line: string, lineNumber: number): void {
  const trimmed = line.trim();
  if (!trimmed) return;

  const flowchartMatch = trimmed.match(FLOWCHART_RE);
  if (flowchartMatch) {
    context.model.direction = flowchartMatch[2];
    return;
  }

  if (trimmed.startsWith(COMMENT_PREFIX)) {
    parseComment(context, trimmed, lineNumber);
    return;
  }

  if (trimmed === 'end') {
    const groupOrFile = context.groupStack.pop();
    if (groupOrFile?.startsWith('file_')) {
      context.fileStack.pop();
    }
    return;
  }

  const subgraphMatch = line.match(SUBGRAPH_RE);
  if (subgraphMatch) {
    parseSubgraph(context, subgraphMatch, lineNumber);
    return;
  }

  const classDefMatch = line.match(CLASS_DEF_RE);
  if (classDefMatch) {
    context.model.classDefs[classDefMatch[1]] = {
      id: classDefMatch[1],
      styles: parseStyleList(classDefMatch[2]),
    };
    return;
  }

  const edgeMatch = line.match(EDGE_RE);
  if (edgeMatch) {
    context.model.edges.push({
      id: `e${context.model.edges.length + 1}`,
      from: edgeMatch[1],
      operator: edgeMatch[2],
      to: edgeMatch[3],
      raw: trimmed,
    });
    return;
  }

  const classOnlyMatch = line.match(CLASS_ONLY_RE);
  if (classOnlyMatch) {
    addClassMemberships(context, classOnlyMatch[1], parseClasses(classOnlyMatch[2]));
    addCurrentContainerMembership(context, classOnlyMatch[1]);
    return;
  }

  const bareReferenceMatch = line.match(BARE_REFERENCE_RE);
  if (bareReferenceMatch && context.groupStack.length > 0) {
    addCurrentContainerMembership(context, bareReferenceMatch[1]);
    return;
  }

  const nodeMatch = line.match(NODE_RE);
  if (nodeMatch) {
    parseNode(context, nodeMatch[1], nodeMatch[2], lineNumber);
  }
}

function parseComment(context: ParseContext, line: string, lineNumber: number): void {
  const diagramMatch = line.match(DIAGRAM_RE);
  if (diagramMatch) {
    context.model.diagramDescription = appendDescription(context.model.diagramDescription, diagramMatch[1]);
    return;
  }

  const descMatch = line.match(DESC_RE);
  if (descMatch) {
    context.pendingDescriptions[descMatch[1].trim()] = limitDescription(descMatch[2], context.model.issues, descMatch[1].trim());
    return;
  }

  const basePathMatch = line.match(BASE_PATH_RE);
  if (basePathMatch) {
    const parsed = parseBasePath(basePathMatch[1].trim(), basePathMatch[2].trim());
    context.model.basePaths[parsed.name] = parsed;
    return;
  }

  const gitUrlMatch = line.match(GIT_URL_RE);
  if (gitUrlMatch) {
    const alias = gitUrlMatch[1].trim();
    context.model.gitAliases[alias] = { alias, url: gitUrlMatch[2].trim() };
    return;
  }

  const legendMatch = line.match(LEGEND_RE);
  if (legendMatch) {
    context.model.legend.push({
      color: legendMatch[1].trim(),
      meaning: legendMatch[2].trim(),
    });
    return;
  }

  addIssue(context.model, 'info', null, `Ignored unsupported comment on line ${lineNumber}: ${line}`);
}

function parseSubgraph(context: ParseContext, match: RegExpMatchArray, lineNumber: number): void {
  const id = match[1];
  const title = (match[2] ?? match[3] ?? match[4] ?? '').trim();
  const parentGroupId = currentGroup(context);

  if (id.startsWith('file_')) {
    const file = parseFileSubgraph(context, id, title, parentGroupId, lineNumber);
    context.model.files[id] = file;
    context.fileStack.push(id);
  } else {
    context.model.groups[id] = {
      id,
      type: 'group',
      name: title || id,
      parentGroupId,
      childIds: [],
      classes: [],
    };
  }

  if (parentGroupId) {
    context.model.groups[parentGroupId]?.childIds.push(id);
  }
  context.groupStack.push(id);
}

function parseFileSubgraph(
  context: ParseContext,
  id: string,
  title: string,
  parentGroupId: string | undefined,
  lineNumber: number,
): DiagramFile {
  const fields = title.split(/\s+\|\s+/).map((part) => part.trim()).filter(Boolean);
  if (fields.length < 2 || fields.length > 3) {
    addIssue(context.model, 'warning', id, `File subgraph on line ${lineNumber} expected "path | identifier | git=..." title.`);
  }

  const pathParts = parsePath(fields[0] ?? '', context.model.basePaths);
  const gitUrl = resolveGitUrl(fields.find((field) => field.startsWith('git='))?.slice(4), pathParts.basePathName, context.model);
  markBasePathUsed(context.model, pathParts.basePathName);

  return {
    id,
    type: 'file',
    rawTitle: title,
    path: fields[0] ?? '',
    relativePath: pathParts.relativePath,
    basePathName: pathParts.basePathName,
    identifier: fields[1] ?? '',
    gitUrl,
    classes: [],
    primaryGroupId: parentGroupId,
    groupIds: parentGroupId ? [parentGroupId] : [],
    childIds: [],
    compositeId: `${gitUrl}|${pathParts.relativePath}|${fields[1] ?? ''}`,
  };
}

function parseNode(context: ParseContext, id: string, rest: string, lineNumber: number): void {
  const classes = parseClasses(rest);
  const label = extractLabel(rest);
  const shape = rest.replace(/:::[A-Za-z0-9_-]+/g, '').trim();
  const primaryGroupId = currentGroup(context);
  const groupIds = new Set<string>();
  if (primaryGroupId) groupIds.add(primaryGroupId);
  classes.forEach((classId) => groupIds.add(classId));

  const node: DiagramNode = {
    id,
    type: 'unknown',
    rawLabel: label,
    shape,
    classes,
    primaryGroupId,
    groupIds: Array.from(groupIds),
    overlaps: [],
  };

  const code = parseCodeLabel(label, context.model, id, lineNumber);
  if (code) {
    node.type = 'code';
    node.code = code;
    node.compositeId = `${code.gitUrl}|${code.relativePath}|${code.startLine}|${code.endLine}|${code.identifier}`;
  } else if (label && isNoteShape(shape)) {
    node.type = 'note';
    node.note = label;
  } else {
    addIssue(context.model, 'warning', id, `Label "${label || rest.trim()}" does not match any known flowchart node pattern.`);
  }

  context.model.nodes[id] = node;
  addClassMemberships(context, id, classes);
  addCurrentContainerMembership(context, id);
}

function parseCodeLabel(label: string, model: DiagramModel, nodeId: string, lineNumber: number): DiagramNode['code'] | null {
  const fields = label.split('<br/>').map((field) => field.trim());
  if (fields.length !== 3 && fields.length !== 4) return null;

  const range = fields[1].match(/^(\d+)\s*-\s*(\d+)$/);
  if (!range) return null;

  let startLine = Number(range[1]);
  let endLine = Number(range[2]);
  if (endLine < startLine) {
    [startLine, endLine] = [endLine, startLine];
    addIssue(model, 'warning', nodeId, `Line range on line ${lineNumber} is reversed; stored as ${startLine}-${endLine}.`);
  }

  const pathParts = parsePath(fields[0], model.basePaths);
  markBasePathUsed(model, pathParts.basePathName);
  const gitField = fields.find((field) => field.startsWith('git='))?.slice(4);
  const gitUrl = resolveGitUrl(gitField, pathParts.basePathName, model);
  if (!fields[2]) {
    addIssue(model, 'warning', nodeId, 'Identifier field is empty and may collide with another node.');
  }

  return {
    path: fields[0],
    basePathName: pathParts.basePathName,
    relativePath: pathParts.relativePath,
    startLine,
    endLine,
    identifier: fields[2],
    gitUrl,
  };
}

function applyDescriptions(context: ParseContext): void {
  for (const [id, description] of Object.entries(context.pendingDescriptions)) {
    if (context.model.nodes[id]) {
      context.model.nodes[id].description = description;
    } else if (context.model.files[id]) {
      context.model.files[id].description = description;
    } else if (context.model.groups[id]) {
      context.model.groups[id].name = description;
    } else {
      context.model.orphanDescriptions[id] = description;
      addIssue(context.model, 'info', id, `Description references "${id}", but no matching node, file, or group exists.`);
    }
  }
}

function applyMemberships(context: ParseContext): void {
  for (const [id, groupIds] of context.membershipReferences.entries()) {
    const entity = context.model.nodes[id] ?? context.model.files[id];
    if (!entity) continue;
    const allGroups = new Set(entity.groupIds);
    groupIds.forEach((groupId) => allGroups.add(groupId));
    entity.groupIds = Array.from(allGroups);
  }

  for (const [containerId, childIds] of context.nodesInSubgraphs.entries()) {
    if (containerId.startsWith('file_')) {
      const file = context.model.files[containerId];
      if (file) file.childIds = Array.from(new Set([...file.childIds, ...childIds]));
    } else {
      const group = context.model.groups[containerId];
      if (group) group.childIds = Array.from(new Set([...group.childIds, ...childIds]));
      for (const childId of childIds) {
        const entity = context.model.nodes[childId] ?? context.model.files[childId];
        if (entity) {
          entity.groupIds = Array.from(new Set([...entity.groupIds, containerId]));
          entity.primaryGroupId ??= containerId;
        }
      }
    }
  }

  for (const entity of [...Object.values(context.model.nodes), ...Object.values(context.model.files)]) {
    for (const groupId of entity.groupIds) {
      if (!context.model.groups[groupId] && !context.model.files[groupId]) {
        context.model.groups[groupId] = {
          id: groupId,
          type: 'group',
          name: humanizeSlug(groupId),
          childIds: [entity.id],
          classes: [],
        };
        if (!context.model.classDefs[groupId]) {
          addIssue(context.model, 'info', entity.id, `Referenced group/class "${groupId}" was not declared; created a deterministic placeholder group.`);
        }
      }
    }
  }
}

function detectUnusedBasePaths(model: DiagramModel): void {
  for (const basePath of Object.values(model.basePaths)) {
    if (!basePath.used) {
      addIssue(model, 'info', null, `Base path "${basePath.name}" is declared but never referenced.`);
    }
  }
}

function detectMissingLegendEntries(model: DiagramModel): void {
  const legendColors = new Set(model.legend.map((entry) => entry.color.toLowerCase()));
  for (const classDef of Object.values(model.classDefs)) {
    const fill = classDef.styles.fill?.toLowerCase();
    if (fill && !legendColors.has(fill)) {
      addIssue(model, 'info', classDef.id, `Class "${classDef.id}" uses ${fill}, but the legend has no matching description.`);
    }
    const textColor = classDef.styles.color?.toLowerCase();
    if (fill && textColor && textColor !== '#ffffff') {
      addIssue(model, 'info', classDef.id, `Class "${classDef.id}" uses non-white label color ${textColor}.`);
    }
  }
}

function detectOverlaps(model: DiagramModel): void {
  const codeNodes = Object.values(model.nodes).filter((node) => node.type === 'code' && node.code);
  for (let i = 0; i < codeNodes.length; i += 1) {
    for (let j = i + 1; j < codeNodes.length; j += 1) {
      const a = codeNodes[i];
      const b = codeNodes[j];
      if (!a.code || !b.code) continue;
      if (a.code.gitUrl !== b.code.gitUrl || a.code.relativePath !== b.code.relativePath) continue;
      const startLine = Math.max(a.code.startLine, b.code.startLine);
      const endLine = Math.min(a.code.endLine, b.code.endLine);
      if (startLine <= endLine) {
        const aOverlap: OverlapRef = { nodeId: b.id, startLine, endLine };
        const bOverlap: OverlapRef = { nodeId: a.id, startLine, endLine };
        a.overlaps.push(aOverlap);
        b.overlaps.push(bOverlap);
        addIssue(model, 'warning', a.id, `${a.id} overlaps with ${b.id} on lines ${startLine}-${endLine}.`);
      }
    }
  }
}

function parseBasePath(name: string, raw: string): BasePath {
  const gitMatch = raw.match(/\s+git=([^\s]+)$/);
  return {
    name,
    localPath: gitMatch ? raw.slice(0, gitMatch.index).trim() : raw,
    gitAlias: gitMatch?.[1],
    used: false,
  };
}

function parseStyleList(styleSource: string): Record<string, string> {
  return Object.fromEntries(
    styleSource
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...value] = part.split(':');
        return [key.trim(), value.join(':').trim()];
      }),
  );
}

function parsePath(rawPath: string, basePaths: Record<string, BasePath>): { basePathName?: string; relativePath: string } {
  const match = rawPath.match(/^@([^/]+)\/(.+)$/);
  if (match) {
    return { basePathName: match[1], relativePath: match[2] };
  }
  if (basePaths.default) {
    return { basePathName: 'default', relativePath: rawPath };
  }
  return { relativePath: rawPath };
}

function resolveGitUrl(rawGit: string | undefined, basePathName: string | undefined, model: DiagramModel): string {
  if (rawGit) {
    return model.gitAliases[rawGit]?.url ?? rawGit;
  }
  const alias = basePathName ? model.basePaths[basePathName]?.gitAlias : undefined;
  return alias ? model.gitAliases[alias]?.url ?? alias : '';
}

function markBasePathUsed(model: DiagramModel, basePathName: string | undefined): void {
  if (basePathName && model.basePaths[basePathName]) {
    model.basePaths[basePathName].used = true;
  }
}

function extractLabel(rest: string): string {
  const withoutClasses = rest.replace(/:::[A-Za-z0-9_-]+/g, '').trim();
  const quoted = withoutClasses.match(/["']([^"']*)["']/);
  if (quoted) return quoted[1];
  const note = withoutClasses.match(/>\s*([^\]]+)\]/);
  if (note) return note[1].trim();
  return '';
}

function parseClasses(source: string): string[] {
  return Array.from(source.matchAll(/:::([A-Za-z0-9_-]+)/g)).map((match) => match[1]);
}

function addClassMemberships(context: ParseContext, entityId: string, classes: string[]): void {
  if (!classes.length) return;
  const existing = context.membershipReferences.get(entityId) ?? new Set<string>();
  classes.forEach((classId) => existing.add(classId));
  context.membershipReferences.set(entityId, existing);
}

function addCurrentContainerMembership(context: ParseContext, entityId: string): void {
  for (const containerId of context.groupStack) {
    const children = context.nodesInSubgraphs.get(containerId) ?? new Set<string>();
    children.add(entityId);
    context.nodesInSubgraphs.set(containerId, children);
  }
}

function currentGroup(context: ParseContext): string | undefined {
  return [...context.groupStack].reverse().find((id) => !id.startsWith('file_'));
}

function isNoteShape(shape: string): boolean {
  return shape.trim().startsWith('>');
}

function appendDescription(existing: string | undefined, next: string): string {
  return existing ? `${existing}<br/>${next}` : next;
}

function limitDescription(description: string, issues: DiagramIssue[], nodeId: string): string {
  const parts = description.split('<br/>');
  if (parts.length > 3) {
    issues.push({
      id: `issue_${issues.length + 1}`,
      severity: 'info',
      nodeId,
      message: `Description for "${nodeId}" has more than 3 lines and was truncated.`,
    });
  }
  return parts.slice(0, 3).join('<br/>');
}

function humanizeSlug(slug: string): string {
  return slug.replace(/^g_/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function addIssue(model: DiagramModel, severity: DiagramIssue['severity'], nodeId: string | null, message: string): void {
  model.issues.push({
    id: `issue_${model.issues.length + 1}`,
    severity,
    nodeId,
    message,
  });
}
