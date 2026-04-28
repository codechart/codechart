# PRD — Interactive Mermaid Diagram Webapp

**Status:** Draft v5 — testing section added, file-as-subgraph cleanup
**Owner:** Michael
**Last updated:** 2026-04-27

---

## 1. Vision

A webapp that turns Claude-authored mermaid diagrams of code into an interactive workspace. Claude annotates code with a diagram; the user explores it, regroups nodes, sets base paths, and exports the modified diagram back to Claude. The diagram is a shared, round-trippable artifact between Claude and a human reading code — not a one-way visualization.

Mermaid is the only wire format. Claude reads and writes mermaid following a strict label convention. The webapp parses mermaid into an internal JSON mirror that drives all interactions and serializes back to mermaid on export.

V1 is a standalone webapp. V2 adds a VS Code plugin (clicks open files at line ranges). V3 adds MCP integration so Claude can drive the diagram directly. V1 architecture must keep these futures cheap.

---

## 2. Users and use cases

**Primary user:** a software engineer using Claude (in chat, Claude Code, etc.) to understand or refactor a codebase.

**Core use cases:**

- "Claude gave me a mermaid diagram explaining how auth works across 6 files. I want to click each node and see exactly which lines it refers to, group them by concern, and ask Claude to refine the diagram with my groupings."
- "I have two diagrams from two different Claude sessions covering overlapping parts of the codebase. I want to merge them and see where they overlap."
- "I want a stable, exportable artifact that captures my mental model of a code area, that I can re-share with Claude weeks later and have Claude pick up where we left off."

**Non-users (V1):** people without Claude in their workflow. The format and conventions are designed for Claude round-trips; using the tool without Claude is possible but not the target.

---

## 3. Core concepts

### 3.1 Node types

- **Code section** — a contiguous line range in a file. Has filepath, start line, end line, identifier (function/method/variable name or descriptive label).
- **File** — a whole file. Always rendered as a mermaid subgraph with an ID prefixed `file_`. The subgraph IS the file node — clickable, edge-targetable, contains zero or more code nodes belonging to that file. Multiple file subgraphs for the same filepath are allowed; the identifier disambiguates them.
- **Group** — a non-file container for nodes. Renders as a mermaid subgraph (without `file_` prefix). Nestable. A node may belong to multiple groups (multi-membership via mermaid classes).
- **Note / description** — text-only node, may be standalone or attached to another node.

Node type is **determined by syntactic position**: a `subgraph` with `file_` prefix is a file; a regular `subgraph` is a group; a node within a flowchart is a code section or note based on label content. Shape is rendering-only and preserved on round-trip.

### 3.2 Composite ID

Every node has a composite ID computed by the webapp at parse time. Stored in the JSON mirror, never written by Claude.

- **Code section:** `gitUrl|filepath|startLine|endLine|identifier`
- **File:** `gitUrl|filepath|identifier`
- `gitUrl` is per-node. Empty string if not provided.
- Literal string format (not hashed). Trade-off: ~60 bytes per ID, debuggable, no concern at any realistic diagram size.

The composite ID is what enables overlap detection and cross-diagram merging.

### 3.3 Base paths

Named base paths, declared in mermaid as comments and referenced from labels with `@name/` prefix.

```
%% basePath:backend = c:/proj/api
%% basePath:frontend = c:/proj/web
```

Inside a label, `@backend/src/auth.ts` resolves to `c:/proj/api/src/auth.ts`. With a single default base path, the prefix can be omitted.

UI lets the user remap names → real local paths. Names are stable across machines; paths are local. This is what makes diagrams portable across machines and works for monorepos and cross-repo diagrams.

### 3.4 Git URL

Per-node, optional. Allows two nodes with the same filepath but different repos to be distinguished. Stored alongside other label fields; included in the composite ID computation.

### 3.5 Groups and multi-membership

- Visual nesting via mermaid `subgraph` (one primary group per node).
- Logical multi-group membership via mermaid classes (`:::g_auth :::g_security`).
- A node's full group membership is the union of its containing subgraph and its applied classes.

### 3.6 Colors and legend

- Claude assigns colors and explains them in a legend stored as comments in the mermaid source.
- Persistent colors live in the mermaid source via `classDef` and class application. Visible in any mermaid viewer, round-trip-safe.
- The webapp UI palette is a fallback for groups created via UI multiselect; Claude refines on the next round-trip.

### 3.7 JSON mirror

The JSON mirror is the runtime model. It is built by parsing mermaid on import and updated on every UI action. On export, it is serialized back to mermaid following the label convention.

The JSON mirror is **internal to the webapp**. It is not a wire format. Claude never produces or consumes it directly.

### 3.8 The label convention

The contract Claude must follow when writing mermaid for this tool. Detailed in section 5.

---

## 4. Functional requirements (V1)

Each requirement has an ID and acceptance criteria.

### F-1 — Import mermaid

Accept a markdown document containing a mermaid block, or raw mermaid.

**Acceptance:**
- Paste-in textarea + file upload both supported.
- Mermaid renders to SVG using the unmodified source.
- A separate parser pass extracts metadata into the JSON mirror.
- Import never fails. All issues are surfaced in an issues panel (see F-9).

### F-2 — Click-to-message

Clicking any rendered node shows that node's metadata in a side panel.

**Acceptance:**
- Side panel shows: filepath, line range (if any), identifier, base path resolved to full local path, git URL (if any), groups (all of them), description, color reason from legend.
- "Copy as `path:line`" button on code nodes.
- "Copy filepath" button on file nodes.
- Clicking the same node toggles the panel closed.
- Architecture: click handler reads mermaid ID from the SVG element, looks up the JSON mirror. No mermaid `click` directives used. (V2 will swap the panel content for "open in VS Code"; the click → lookup pipeline stays.)

### F-3 — Settable base paths

UI panel lists all named base paths declared in the diagram. User can edit the local path mapping for each name.

**Acceptance:**
- Editing a base path's local value updates side-panel "full path" displays immediately.
- Base path mappings persist in browser `localStorage` across sessions, keyed by base path name.
- Same base path name across different diagrams shares the same local mapping (intentional — one machine, one `c:/proj/api`).
- Base path names declared in mermaid but never referenced are listed as info issues, not removed.

### F-4 — Multi-select and group creation

User can multi-select nodes (shift/ctrl+click) and create a new group from the selection.

**Acceptance:**
- Selected nodes get a transient highlight (Channel B styling, no re-render).
- "Create group" prompt asks for group name. Color is auto-assigned from a fallback palette without asking.
- New group appears in the diagram as a subgraph or class application (whichever fits the existing structure better — subgraph if no overlaps, class otherwise).
- Mermaid source is regenerated and re-rendered (Channel A).
- Selection persists across the re-render (tracked by mermaid ID).
- **The user does not create nodes via the UI — only groups.** All node creation flows through Claude.

### F-5 — Group nesting and multi-membership

Groups can nest. A node can belong to multiple groups.

**Acceptance:**
- Nested subgraphs render correctly.
- A node with multiple class assignments shows all groups in the side panel.
- Removing a node from one group does not affect its other group memberships.

### F-6 — Export mermaid

User can export the current diagram as mermaid text, ready to paste back to Claude.

**Acceptance:**
- Export reproduces all metadata: labels in convention format, comments for base paths and legend, classes for groups, descriptions for nodes that have them.
- Round-trip is stable: import → no UI changes → export produces equivalent mermaid (whitespace and ordering may differ; semantics must match).
- "Copy to clipboard" and "download .md" both available.

### F-7 — Description and explanation areas

Per-node and per-diagram descriptions. Stored in mermaid as comments.

**Acceptance:**
- Node-level descriptions: comment line `%% desc:n5 = ...` immediately above the node declaration.
- Descriptions support up to 3 lines, separated by `<br/>` within the comment value.
- Diagram-level description: comment block at top, same 3-line limit.
- Side panel shows node description; a separate "diagram info" panel shows diagram description.
- Descriptions editable in UI; edits round-trip back to comments on export.
- Lines beyond the 3rd are truncated on save with an info issue.

### F-8 — Color legend

Legend is stored as comments and shown in a UI panel.

**Acceptance:**
- Legend entries: `%% legend:#f88 = security-critical`.
- UI legend panel lists all colors used in the diagram with their meanings.
- Colors used in `classDef` but not in legend show as "(no description)" with an info issue.

### F-9 — Issue panel

All parser issues are surfaced in a dedicated panel. Nothing is silently discarded.

**Acceptance:**
- Each issue has: severity (error / warning / info), node ID (or null for diagram-level), human-readable message.
- Panel is always visible (collapsed if no issues).
- Issues are copyable as a block, formatted for pasting back to Claude.
- Concrete issue examples are documented in section 7.

### F-10 — Overlap detection

Two nodes referencing the same `gitUrl|filepath` with intersecting line ranges are flagged.

**Acceptance:**
- Detection runs after every import and after every Channel A edit.
- Both nodes get an overlap-warning class (Channel B styling).
- Side panel shows: "Overlaps with: [other node identifier] on lines [intersection]".
- Containment counts as overlap (range A fully inside range B).
- Never auto-merged. User may manually merge into one node.

### F-11 — Manual merge

User selects two overlapping nodes and explicitly merges them into one.

**Acceptance:**
- Merge dialog shows both nodes' metadata side by side.
- User chooses which fields to keep (or types new values).
- Result is a single node with the chosen fields.
- Edges from both originals are preserved on the merged node.
- Operation is undoable.

### F-12 — "Copy prompt for Claude"

Button that emits a prepared prompt + the current diagram for pasting back to Claude.

**Acceptance:**
- Prompt includes: a brief description of the label convention, the user's request (typed in a small textarea), the current diagram in mermaid form.
- Stable text; user edits only their request.
- One-click copy.

### F-13 — Re-prompt with issues

When import produces a high rate of `unknown`-type nodes (threshold: 30%+ of nodes, or any error-severity issue), the issue panel shows a "Re-prompt Claude" button.

**Acceptance:**
- Button copies a prompt containing: the label convention reference, the current (broken) diagram, the issue list, and a request to fix the diagram.
- Threshold is configurable (constant in code for V1, settings panel later).
- Button visible only when threshold exceeded; otherwise the regular "Copy prompt for Claude" (F-12) is the path.

### F-14 — File subgraphs (Claude-declared)

When Claude wants to group code regions belonging to the same file, Claude wraps them in a subgraph whose ID is prefixed `file_`. The file subgraph IS the file node — there is no separate file node.

**Acceptance:**
- Subgraph IDs prefixed `file_` are recognized by the parser as file containers.
- The subgraph title encodes file metadata using single-line format with `|` separator: `path | identifier | git=...` (the `<br/>` separator is reserved for non-subgraph labels because mermaid does not reliably wrap subgraph titles — issue #3806).
- The subgraph is clickable. Clicking it opens the side panel with file metadata.
- Code nodes inside the subgraph belong logically to that file.
- Edges may target the subgraph ID directly: `n2 --> file_jwt`.
- Description comments target the subgraph ID: `%% desc:file_jwt = ...`.
- Color classes apply via mermaid's class-on-subgraph syntax.
- Parser does NOT auto-create file subgraphs from same-file code nodes. Grouping is Claude's editorial decision.

### F-15 — Color contrast policy

All `classDef` background colors used in diagrams must support white labels with clear readability.

**Acceptance:**
- Convention spec mandates: `classDef` declarations include `color:#ffffff` and use medium-to-dark saturated background fills.
- Pastel or light backgrounds are out of policy. The convention's example palette is dark blue, dark red, dark green, dark purple, dark amber.
- Webapp does not enforce this at runtime — the prompt template instructs Claude to follow the policy. UI flags low-contrast combinations as info issues only.

---

## 5. Wire format spec — label convention

This is the contract Claude must follow.

### 5.1 Field separator

Two separators, each with a clear use:

- **`<br/>` between fields inside node labels.** Visually clean when rendered, no character collision risk.
- **` | ` between fields inside subgraph titles.** Subgraphs require single-line titles because mermaid does not reliably wrap them (mermaid issue #3806, open since 2022). Pipe separator with surrounding spaces.

### 5.2 Code section node

```
n1["@backend/src/auth.ts<br/>42-58<br/>validateToken<br/>git=github.com/me/api"]
```

Fields, in order:
1. Path with optional `@basepath/` prefix
2. Line range as `start-end`
3. Identifier (function/method/variable name)
4. Optional `git=...` for git URL

If only one base path exists with name `default`, the `@default/` prefix may be omitted.

### 5.3 File node (always a subgraph)

```
subgraph file_auth ["@backend/src/auth.ts | auth-module | git=github.com/me/api"]
  n3["..."]
  n4["..."]
end
```

The subgraph ID is prefixed `file_`. The subgraph IS the file node — no separate node syntax exists for files.

Title fields, in order:
1. Path with optional `@basepath/` prefix
2. Identifier (filename or alias)
3. Optional `git=...`

Subgraphs may contain zero or more code nodes. A file with a single code region still uses a subgraph if Claude wants the file to be addressable.

### 5.4 Note node

```
n3>"Free-form explanatory note"]
```

Single field: the text. No metadata to extract beyond the label.

### 5.5 Group (subgraph)

```
subgraph g_auth [Authentication]
  n1
  n2
end
```

Subgraph ID (`g_auth`) is the group ID. Bracketed text is the human-readable name. Nesting allowed.

### 5.6 Multi-group membership

```
n1:::g_auth:::g_security
```

Multiple class applications. Each class corresponds to a group ID.

### 5.7 Comments

- `%% basePath:NAME = LOCAL_PATH` — declares a named base path.
- `%% legend:COLOR = MEANING` — declares a legend entry.
- `%% desc:NODE_ID = DESCRIPTION` — node description (placed immediately above the node).
- `%% diagram:DESCRIPTION` — diagram-level description (placed at top).

### 5.8 Shape policy

Recommended shapes per type (visual consistency only):
- Code section: `[label]`
- Note: `>label]`
- File: not a shape — files are subgraphs (see 5.3)
- Group: not a shape — groups are subgraphs (see 5.5)

The parser does **not** enforce shape on code/note nodes. Type for nodes is determined by label content; type for subgraphs is determined by ID prefix (`file_` vs other). Whatever shape Claude uses for code/note renders as-is.

### 5.9 What Claude does not produce

- JSON of any kind.
- `click` directives.
- Composite IDs.
- Mermaid IDs (`n1`, `n2`) — these are short tokens chosen by Claude or generated.
- Local file paths (only `@basepath/relative/path`).

---

## 6. Architecture

### 6.1 Two parallel passes over mermaid source

1. **Mermaid library** parses + renders → SVG. Untouched.
2. **Custom parser** reads same source → JSON mirror. Independent.

When mermaid encounters an unknown shape, it renders something reasonable. When the parser encounters a label that doesn't match any pattern, it produces a node with `type: "unknown"` and an issue. Neither pass blocks the other.

### 6.2 Channel A / Channel B split

**Channel A — source-level changes (re-render required):**
- Add/remove nodes, edges, groups
- Change labels (any field)
- Change shape
- Reorganize structure

Channel A edits the mermaid source string and re-runs `mermaid.render()`. After render, Channel B styling is re-applied.

**Channel B — post-render DOM styling (no re-render):**
- Selection, hover, focus rings
- Overlap warning indicators
- Dimmed / inactive states
- Transient feedback animations

Channel B walks the rendered SVG, applying CSS classes and styles per mermaid node ID. Does not modify mermaid source.

**Persistent semantic colors live in source via `classDef` (Channel A territory).** Channel B is for transient UI state only.

### 6.3 Click pipeline

```
User clicks SVG element
  → handler reads mermaid node ID OR subgraph ID from element
  → JSON mirror lookup (file subgraphs are file entries; regular nodes are node entries)
  → side panel renders metadata
```

Two element types are clickable: regular nodes (mermaid `.node` class) and subgraph titles (mermaid `.cluster-label` and `.cluster` class). File subgraphs (`file_*` IDs) resolve to file metadata; non-file subgraphs (`g_*` and others) resolve to group metadata.

V2 swaps "side panel renders metadata" for "send postMessage to VS Code extension." The pipeline above stays intact.

### 6.4 Performance

Re-render cost is negligible up to a few hundred nodes. Past that, incremental update strategies become worth considering. Out of scope for V1.

### 6.5 Mermaid version

Pin to mermaid `^11.13.0` (the latest minor before the most recent release, giving 2+ weeks of bake time before adoption). Latest at time of writing is 11.14.0; we deliberately stay one minor behind for stability. Upgrades happen deliberately, with regression testing against fixture diagrams. Document the pinned version in `package.json` and in this PRD when bumped.

---

## 7. Issue handling

Import never fails. The parser produces an issues array; the UI surfaces all of them. Examples of concrete issues:

- `n5` — Label "some random text" does not match any known pattern. Stored as `type: "unknown"`. Click shows raw label only.
- `n7` — References class `:::g_security` but no subgraph or class definition with that name exists. Auto-created group `g_security` with palette color `#a3c4f3`.
- `n12` — Label parsed as code node but `endLine` (40) is less than `startLine` (58). Treated as `[40, 58]` after swap. Original preserved in raw label.
- Diagram — Comment `%% basePath:archived = ...` defined but no node references `@archived/...`. Base path stored, marked unused.
- `n3` and `n9` — Both reference `@backend/src/auth.ts` with overlapping line ranges (n3: 42–58, n9: 50–65). Overlap on lines 50–58. Both kept, flagged.
- `n14` — Label has 4 segments separated by `<br/>` but expected 3 (path, lines, identifier) for code or 2 (path, identifier) for file. Treated as `unknown`.
- `n21` — Composite ID `||src/auth.ts|42|58|validateToken` has empty git URL. Node will not match across repos but matches locally. Info only.
- Diagram — Mermaid library reported parse error: "Parse error on line 7: ...". Parsing aborted at that line; partial JSON mirror returned for nodes parsed up to that point.
- `n4` — Class `:::g_auth` applied but no entry in legend comments explains what `g_auth` means. Group renders, but legend panel shows "(no description)".
- Comment `%% desc:n99 = ...` references node `n99` which does not exist. Description orphaned, kept in JSON in case node is added later.
- `n8` — Identifier field is empty (`@backend/src/auth.ts<br/>42-58<br/>`). Composite ID falls back with empty identifier. May collide with another empty-identifier node in the same range. Flagged.
- `n11` — Multiple classes applied (`:::g_auth :::g_db`) but the node is also inside subgraph `g_logging`. All three group memberships recorded; primary group (subgraph) is `g_logging`.
- `n15` — Label declares `git=github.com/me/api` but base path `@backend` declares `git=github.com/me/backend`. Per-node value wins; flagged as inconsistency.

The principle: a failed import hides what's wrong. A warned import shows you exactly what to fix or what to paste back to Claude.

---

## 8. Out of scope (V1)

- VS Code integration (click → open file). V2.
- MCP integration (Claude drives the diagram). V3.
- Authentication / multi-user / sharing.
- Server-side persistence. Browser storage only.
- Diagram editing as a canvas (free node placement, manual edge routing). Layout stays mermaid-driven.
- Diff view between two diagrams. Possible later.
- Auto-merge of overlapping nodes. Always manual.
- Rendering anything other than mermaid flowcharts. Other diagram types (sequence, ER, class) are out of scope; the convention is flowchart-specific.
- AI features inside the webapp (the webapp does not call Claude). Claude is invoked externally; the webapp is the round-trip surface.

---

## 9. Testing strategy

Three layers, in order of frequency and cost:

**Layer 1 — Parser unit tests (Vitest, no browser).**
Pure functions. Mermaid text in, JSON mirror + issue list out. Asserts against expected snapshots derived from fixture diagrams. Round-trip test: parse → serialize → parse → assert identical JSON. Fast (milliseconds), runs on every save in watch mode.

**Layer 2 — DOM integration tests (Vitest + happy-dom).**
Render fixture via mermaid in a fake DOM. Simulate clicks, assert side panel state, test Channel B styling (selection class, overlap-warning class). No real browser. Still fast.

**Layer 3 — Visual E2E (Playwright + screenshot baseline).**
Real headless browser. Boots Vite dev server, loads fixture, takes screenshot, compares to baseline using `@playwright/test` snapshot testing. Catches CSS regressions, layout breakage, mermaid version upgrade issues. Slow but high signal — runs on commit.

**Fixtures.**
Two fixture diagrams maintained in `src/fixtures/`:
- `happy-path.mmd` — clean diagram exercising every feature correctly.
- `messy.mmd` — diagram designed to trigger every issue type for parser warning tests.

**Round-trip test as the integrity check.** A passing round-trip on the happy-path fixture proves the convention's parser ↔ serializer are inverse operations. This is the single strongest test for catching regressions.

**Limits to acknowledge.** Claude Code can verify behavior (clicks trigger correct events, parser produces correct data) and detect change (pixel diff percentages). Claude Code cannot evaluate whether a diagram looks good aesthetically; that judgment stays with the human. When a Layer 3 test fails, the diff report names what changed in pixel terms; the human inspects screenshots and accepts or rejects.

---

## 10. Roadmap

### Phase ordering for V1

V1 ships in phases. User-driven structural editing (multi-select, group creation, manual merge) is deferred to the end so that the read + import + export loop is usable as early as possible.

**Phase 0 — Parser core (standalone, no UI).**
F-9 issue model, label convention parser, JSON mirror, composite IDs, overlap detection, same-file grouping (F-14). Tested against fixture diagrams.

**Phase 1 — Read-only webapp.**
F-1 import, F-2 click-to-message, F-9 issue panel always visible. Mermaid renders, clicks reveal metadata, issues surface. Usable for "Claude gave me a diagram, I want to read it."

**Phase 2 — Light editing and round-trip.**
F-3 base paths with localStorage, F-7 description editing, F-8 legend panel, F-6 export, F-12 prompt copy. Round-trip with Claude works. Still no user-created structure.

**Phase 3 — User-driven structure.**
F-4 multi-select, F-5 multi-membership rendering, F-11 manual merge, F-13 re-prompt button. User can shape diagrams, not only read them.

**Phase 4 — Polish.**
Channel B styling for transient states, overlap warning visuals (F-10 visual layer), Playwright + screenshot baseline, layout refinement, empty/error states.

### Future versions

**V2 — VS Code plugin.** The webapp embeds in VS Code as a webview. Click pipeline's terminal step changes from "render side panel" to "command VS Code to open `path:line`." Composite IDs and base path resolution become a tighter loop with the actual workspace. Base path mappings can be auto-detected from the workspace root.

**V3 — MCP integration.** Claude drives the diagram directly via MCP. Use cases: "Claude, look at this diagram and add a node for the new validation function." The label convention stays the same; MCP gives Claude a typed API for emitting it. The webapp becomes a live surface Claude can read from and write to.

V1 architectural commitments that protect these futures:

- Click pipeline isolates "what to do on click" from "how to identify the node."
- JSON mirror is internal but well-defined; an MCP API surface maps to it cleanly.
- Channel A / Channel B split lets V2/V3 add new transient overlays (e.g., "Claude is currently editing this node") without re-architecting.
- Mermaid as the only wire format means Claude's existing strength translates directly; no MCP-specific format to design.

---

## 11. Open questions

All product-side open questions have been resolved as of this version. Implementation-phase questions (tech stack, build tooling, parser internals) are tracked separately.

---

*End of PRD draft v5.*