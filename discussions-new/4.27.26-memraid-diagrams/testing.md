# Mermaid Diagram Webapp — Summary

## What it is

Webapp for interactive viewing of Claude-authored mermaid diagrams of code. Click any node → see filepath, line range, identifier, group, description. Round-trip back to Claude as mermaid.

Mermaid is the only wire format. Webapp parses it into an internal JSON mirror; JSON drives all interactions; export serializes back to mermaid.

V1: standalone webapp. V2: VS Code plugin. V3: MCP.

## Core decisions

- Two separators: `<br/>` for nodes, ` | ` for subgraph titles (mermaid bug #3806).
- File = subgraph with `file_` prefix. Subgraph IS the file node.
- Composite ID = `gitUrl|filepath|startLine|endLine|identifier`. Computed by webapp, never written by Claude.
- Base paths named (`@backend`, `@frontend`), local mappings in localStorage.
- Type by content (label fields) and position (subgraph prefix), not by shape.
- Import never fails. Issues panel surfaces everything.
- Channel A (re-render on source change) vs Channel B (post-render DOM styling).
- White labels, dark saturated `classDef` fills.

## Phase order

0. Parser + JSON mirror (built in chat, drops into project).
1. Read-only webapp: import, click-to-message, issue panel.
2. Light editing: base paths, descriptions, legend, export, copy-prompt.
3. User structure: multi-select, group creation, manual merge.
4. Polish: Channel B styling, visual baseline, edge cases.

## How to test

Three layers:

**Layer 1 — Parser unit tests** (Vitest, no browser). Pure functions. Fast.
```
npm test           # one-shot
npm test --watch   # during development
```
Asserts JSON mirror + issue list against expected snapshots. **Round-trip test** is the integrity check: parse → serialize → parse → assert identical JSON.

**Layer 2 — DOM integration tests** (Vitest + happy-dom). Renders mermaid in fake DOM, simulates clicks, asserts side panel state and Channel B classes. No real browser.

**Layer 3 — Visual E2E** (Playwright). Real headless browser. Boots Vite, loads fixture, screenshots, compares to baseline using `@playwright/test` snapshot testing.
```
npx playwright test                  # run all
npx playwright test --update-snapshots  # accept new visuals
```

**Fixtures** in `src/fixtures/`:
- `happy-path.mmd` — clean diagram exercising every feature.
- `messy.mmd` — triggers every issue type for warning tests.

## Claude Code's role and limits

Claude Code:
- Writes parser + tests, runs Layer 1, reads pass/fail.
- Writes UI, runs Layer 2, reads pass/fail.
- Runs Layer 3 before declaring done. Reads pixel-diff percentage.

Claude Code **cannot see screenshots**. When Layer 3 fails, diff report names what changed; human eyeballs and accepts or rejects. Aesthetic judgment stays human.

## What's locked

PRD v5, fixture diagram (verified renders cleanly), label convention with two separators, file-as-subgraph, click pipeline supporting both nodes and subgraphs.

## What's next

Parser code: `parse.ts`, `serialize.ts`, types, fixture-based tests, README. TypeScript, framework-free, drops into Vite project. ~4-6 files.