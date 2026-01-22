# Cochart Unified Search Logic Diagram

This diagram shows the complete search and display flow in Cochart, from user input to diagram rendering.

## Overview

The diagram contains **33 nodes** across **7 source files**, illustrating three entry points that converge at the search logic and branch into multiple API search strategies.

## Entry Points

### 1. UI Paste Flow (Nodes 1-15)
**Entry:** Keyboard paste event listener

The main flow for pasting LLM-generated JSON diagrams:
- `app.component.ts:358` - Paste event listener captures clipboard data
- `app.component.ts:381` - `handleLlmJsonPaste` processes the pasted text
- `search.actions.ts:331` - `createMatchFromLlmJson` parses and processes JSON
- `llmJson.actions.ts:166` - `processChild` creates nodes for each JSON item
- `llmJson.actions.ts:96` - Calls `searchAroundLine` to find code matches
- `search.actions.ts:187-188` - `searchAroundLine` → `doSearch`
- `search.actions.ts:120` - **doSearch** (convergence point)
- `search.actions.ts:132` - HTTP POST to `/find` endpoint
- `App.ts:943` - **findInFiles** - API entry point
- `search.actions.ts:156` - `loadResults` processes API response
- `search.actions.ts:246` - `displaySearchResults` prepares nodes
- `search.actions.ts:254` - Calls `chart.addNodesAndLinks`
- `chart.wrapper.ts:488` - **addNodesAndLinks** renders to vis.js

### 2. IDE Connect Flow (Nodes 16-18)
**Entry:** IDE extension click event

When users click on code in VS Code/IntelliJ:
- `IdeConnect.ts:84` - `input_addMatchOnClick` receives IDE click
- `IdeConnect.ts:103` - Calls `addMatchFromFile`
- `search.actions.ts:202` - `addMatchFromFile` → converges at HTTP POST (node 10)

### 3. SaveLoadService Flow (Nodes 19-20)
**Entry:** Load saved diagram from repository

Separate endpoint for loading existing diagrams:
- `SaveLoadService.ts:111` - `getResults` queries for diagrams
- `SaveLoadService.ts:112` - HTTP POST to `/searchDiagram` endpoint

## API Search Branches (Nodes 21-33)

The `findInFiles` function in App.ts branches based on `SearchEnum`:

### SearchEnum.openFile (Node 21)
- Opens a file or directory listing
- `App.ts:966`

### SearchEnum.getLinesFromFile (Nodes 22-24)
- Retrieves specific line numbers from a file
- `App.ts:992` - Branch condition
- `App.ts:993` - Calls `getResultsFromFile`
- `App.ts:1083` - `getResultsFromFile` extracts matches

### SearchEnum.searchInFile (Nodes 25-26)
- Searches for pattern within a specific file
- `App.ts:997` - Branch condition
- `App.ts:998` - Calls `getResultsFromFile` with regex matcher

### SearchEnum.searchAroundLine (Nodes 27-29)
- Finds matches near a specific line number
- `App.ts:1010` - Branch condition
- `App.ts:1011` - Calls `searchAroundLineInFile`
- `App.ts:1118` - `searchAroundLineInFile` function

### Default Folder Search (Nodes 30-33)
- Recursive search through entire project directory
- `App.ts:1015` - Default else branch
- `App.ts:1016` - Calls `processDir`
- `App.ts:839` - `processDir` walks directory tree
- `App.ts:851` - Recursive call for subdirectories

## Files Referenced

| File | Nodes | Purpose |
|------|-------|---------|
| `packages/ui/src/app/app.component.ts` | 1, 2, 4 | Main UI component, paste handling |
| `packages/ui/src/app/search/search.actions.ts` | 3, 7-10, 12-14, 18 | Search orchestration |
| `packages/ui/src/app/search/llmJson.actions.ts` | 5, 6 | LLM JSON processing |
| `packages/ui/src/app/chart/chart.wrapper.ts` | 15 | Vis.js chart rendering |
| `packages/ui/src/app/IDE/IdeConnect.ts` | 16, 17 | IDE extension bridge |
| `packages/ui/src/app/services/SaveLoadService.ts` | 19, 20 | Diagram persistence |
| `packages/api/src/App.ts` | 11, 21-33 | Backend search engine |

## Key Insights

1. **Convergence Point**: Both paste flow and IDE flow converge at `doSearch` (node 9) before making the HTTP POST to the API.

2. **Separate Endpoints**: SaveLoadService uses `/searchDiagram` endpoint (for querying saved diagrams), while search uses `/find` endpoint (for code search).

3. **Search Strategy Selection**: The API intelligently selects the search strategy based on the `SearchEnum` type passed from the UI.

4. **Recursive Processing**: Both the UI (processChild for JSON items) and API (processDir for directories) use recursive patterns to handle nested structures.
