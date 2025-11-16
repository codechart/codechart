# Implementation Plan: Save Diagram to File from IDE

## Current Position Handling (Reminder)

When diagrams are loaded via `llmJson.actions.processAllItems()`:
1. Nodes are created one by one via `loadNode()` or `processChild()`
2. Each new node gets default positions from `getMatchNodesPositions()` [chart.actions.ts:57]
3. After all nodes added, `positionNonMatchNodes()` is called [llmJson.actions.ts:316]
   - This function positions non-match nodes (TODO/custom nodes) at the center of connected match nodes
   - Match nodes are positioned based on direction option (UP/DOWN/LEFT/RIGHT)

**Key insight**: When loading saved positions from JSON:
- Skip the automatic positioning algorithm
- Apply saved x,y directly to nodes when creating them
- Still call `positionNonMatchNodes()` for any custom nodes that weren't in the saved file

---

## Implementation Overview

### 1. **Modify LlmJsonItem Interface** (llmJson.actions.ts)
Add optional position fields:
```typescript
export interface LlmJsonItem {
    // ... existing fields ...
    x?: number,        // Node x position
    y?: number         // Node y position
}
```

### 2. **Update mapForLlmJson()** (llmJson.actions.ts:319)
Extract positions when exporting:
- For each node, capture `node.x` and `node.y`
- Include in the JSON output

### 3. **Update processChild() / loadNode()** (llmJson.actions.ts:282-287)
Apply saved positions when loading:
- If positions exist in JSON, set them on created nodes
- Nodes will retain positions when added to chart

### 4. **Create VSCode Context Menu Handler** (packages/vscode-plugin/src/panelWebviewProvider.ts)
Add right-click option for `.cochart.json` files:
- Detect when file is `.cochart.json` (use context key in package.json)
- Read file content
- Post message to webview with file path + JSON content
- Similar to existing `displayReadmeInIde_webviewEvent` pattern

### 5. **Create Webview Message Handler** (packages/vscode-plugin/webview/vscode-plugin.html)
Handle incoming diagram message:
- Receive `loadDiagramFromIde` event with file path + JSON
- Forward to Angular iframe
- Pass file path along with diagram data

### 6. **Create IDE Bridge Function** (packages/ui/src/assets/scripts/ide-connect-js.js)
Add handler for diagram loading:
```javascript
async function loadDiagramFromIde(filePath, jsonData) {
    // Call AppComponent method to load diagram
}
```

### 7. **Update IdeConnect** (packages/ui/src/app/IDE/IdeConnect.ts)
Add method:
```typescript
public input_loadDiagramFromFile(filePath: string, jsonString: string) {
    // Store current file path
    // Load diagram via llmJsonActions
}
```

### 8. **Create Save to File Handler** (app.component.ts)
Add method to save current diagram:
- Serialize current state via `llmJsonActions.mapForLlmJson()`
- Send to IDE via `IdeConnect.output_saveDiagramToFile()`
- VSCode extension writes file

### 9. **Add Save Button** (app.component.html)
Add button in menu (near existing menus):
- Only show when `isInIde === true` AND a file is loaded
- Call save handler

### 10. **Display Filename** (app.component.html)
Add text at bottom showing loaded file name:
- Update when diagram loaded
- Clear when new diagram created

---

## File Changes Summary

| File | Changes | LOC |
|------|---------|-----|
| [llmJson.actions.ts](packages/ui/src/app/search/llmJson.actions.ts) | Add x,y to interface; extract positions in mapForLlmJson(); apply positions in loadNode() | +20 |
| [panelWebviewProvider.ts](packages/vscode-plugin/src/panelWebviewProvider.ts) | Add context menu handler for .cochart.json files | +30 |
| [vscode-plugin.html](packages/vscode-plugin/webview/vscode-plugin.html) | Add message handler for diagram load | +15 |
| [ide-connect-js.js](packages/ui/src/assets/scripts/ide-connect-js.js) | Add loadDiagramFromIde function | +10 |
| [IdeConnect.ts](packages/ui/src/app/IDE/IdeConnect.ts) | Add input_loadDiagramFromFile and output_saveDiagramToFile methods | +20 |
| [app.component.ts](packages/ui/src/app/app.component.ts) | Add save handler; track loaded file path | +25 |
| [app.component.html](packages/ui/src/app/app.component.html) | Add save button; add filename display | +10 |

---

## Flow Diagram

### Loading (IDE → UI):
```
User right-clicks .cochart.json in explorer
    ↓
Context menu "Add diagram to Cochart"
    ↓
panelWebviewProvider: Read file → Extract JSON + path
    ↓
postMessage to webview: {action: 'loadDiagramFromIde', filePath, jsonData}
    ↓
vscode-plugin.html: Forward to iframe
    ↓
ide-connect-js.js: Call input_loadDiagramFromFile()
    ↓
IdeConnect.ts: Store filePath + call llmJsonActions.processAllItems()
    ↓
llmJson.actions.ts: Apply saved x,y positions when loading nodes
    ↓
UI displays diagram with preserved positions
```

### Saving (UI → IDE):
```
User clicks "Save to File" button
    ↓
app.component.ts: Call saveDiagram()
    ↓
llmJson.actions: mapForLlmJson() extracts current state + positions
    ↓
IdeConnect.output_saveDiagramToFile(filePath, jsonString)
    ↓
ide-connect-js.js: Posts to parent window
    ↓
vscode-plugin.html: Forwards to extension via vscode.postMessage()
    ↓
panelWebviewProvider.ts: Handles 'saveDiagramToFile' message
    ↓
VSCode writes JSON to file (overwrites completely)
```

---

## Next Steps

1. Confirm this plan matches your vision
2. Start implementation in order listed
3. Test each piece as we go
