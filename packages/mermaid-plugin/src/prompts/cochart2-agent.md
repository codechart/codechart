---
description: Draw a code-aware mermaid diagram for cochart2 (interactive viewer)
argument-hint: [what to diagram]
---

# cochart2 diagram request

The user wants a Mermaid flowchart following the cochart2 convention. They will paste it into the cochart2 webapp for interactive code exploration. Output it into a file prefixed with `memraid`.

## What the user wants diagrammed

$ARGUMENTS

## Your job

1. Investigate the code first. Read the relevant files in the workspace. Find actual filepaths and inclusive line ranges for every code region you reference. Do not invent line numbers or filepaths. If you cannot verify a referenced symbol, say so and stop.
2. Produce a Mermaid `flowchart` following the cochart2 convention below.
3. Output only the diagram, in a single fenced ` ```mermaid ` block. No surrounding prose unless the user asked for explanation.

## The cochart2 convention

### Two Field Separators

- Use `<br/>` between fields inside node labels.
- Use ` | ` with spaces between fields inside file subgraph titles.
- Do not use `<br/>` in subgraph titles. Mermaid subgraph titles have a wrapping/overlap bug, so file titles stay single-line.

### Header Comments

Declare shared metadata at the top:

```mermaid
%% diagram: One-line description.<br/>Up to 3 lines, separated by <br/>.
%% basePath:NAME = LOCAL_PATH git=GIT_NAME
%% gitUrl:GIT_NAME = github.com/owner/repo
%% legend:#HEXCOLOR = what this color means
%% desc:NODE_ID = Node description.<br/>Up to 3 lines.
```

- Each `basePath` can reference a `gitUrl` by name.
- Use multiple `basePath` declarations for multi-repo diagrams.
- Declare a `legend` entry for every `classDef` fill color.
- `desc` is optional but valuable. Up to 3 lines, separated by `<br/>`.

### Code Section Nodes

A code node is a contiguous code region. Use Mermaid markdown strings:

```mermaid
n1["`**identifier**<br/>@basepath/relative/path<br/>15-58`"]:::class
```

- The visible node face should show the bold identifier and filepath. The line range is still included in the source so cochart2 can parse it, but the webapp hides that row after render.
- `@basepath/` is required and must reference a declared base path.
- Line range is `start-end`, inclusive.
- Identifier is the function, method, variable, or a short descriptive name for an anonymous block.
- Optional 4th field `git=NAME` can override the base path git URL for rare cross-repo cases.
- Backward compatibility: older plain labels like `path<br/>15-58<br/>identifier` may exist, but new diagrams should use markdown strings with `**identifier**` first.

### File Nodes Are File Subgraphs

A file is represented as a subgraph with an ID prefixed `file_`. The subgraph IS the file node. Do not create a separate file node.

```mermaid
subgraph file_jwt ["@backend/src/auth/jwt.ts | jwt-module"]
  n3["`**validateToken**<br/>@backend/src/auth/jwt.ts<br/>15-58`"]:::g_security
  n4["`**signToken**<br/>@backend/src/auth/jwt.ts<br/>62-80`"]:::g_security
end
```

- Title fields use ` | `: path, identifier, optional `git=NAME`.
- File subgraphs can be edge targets: `n2 -->|"reads"| file_jwt`.
- If a file has one code region and does not need to be edge-targetable, a standalone code node is fine.

### Group Subgraphs

Logical groups use subgraphs whose IDs do not start with `file_`.

```mermaid
subgraph g_auth [Authentication]
  n2
  file_jwt
end
```

Groups can nest. A node can belong to multiple groups by combining subgraph containment with class assignments.

### Note Nodes

Use notes sparingly for architectural callouts:

```mermaid
n7>"Tokens are HS256 with 24h expiry"]
```

### Edges

Edges may carry short visible labels when the relationship is not obvious:

```mermaid
n1 -->|"submits"| n2
n3 -.->|"uses"| n4
```

- Use `-->` for primary flow, calls, ownership, or direct dependency.
- Use `-.->` for secondary flow, "uses", weak coupling, or contextual links.
- No edge IDs.
- No edge descriptions.
- Labels only. Keep labels short. Omit a label when the meaning is obvious from nearby node names and context.
- Edge label color should be left as Mermaid's default black.

### Color Rules

- `classDef` fills must be saturated dark colors with `color:#ffffff`.
- Pastel and light fills are not allowed.
- Always include a darker stroke.
- Add a `%% legend:#color = meaning` for every fill color.

Recommended palette:

- HTTP / boundary: `fill:#1f6feb,stroke:#0b3a8a,color:#ffffff`
- Security / critical: `fill:#b91c1c,stroke:#7f1d1d,color:#ffffff`
- Data layer: `fill:#15803d,stroke:#14532d,color:#ffffff`
- Computation: `fill:#a16207,stroke:#713f12,color:#ffffff`
- External / third-party: `fill:#6b21a8,stroke:#3b0764,color:#ffffff`

### Node IDs

Use short stable IDs: `n1`, `n2`, `n3`, `file_<short-name>`, and `g_<short-name>`. Keep IDs stable when iterating on an existing diagram.

## Checklist Before Responding

- [ ] All filepaths and line ranges are verified against actual files.
- [ ] Every `@basepath/` prefix is declared at the top.
- [ ] Every `gitUrl:NAME` referenced by a base path is declared.
- [ ] Every `classDef` fill has a matching `%% legend:`.
- [ ] All `classDef` fills are saturated dark colors with `color:#ffffff`.
- [ ] Code labels use markdown strings with bold identifiers.
- [ ] Code labels include line ranges as the final field, even though cochart2 hides them visually.
- [ ] Subgraph titles use ` | `, not `<br/>`.
- [ ] Node labels use `<br/>`, not ` | `.
- [ ] File subgraphs have `file_` prefix and are the file nodes.
- [ ] Edges use labels only when useful: `n1 -->|"label"| n2`.
- [ ] No edge IDs or edge descriptions.
- [ ] Output is wrapped in a single ` ```mermaid ` fenced block.
- [ ] No prose around the diagram unless explicitly requested.
