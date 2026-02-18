# Cochart MCP Server — Task Plan

## Phase 0: Setup

- [ ] [setup] Create example todo app in packages/mcp/example-app/ (auth: login, register, logout; todos: create, list, complete — code doesn't need to run, just clear logic flow)
- [ ] [setup] Fix mapForLlmJson() in packages/ui/src/app/search/llmJson.actions.ts — code nodes must NOT have `type` key (currently emits it incorrectly on line 234)
- [ ] [setup] Add x,y positions to mapForLlmJson() export (read node positions from vis.js network via chartWrapper)
- [ ] [setup] Define 3 expected test diagrams as JSON files in packages/mcp/example-app/expected-diagrams/ (login flow, registration flow, todo creation flow)

**PHASE GATE: Stop here. TL must log "[tl] PHASE 0 COMPLETE — awaiting user approval" and wait.**

## Phase 1: MCP Server (mock)

- [ ] [mcp-builder] Setup packages/mcp/ project structure (package.json, tsconfig.json, TypeScript, Vitest)
- [ ] [mcp-builder] Copy LlmJsonItem interface to packages/mcp/src/schemas/llmJsonItem.ts + create build-time verification script (packages/mcp/scripts/verify-schema.ts)
- [ ] [mcp-builder] Implement FakeWebSocket in packages/mcp/src/websocket/fake.ts for testing
- [ ] [mcp-builder] Implement all 7 MCP tools (validate, diagram, image, selection) using existing validation logic from .claude/commands/scripts/llm-validate-covalent.js
- [ ] [tester] Write unit tests for all 7 tools (schemas, validation, error handling) — run with Vitest

**PHASE GATE: Stop here. TL must log "[tl] PHASE 1 COMPLETE — awaiting user approval" and wait.**

## Phase 2: Real WebSocket + UI Integration

- [ ] [ui-dev] Create McpWebSocketService in packages/ui/src/app/mcp/mcp-websocket.service.ts + types in mcp-message.types.ts
- [ ] [ui-dev] Wire up all 6 message handlers in McpWebSocketService (render_diagram, add_to_diagram, request_diagram_json, request_screenshot, request_selected_nodes, selection_changed)
- [ ] [ui-dev] Register McpWebSocketService in app.module.ts, connect on page load
- [ ] [mcp-builder] Replace FakeWebSocket with real WebSocket in MCP server (packages/mcp/src/websocket/client.ts)
- [ ] [tester] Integration test: MCP server ↔ UI WebSocket roundtrip works

**PHASE GATE: Stop here. TL must log "[tl] PHASE 2 COMPLETE — awaiting user approval" and wait.**

## Phase 3: QA

- [ ] [tester] Setup Playwright in packages/mcp/
- [ ] [tester] Structural tests: WebSocket connection, diagram rendering, JSON roundtrip, screenshot capture, node selection
- [ ] [tester] Semantic verification: test 3 example app scenarios against expected diagrams

**PHASE GATE: Stop here. TL must log "[tl] PHASE 3 COMPLETE — awaiting user approval" and wait.**

## Phase 4: Integration

- [ ] [mcp-builder] Configure MCP in Claude Code (mcp.json)
- [ ] [tester] Test: natural language → diagram generation works
- [ ] [tester] Test: read existing diagram → analyze → modify works
