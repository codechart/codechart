# Tree Alignment Implementation Plan

## Overview
Modify the `makeIntoTreeLayout()` method in `chart.actions.ts` to use manual level assignment for match nodes only, leveraging vis.js native traversal methods with direction filtering and recursive traversal.

## Files to Modify

### Primary File: `/packages/ui/src/app/chart/chart.actions.ts`
- **Location**: Lines 774-817 (existing `makeIntoTreeLayout()` method)
- **Changes**: Complete rewrite of tree layout logic with new helper methods

### Supporting Files (Read-only dependencies):
- `/packages/ui/src/app/chart/chart.utils.ts` - Utility methods for node type checking
- `/packages/ui/src/app/chart/chart.wrapper.ts` - Chart manipulation methods
- `/packages/ui/src/app/chart/create.utils.ts` - Node creation utilities

## Libraries and APIs Used

### Vis.js Network API Methods:
- `network.getConnectedNodes(nodeId, direction?)` - Native traversal with direction filtering
- `network.getPositions()` - Get node positions after layout
- `network.setOptions()` - Configure hierarchical layout
- `network.once("afterDrawing", callback)` - Layout completion event

### Chart Wrapper Methods (Existing):
- `this.chart.getAllMatchNodes()` - Get all match nodes
- `this.chart.getAllNodes()` - Get all nodes
- `this.chart.getNode(id)` - Get specific node
- `this.chart.nodes.update()` - Update node properties

### Chart Utils Methods (Existing):
- `ChartUtils.isMatchNode(node)` - Check if node is a match node
- `ChartUtils.isFilenameNode(node)` - Check if node is a filename node
- `ChartUtils.getMiddlePoint(nodes, axis, chart)` - Calculate center point

## Implementation Details

### 1. Add Helper Method for Filtered Node Retrieval
```typescript
private getConnectedMatchNodes(nodeId: IdType, direction?: string): Node[] {
  return this.chart.chart.getConnectedNodes(nodeId, direction)
    .map(id => this.chart.getNode(id))
    .filter(node => ChartUtils.isMatchNode(node));
}
```
**Purpose**: Combines vis.js traversal with match node filtering
**Parameters**: 
- `direction: 'from'` = parent nodes
- `direction: 'to'` = child nodes
- `undefined` = all connected nodes

### 2. Add Recursive Level Assignment Method
```typescript
private assignLevelsRecursive(nodeId: IdType, level: number, visited: Set<IdType>) {
  if (visited.has(nodeId)) return;
  
  visited.add(nodeId);
  const node = this.chart.getNode(nodeId);
  node.level = level;
  
  // Get child match nodes using direction filtering
  const childMatchNodes = this.getConnectedMatchNodes(nodeId, 'to');
  
  childMatchNodes.forEach(childNode => {
    this.assignLevelsRecursive(childNode.id, level + 1, visited);
  });
}
```
**Purpose**: Recursively assigns hierarchical levels to match nodes
**Logic**: 
- Prevents cycles with visited set
- Sets current node level
- Recursively processes children with level + 1

### 3. Add Level Calculation Method
```typescript
private calculateMatchNodeLevels() {
  const matchNodes = this.chart.getAllMatchNodes();
  const visited = new Set<IdType>();
  
  // Find root nodes: match nodes with no match node parents
  const rootNodes = matchNodes.filter(node => {
    const matchParents = this.getConnectedMatchNodes(node.id, 'from');
    return matchParents.length === 0;
  });
  
  // Recursively assign levels starting from roots at level 0
  rootNodes.forEach(rootNode => {
    this.assignLevelsRecursive(rootNode.id, 0, visited);
  });
  
  // Remove level property from non-match nodes
  const nodesToUpdate = this.chart.getAllNodes().map(node => {
    if (!ChartUtils.isMatchNode(node) && node.level !== undefined) {
      delete node.level;
    }
    return node;
  });
  
  this.chart.nodes.update(nodesToUpdate);
}
```
**Purpose**: Orchestrates the level calculation process
**Logic**:
1. Find root nodes (match nodes with no match parents)
2. Start recursive traversal from roots at level 0
3. Clean up level property from non-match nodes

### 4. Add Other Node Positioning Method
```typescript
private positionOtherNodesAfterLayout() {
  const allNodes = this.chart.getAllNodes();
  
  // Only nodes that are NOT match nodes AND NOT filename nodes
  const otherNodes = allNodes.filter(node => 
    !ChartUtils.isMatchNode(node) && 
    !ChartUtils.isFilenameNode(node)
  );
  
  const nodesToUpdate: Node[] = [];
  
  otherNodes.forEach(node => {
    const connectedMatchNodes = this.getConnectedMatchNodes(node.id);
    
    if (connectedMatchNodes.length > 0) {
      // Position at center of connected match nodes
      node.x = ChartUtils.getMiddlePoint(connectedMatchNodes, 'x', this.chart);
      node.y = ChartUtils.getMiddlePoint(connectedMatchNodes, 'y', this.chart) - 50;
      nodesToUpdate.push(node);
    }
  });
  
  if (nodesToUpdate.length > 0) {
    this.chart.nodes.update(nodesToUpdate);
  }
}
```
**Purpose**: Position non-match, non-filename nodes at center of connected match nodes
**Scope**: Only processes nodes that are neither match nodes nor filename nodes (e.g., shapes, annotations)

### 5. Updated Main Method
```typescript
public makeIntoTreeLayout() {
  // 1. Calculate hierarchical levels only for match nodes
  this.calculateMatchNodeLevels();

  // 2. Run hierarchical layout with manual levels
  this.chart.chart.setOptions({
    layout: { hierarchical: { enabled: true, direction: "UD", sortMethod: "directed" } },
    physics: { enabled: false }
  });

  // 3. Save positions and position other node types
  this.chart.chart.once("afterDrawing", () => {
    const positions = this.chart.chart.getPositions();
    for (const id in positions) {
      this.chart.nodes.update({ id, x: positions[id].x, y: positions[id].y, physics: false });
    }

    // 4. Position filename nodes (existing logic - unchanged)
    this.positionFilenameNodesAfterLayout();

    // 5. Position other nodes at center of connected match nodes
    this.positionOtherNodesAfterLayout();

    // 6. Turn off hierarchical layout, keep nodes fixed
    this.chart.chart.setOptions({
      layout: { hierarchical: { enabled: false } }
    });
  });
}
```

## Node Type Handling

### Match Nodes:
- **Participation**: Full participation in hierarchical layout
- **Level Assignment**: Manual levels based on connection hierarchy
- **Positioning**: Handled by vis.js hierarchical algorithm

### Filename Nodes:
- **Participation**: Excluded from hierarchical layout (no level property)
- **Level Assignment**: None
- **Positioning**: Existing logic in `positionFilenameNodesAfterLayout()` (unchanged)

### Other Nodes (shapes, annotations, etc.):
- **Participation**: Excluded from hierarchical layout (no level property)
- **Level Assignment**: None  
- **Positioning**: New logic - centered on connected match nodes

### File Nodes:
- **Participation**: Excluded from hierarchical layout
- **Level Assignment**: None
- **Positioning**: Existing logic (unchanged)

## Vis.js Hierarchical Layout Configuration

```typescript
layout: { 
  hierarchical: { 
    enabled: true, 
    direction: "UD",        // Up-Down orientation
    sortMethod: "directed"  // Respect edge directions
  } 
}
```

## Benefits of This Approach

1. **Clean Traversal**: Uses vis.js native `getConnectedNodes()` with direction filtering
2. **Recursive Logic**: More intuitive than queue-based BFS approach
3. **Precise Control**: Only match nodes participate in hierarchical positioning
4. **Proper Separation**: Different node types handled appropriately for their purpose
5. **Performance**: Filters at source rather than post-processing all connections
6. **Maintainable**: Clear separation of concerns between node types

## Testing Considerations

- Verify match nodes form proper tree hierarchy
- Confirm filename nodes stay positioned relative to their match nodes
- Check that other node types center properly on connected match nodes
- Test with various graph structures (linear chains, branching, cycles)
- Ensure performance with large numbers of nodes