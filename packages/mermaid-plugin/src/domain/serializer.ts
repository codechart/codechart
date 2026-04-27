import type { DiagramModel } from './types';

export function serializeMermaid(model: DiagramModel): string {
  const lines: string[] = [];

  if (model.diagramDescription) {
    lines.push(`%% diagram: ${model.diagramDescription}`);
  }

  for (const basePath of Object.values(model.basePaths)) {
    const git = basePath.gitAlias ? ` git=${basePath.gitAlias}` : '';
    lines.push(`%% basePath:${basePath.name} = ${basePath.localPath}${git}`);
  }

  for (const gitAlias of Object.values(model.gitAliases)) {
    lines.push(`%% gitUrl:${gitAlias.alias} = ${gitAlias.url}`);
  }

  for (const entry of model.legend) {
    lines.push(`%% legend:${entry.color} = ${entry.meaning}`);
  }

  for (const entity of [...Object.values(model.files), ...Object.values(model.nodes)]) {
    if (entity.description) {
      lines.push(`%% desc:${entity.id} = ${entity.description}`);
    }
  }

  lines.push('', `flowchart ${model.direction}`);

  const emitted = new Set<string>();
  const fileChildIds = new Set(Object.values(model.files).flatMap((file) => file.childIds));
  for (const file of Object.values(model.files)) {
    lines.push(`  subgraph ${file.id} ["${file.rawTitle}"]`);
    for (const childId of file.childIds) {
      const node = model.nodes[childId];
      if (node) {
        lines.push(`    ${serializeNode(node.id, node.rawLabel, node.shape, node.classes)}`);
        emitted.add(node.id);
      }
    }
    lines.push('  end', '');
  }

  for (const node of Object.values(model.nodes)) {
    if (!emitted.has(node.id) && !fileChildIds.has(node.id)) {
      lines.push(`  ${serializeNode(node.id, node.rawLabel, node.shape, node.classes)}`);
      emitted.add(node.id);
    }
  }

  const topLevelGroups = Object.values(model.groups).filter((group) => !group.parentGroupId);
  for (const group of topLevelGroups) {
    serializeGroup(model, group.id, lines, emitted, 1);
  }

  if (model.edges.length) {
    lines.push('');
    for (const edge of model.edges) {
      lines.push(`  ${edge.from} ${edge.operator} ${edge.to}`);
    }
  }

  const classDefs = Object.values(model.classDefs);
  if (classDefs.length) {
    lines.push('');
    for (const classDef of classDefs) {
      const styles = Object.entries(classDef.styles).map(([key, value]) => `${key}:${value}`).join(',');
      lines.push(`  classDef ${classDef.id} ${styles}`);
    }
  }

  return lines.join('\n').trimEnd();
}

function serializeGroup(model: DiagramModel, groupId: string, lines: string[], emitted: Set<string>, depth: number): void {
  const group = model.groups[groupId];
  if (!group) return;
  const indent = '  '.repeat(depth);
  lines.push('', `${indent}subgraph ${group.id} [${group.name}]`);

  for (const childId of group.childIds) {
    if (model.groups[childId]) {
      serializeGroup(model, childId, lines, emitted, depth + 1);
    } else if (model.files[childId]) {
      lines.push(`${indent}  ${childId}`);
    } else if (model.nodes[childId]) {
      lines.push(`${indent}  ${childId}`);
      emitted.add(childId);
    }
  }

  lines.push(`${indent}end`);
}

function serializeNode(id: string, rawLabel: string, shape: string, classes: string[]): string {
  const classText = classes.map((classId) => `:::${classId}`).join('');
  if (shape.startsWith('>')) {
    return `${id}>"${rawLabel}"]${classText}`;
  }
  return `${id}["${rawLabel}"]${classText}`;
}
