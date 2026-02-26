# Cochart MCP Server — V1.2

Build an MCP (Model Context Protocol) server for Cochart that lets LLM clients (Claude Code, Copilot, etc.) create and interact with code visualization diagrams.

## Architecture

```
LLM Client (Claude Code / Copilot / etc.)
        ↓ MCP protocol (stdio)
   MCP Server (standalone Node process in packages/mcp/)
        ↓ WebSocket (port 8765)
   UI (localhost:4200) ←→ API (localhost:2900)
```

## Runtime Environment

- **UI is already running on localhost:4200** — do NOT attempt to start it
- **API is already running on localhost:2900** — do NOT attempt to start it
- Work directly on the real codebase (packages/mcp/, packages/ui/, etc.)

## Key Source Files

- `packages/ui/src/app/search/llmJson.actions.ts` — contains `LlmJsonItem` (line 11), `parseLlmJson()` (line 32), `processAllItems()` (line 178), `mapForLlmJson()` (line 213)
- `.claude/commands/scripts/llm-validate-covalent.js` — validation logic to reuse
- `.claude/commands/cochart/write-cochart.md` — JSON Schema documentation
- `packages/ui/src/app/app.module.ts` — Angular module (register new services here)

## Schema Rules (LlmJsonItem)

- Code nodes: `type` key must be **absent** (not undefined, not null)
- Todo nodes: `type: "todo"`
- Section/remark nodes: `type: "section"` / `type: "remark"`
- Export: include `x`, `y` positions from vis.js
- Import: ignore `x`, `y` — UI layout engine determines positions

## MCP Tools (7 total)

| Tool | Purpose |
|------|---------|
| `validate_json` | Validate diagram JSON against LlmJsonItem schema |
| `send_to_ui` | Push full diagram to UI (replaces current) |
| `add_to_diagram` | Merge nodes/edges into existing diagram |
| `get_diagram_json` | Get current diagram state from UI |
| `get_diagram_image` | Get screenshot as base64 |
| `save_image` | Save screenshot to file |
| `get_selected_nodes` | Get user-selected nodes |

## WebSocket Protocol

### MCP Server → UI
```
{ type: "render_diagram", payload: LlmJsonItem[] }
{ type: "add_to_diagram", payload: LlmJsonItem[] }
{ type: "request_diagram_json", requestId: string }
{ type: "request_screenshot", requestId: string, maxSize?: number }
{ type: "request_selected_nodes", requestId: string }
```

### UI → MCP Server
```
{ type: "diagram_json_response", requestId: string, data: LlmJsonItem[] }
{ type: "screenshot_response", requestId: string, base64: string, mimeType: string }
{ type: "selection_response", requestId: string, selectedNodes: LlmJsonItem[] }
{ type: "selection_changed", selectedNodes: LlmJsonItem[] }
```

## MCP Server Structure

```
packages/mcp/
├── src/
│   ├── index.ts              # entry, MCP server config
│   ├── tools/
│   │   ├── validate.ts       # validate_json
│   │   ├── diagram.ts        # send_to_ui, add_to_diagram, get_diagram_json
│   │   ├── image.ts          # get_diagram_image, save_image
│   │   └── selection.ts      # get_selected_nodes
│   ├── schemas/
│   │   └── llmJsonItem.ts    # copied LlmJsonItem interface
│   ├── websocket/
│   │   ├── client.ts         # real WebSocket client
│   │   └── fake.ts           # FakeWebSocket for tests
│   └── prompts/
│       └── index.ts          # MCP prompts
├── scripts/
│   └── verify-schema.ts      # build-time check: MCP schema matches UI schema
├── tests/
│   └── *.test.ts
├── package.json
└── tsconfig.json
```

## UI Changes

### New files (in packages/ui/src/app/):
- `mcp/mcp-websocket.service.ts` — WebSocket client, handles MCP messages
- `mcp/mcp-message.types.ts` — TypeScript types for WebSocket protocol

### Modified files:
- `llmJson.actions.ts` — fix mapForLlmJson() (no type on code nodes, add x/y)
- `app.module.ts` — register McpWebSocketService

## Example App for Testing

```
packages/mcp/example-app/
├── auth/
│   ├── login.ts
│   ├── register.ts
│   └── logout.ts
├── todos/
│   ├── create.ts
│   ├── list.ts
│   └── complete.ts
└── README.md
```

Code doesn't need to run. Just needs clear logic flow for diagram testing.
Three test scenarios: login flow, registration flow, todo creation flow.

## Full Plan Reference

See `packages/mcp/original-plan/V1.2_REVISED_PLAN.md` for the complete plan with all details.
