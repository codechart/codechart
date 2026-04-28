import { describe, expect, it } from 'vitest';
import happyPath from '../fixtures/happy-path.mmd?raw';
import messy from '../fixtures/messy.mmd?raw';
import { parseMermaid } from './parser';
import { serializeMermaid } from './serializer';
import { deterministicGroupSlug } from './slugs';

describe('parseMermaid', () => {
  it('parses the happy-path fixture into the JSON mirror', () => {
    const model = parseMermaid(happyPath);

    expect(model.direction).toBe('TD');
    expect(Object.keys(model.nodes)).toHaveLength(6);
    expect(Object.keys(model.files)).toEqual(['file_jwt', 'file_users']);
    expect(model.nodes.n3.code?.relativePath).toBe('src/auth/jwt.ts');
    expect(model.nodes.n3.code?.identifier).toBe('validateToken');
    expect(model.nodes.n3.code?.startLine).toBe(15);
    expect(model.nodes.n3.code?.endLine).toBe(58);
    expect(model.nodes.n3.code?.gitUrl).toBe('github.com/me/api');
    expect(model.files.file_jwt.childIds).toEqual(['n3', 'n4']);
    expect(model.nodes.n2.groupIds).toContain('g_http');
    expect(model.nodes.n2.groupIds).toContain('g_auth');
    expect(model.edges[0]).toMatchObject({ from: 'n1', operator: '-->', label: 'submits login', to: 'n2' });
    expect(model.legend).toHaveLength(3);
    expect(model.issues).toEqual([]);
  });

  it('keeps import forgiving and surfaces messy fixture issues', () => {
    const model = parseMermaid(messy);

    expect(model.nodes.n1.code?.startLine).toBe(42);
    expect(model.nodes.n1.code?.endLine).toBe(58);
    expect(model.nodes.n1.overlaps).toEqual([{ nodeId: 'n2', startLine: 50, endLine: 58 }]);
    expect(model.nodes.n3.type).toBe('unknown');
    expect(model.orphanDescriptions.n99).toBe('orphan description');
    expect(model.issues.map((issue) => issue.severity)).toContain('warning');
    expect(model.issues.map((issue) => issue.severity)).toContain('info');
  });

  it('round-trips through serialize and parse without losing core semantics', () => {
    const first = parseMermaid(happyPath);
    const second = parseMermaid(serializeMermaid(first));

    expect(Object.keys(second.nodes).sort()).toEqual(Object.keys(first.nodes).sort());
    expect(Object.keys(second.files)).toEqual(Object.keys(first.files));
    expect(second.nodes.n3.compositeId).toBe(first.nodes.n3.compositeId);
    expect(second.files.file_jwt.compositeId).toBe(first.files.file_jwt.compositeId);
    expect(second.edges).toEqual(first.edges);
    expect(serializeMermaid(first)).toContain('n1 -->|"submits login"| n2');
    expect(serializeMermaid(first)).toContain('n3["`**validateToken**<br/>@backend/src/auth/jwt.ts<br/>15-58`"]');
  });
});

describe('deterministicGroupSlug', () => {
  it('creates stable group IDs with collision suffixes', () => {
    expect(deterministicGroupSlug('Auth module', new Set())).toBe('g_auth_module');
    expect(deterministicGroupSlug('Auth module', new Set(['g_auth_module']))).toBe('g_auth_module_2');
  });
});
