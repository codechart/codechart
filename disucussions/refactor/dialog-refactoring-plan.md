# Dialog Refactoring Plan for App Component

## Current State Analysis

The `app.component.html` file contains 6 main dialogs that should be extracted into separate components:

1. **Open File Dialog** (lines 545-558) - File selection dialog
2. **Save Dialog** (lines 559-640) - Diagram saving dialog with similar charts detection
3. **Load Dialog** (lines 641-711) - Diagram loading table with search/filter
4. **Search Results Dialog** (lines 712-754) - Match selection dialog
5. **Sync Dialog** (lines 755-796) - File synchronization dialog  
6. **Help Dialog** (lines 797-859) - Help and tutorial dialog

## Refactoring Plan

### Phase 1: Create Dialog Components Structure

Following the coding convention observed in `side-menu` component, create the following new dialog components under `packages/ui/src/app/dialogs/`:

1. `open-file-dialog/open-file-dialog.component.ts|html|scss`
2. `save-diagram-dialog/save-diagram-dialog.component.ts|html|scss`
3. `load-diagram-dialog/load-diagram-dialog.component.ts|html|scss`
4. `search-results-dialog/search-results-dialog.component.ts|html|scss`
5. `sync-dialog/sync-dialog.component.ts|html|scss`
6. `help-dialog/help-dialog.component.ts|html|scss`

### Phase 2: Dialog Component Design Pattern

Following the established pattern from `side-menu.component.ts`, each dialog component will:

**File Structure Convention**:
- Component files directly in folder (no sub-folders)
- Standard Angular naming: `component-name.component.ts|html|scss`
- Import statements follow project patterns

**Component Pattern**:
```typescript
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
// Import required services and types from project

@Component({
  selector: 'app-[dialog-name]-dialog',
  templateUrl: './[dialog-name]-dialog.component.html',
  styleUrls: ['./[dialog-name]-dialog.component.scss']
})
export class DialogNameDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() data: any; // Dialog-specific data
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() action = new EventEmitter<any>(); // Dialog-specific actions
  
  // Dialog-specific properties and methods
  ngOnInit() {
    // Initialization logic
  }
}
```

**Module Registration Pattern**:
Following `app.module.ts` pattern, each dialog component must be:
1. Added to `declarations` array in `AppModule`
2. Components imported at top of module file

### Phase 3: Dialog Method Extraction Strategy

Based on analysis of existing action class patterns (ChartActions, SearchActions, SynchActions), dialog methods will be extracted as follows:

#### Open File Dialog - Extract These Methods:
- `focusOnFileOpenInput()` → Move to OpenFileDialogComponent
- `filterAvailableFiles()` → Move to OpenFileDialogComponent
- `selectFile()` → Move to OpenFileDialogComponent  
- `openFileAction()` → Move to OpenFileDialogComponent

**Data Dependencies** (pass as @Input):
- `openFileSuggestions`, `fileTreeNodes`, `selectedFileTreeFullPath`, `selectedFileTreeNodeLabel`

#### Save Diagram Dialog - Extract These Methods:
- `copyDiagramLoadLink()` → Move to SaveDiagramDialogComponent
- `jsonSave()` → **Keep in app.component** (uses SaveLoadService extensively)
- `dbSave()` → **Keep in app.component** (uses SaveLoadService extensively)
- `getSimilarCharts()` (lines 464-487) → Move to SaveDiagramDialogComponent

**Data Dependencies** (pass as @Input):
- `currentDiagramDetails`, `diagramProjectList`, `filesInLegend`, `similarCharts`, `preventSimilarSave`

#### Load Diagram Dialog - Extract These Methods:
- `clickOnDiagramResult()` → Move to LoadDiagramDialogComponent
- `onLoadTableFilter()` → Move to LoadDiagramDialogComponent
- `deleteDiagram()` → **Keep in app.component** (uses SaveLoadService)

**Data Dependencies** (pass as @Input):
- `diagramsList`, `windowDims`

#### Search Results Dialog - Extract These Methods:
- `toggleSelectAllMatches()` → Move to SearchResultsDialogComponent
- `selectfileMatches()` → Move to SearchResultsDialogComponent  
- `selectMatch()` → Move to SearchResultsDialogComponent
- `selectSearchResultForDisplay()` → Move to SearchResultsDialogComponent
- `loadFindResults()` → **Keep in app.component** (complex SearchActions integration)
- `clearFindResults()` → **Keep in app.component** (complex SearchActions integration)

**Data Dependencies** (pass as @Input):
- `findResults`, `selectedNode`, `allMatchesSelected`

#### Sync Dialog - Extract These Methods:
- `checkSyncFilesExist()` → **Keep in app.component** (uses SynchActions extensively)
- `toggleSelectAllFilesToSync()` → Move to SyncDialogComponent
- `changePathSelectedFiles()` → Move to SyncDialogComponent
- `syncCode()` → **Keep in app.component** (uses SynchActions extensively)
- `showSyncDialog()` → Move to SyncDialogComponent

**Data Dependencies** (pass as @Input):
- `syncPath`, `syncFilesList`, `isAllFilesToSyncSelected`

#### Help Dialog - Extract These Methods:
- `startTutorial()` → Move to HelpDialogComponent 

**Service Dependencies** (pass as @Input):
- `TutorialService` for help dialog
- `IdeConnect` service

### Phase 4: Confirmed Implementation Approach

**Dialog Structure Decisions**:
- ✅ **Each component wraps own `p-dialog`** - Self-contained dialog components
- ✅ **Emit custom events** for actions back to app.component  
- ✅ **Pass services as @Input** from app.component (not direct injection)
- ✅ **Initialize on visibility change** using ngOnChanges or visibility setter
- ✅ **Emit error events** to app.component notification system (will become NotificationService)
- ✅ **Create `/dialogs/` folder** under `packages/ui/src/app/dialogs/`

**Implementation Order** (Small to Big):
1. **Help Dialog** (1 method: `startTutorial()`)
2. **Open File Dialog** (4 methods: file operations)
3. **Sync Dialog** (3 extractable methods: UI logic only)
4. **Search Results Dialog** (4 extractable methods: match selection)
5. **Load Diagram Dialog** (2 extractable methods: UI filtering)
6. **Save Diagram Dialog** (2 extractable methods + complex similar charts logic)

### Phase 5: Implementation Steps

1. **Create `/dialogs/` directory structure** 
2. **Start with Help Dialog** - Establish the pattern with simplest case
3. **Work through dialogs small→big** - Build complexity incrementally
4. **Each dialog component** wraps its own `<p-dialog>` element
5. **Update app.component.html** - Replace dialog HTML with component tags
6. **Update app.component.ts** - Remove extracted dialog methods, add event handlers
7. **Add to app.module.ts** - Register all new dialog components  
8. **Move to TypeScript logic** - Extract remaining methods from app.component.ts

### Phase 6: Component Integration Pattern

In `app.component.html`, replace dialog blocks with:

```html
<!-- Help Dialog - Pass TutorialService as input -->
<app-help-dialog 
  [visible]="helpVisible"
  [tutorialService]="tutorialService"
  [ideConnect]="ideConnect"
  (visibleChange)="helpVisible = $event"
  (startTutorial)="onStartTutorial($event)"
  (error)="onDialogError($event)">
</app-help-dialog>

<!-- Open File Dialog - Pass data as inputs -->
<app-open-file-dialog 
  [visible]="openFileVisible"
  [suggestions]="openFileSuggestions"
  [fileTreeNodes]="fileTreeNodes"
  [selectedPath]="selectedFileTreeFullPath"
  [selectedLabel]="selectedFileTreeNodeLabel"
  (visibleChange)="openFileVisible = $event"
  (fileSelected)="onFileSelected($event)"
  (error)="onDialogError($event)">
</app-open-file-dialog>

<!-- Similar pattern for all dialogs -->
```

### Phase 7: Event Handling Pattern

Each dialog emits standardized events:
- `visibleChange`: Boolean - Dialog visibility state
- `[action]`: Any - Dialog-specific actions (fileSelected, diagramSaved, etc.)
- `error`: String - Error messages for notification system

App component handles these via:
```typescript
onDialogError(message: string) {
  // Emit to notification system (will become NotificationService)
  this.addMessageToQueue(message);
}

onFileSelected(file: any) {
  // Handle file selection logic that remains in app.component
  this.processSelectedFile(file);
}
```

### Benefits of This Refactoring

1. **Separation of Concerns** - Each dialog has its own component
2. **Reusability** - Dialogs can be used in other parts of the application
3. **Maintainability** - Easier to modify individual dialogs
4. **Testability** - Dialog components can be tested in isolation
5. **Code Organization** - Reduces the massive app.component.ts file size
6. **Performance** - Potential for lazy loading dialog components

### Estimated Impact

- **Files Created**: 18 new files (6 components × 3 files each)  
- **Files Modified**: 3 files (app.component.ts, app.component.html, app.module.ts)
- **Lines Reduced**: 
  - ~300 lines from app.component.html (all dialog HTML)
  - ~150 lines from app.component.ts (extracted methods only)
  - **Methods Kept in app.component**: ~50 lines (complex service integration methods)
- **Risk Level**: Medium-Low - selective extraction reduces coupling issues

### Method Extraction Summary

**Total Methods Extracted**: ~12 methods
**Methods Kept in AppComponent**: ~8 methods (heavy service integration)

**Extraction Rationale**:
- ✅ **Extract**: UI-focused methods, dialog-specific logic, simple data manipulation
- ❌ **Keep**: Methods heavily integrated with SaveLoadService, SearchActions, SynchActions

### Testing Strategy

**No formal testing required** - Manual verification that dialogs function as before.

**Validation Points**:
1. Each dialog opens/closes correctly
2. Dialog-specific actions work (file selection, save operations, etc.)
3. Error handling emits to notification system
4. Data flow between app.component and dialog components works
5. Visual appearance remains consistent

---

# App Component Size Reduction Plan

## Current State Analysis

The `app.component.ts` file is **1653 lines** long and contains multiple responsibilities that violate the Single Responsibility Principle. It currently handles:

### Major Responsibilities Identified:

1. **Chart Management** (lines 130-139, 834-1041)
2. **Search Operations** (lines 648-656, 1068-1106) 
3. **File Management** (lines 664-686, 1255-1286)
4. **Dialog Management** (lines 143-154, 429-434, 1330-1339)
5. **Node Operations** (lines 697-764, 1131-1147)
6. **Sync Operations** (lines 1341-1432)
7. **Save/Load Operations** (lines 1172-1228)
8. **UI State Management** (lines 128-129, 558-580)
9. **Legend Management** (lines 582-641)
10. **Message/Notification System** (lines 1108-1129)
11. **Tutorial Integration** (lines 1648-1651)
12. **License Management** (lines 255-282)

## Updated Refactoring Strategy

**Key Decision**: After analyzing ChartActions pattern, we should **selectively extract services** rather than forcing everything into the service pattern.

### Pattern Decision Matrix:
- **Keep Action Classes** ✅: Domain-cohesive operations needing complex app state
- **Extract Services** ✅: Reusable utilities, simple state management, cross-cutting concerns

### Phase 1: Extract Service Classes

Create services for suitable domains:

#### 1.1 ChartManagementService ❌ → Keep as Action Classes
**DECISION**: After analyzing ChartActions pattern, **do NOT extract to service**.

**Why Keep Current Pattern**:
- ChartActions (773 lines) is well-organized and domain-focused
- Chart operations need complex state interactions with app
- Direct access pattern works well for cohesive domain logic
- Would create artificial complexity to force into service pattern

**Improvements to Make Instead**:
- Reduce AppComponent coupling in ChartActions constructor
- Make method dependencies more explicit
- Create testable interfaces for required state

#### 1.2 FileManagementService  
**Location**: `packages/ui/src/app/services/file-management.service.ts`
**Extract from app.component.ts**:
- File operations (lines 664-686, 1255-1286)
- File tree handling (lines 1433-1446)
- Available files management (lines 189-194)

#### 1.3 SearchManagementService ❌ → Keep as Action Class
**DECISION**: Keep SearchActions as action class pattern.

**Why Keep Current Pattern**:
- SearchActions follows same successful pattern as ChartActions
- Search operations need complex app state interactions
- Already exists and works well
- Domain-cohesive functionality

**Improvements to Make Instead**:
- Reduce direct AppComponent dependencies
- Extract utility functions that could be services

#### 1.4 SyncManagementService
**Location**: `packages/ui/src/app/services/sync-management.service.ts`
**Extract from app.component.ts**:
- Sync operations (lines 1341-1432)
- File existence checking (lines 1365-1376)
- Path management (lines 1521-1532)

#### 1.5 UIStateService
**Location**: `packages/ui/src/app/services/ui-state.service.ts` 
**Extract from app.component.ts**:
- Fullscreen state management (lines 128-129, 1563-1576)
- Window dimensions (lines 155)
- Layout calculations (lines 558-580)
- Options management (lines 86-98)

#### 1.6 NotificationService
**Location**: `packages/ui/src/app/services/notification.service.ts`
**Extract from app.component.ts**:
- Message queue management (lines 183, 1108-1129)
- License validation messages (lines 255-282)
- Error handling messages

#### 1.7 LegendManagementService
**Location**: `packages/ui/src/app/services/legend-management.service.ts`
**Extract from app.component.ts**:
- File legend operations (lines 582-641)
- Legend color management (lines 639-641)
- Node legend marking (lines 1594-1603)

### Phase 2: Extract Feature Components

#### 2.1 Node Creation Component
**Location**: `packages/ui/src/app/components/node-creation/`
**Extract from app.component.ts**:
- `createToDoNode()` (lines 706-733)
- `createGroupNode()` (lines 735-764)
- `createMatchFromSelection()` (lines 697-703)

#### 2.2 Code Editor Integration Component
**Location**: `packages/ui/src/app/components/code-editor-integration/`
**Extract from app.component.ts**:
- Code selection handling (lines 1076-1106)
- File content management (lines 1461-1513)
- Text change handling

#### 2.3 Keyboard Shortcuts Component
**Location**: `packages/ui/src/app/components/keyboard-shortcuts/`
**Extract from app.component.ts**:
- Key event handling (lines 381-388, 1609-1614)
- Shortcut management

### Phase 3: Extract Utility Classes

#### 3.1 DialogDataMapper
**Location**: `packages/ui/src/app/utils/dialog-data-mapper.ts`
**Extract from app.component.ts**:
- Dialog data preparation methods
- Similar charts detection (lines 464-487)
- Diagram loading preparation

#### 3.2 EventHandlers
**Location**: `packages/ui/src/app/utils/event-handlers.ts`
**Extract from app.component.ts**:
- Context menu handling (lines 1053-1065)
- Mouse event processing
- Chart interaction handlers

### Phase 4: Create Dedicated Interfaces

#### 4.1 Extract Interfaces to Separate Files
**Current interfaces** (lines 44-104):
- `CcShape` → `packages/ui/src/app/interfaces/chart-shapes.interface.ts`
- `CurrentFile` → `packages/ui/src/app/interfaces/file.interface.ts`
- `LicenseResponse` → `packages/ui/src/app/interfaces/license.interface.ts`
- `MessageBoxItem` → `packages/ui/src/app/interfaces/ui.interface.ts`
- `ProjectPath` → `packages/ui/src/app/interfaces/project.interface.ts`
- `SelectedDiagramInfo` → `packages/ui/src/app/interfaces/diagram.interface.ts`

## Implementation Plan

### Step 1: Create Service Structure (Week 1)
1. Create service files with basic structure
2. Move simple utility methods first
3. Ensure proper dependency injection

### Step 2: Extract Chart Management (Week 2)
1. Move chart-related methods to ChartManagementService
2. Update references in app.component.ts
3. Test chart functionality

### Step 3: Extract File & Search Management (Week 3)
1. Move file operations to FileManagementService
2. Expand SearchManagementService
3. Test search and file operations

### Step 4: Extract UI State Management (Week 4)
1. Move UI state to UIStateService
2. Create reactive state management
3. Test UI responsiveness

### Step 5: Extract Remaining Services (Week 5)
1. Complete sync, notification, and legend services
2. Clean up remaining methods
3. Final integration testing

## Expected Results

### File Size Reduction:
- **Before**: 1653 lines in app.component.ts
- **After**: ~800 lines in app.component.ts (50% reduction)
- **New files**: 12-15 service/utility files
- **Keep existing**: ChartActions, SearchActions, SynchActions patterns

### Specific Line Reductions:
- ~~Chart management: ~250 lines~~ → **KEEP as ChartActions class** ❌
- File operations: ~150 lines → FileManagementService ✅
- ~~Search operations: ~200 lines~~ → **KEEP as SearchActions class** ❌  
- Sync operations: ~100 lines → SyncManagementService ✅
- UI state: ~100 lines → UIStateService ✅
- Legend management: ~80 lines → LegendManagementService ✅
- Notifications: ~50 lines → NotificationService ✅
- Interfaces: ~60 lines → Separate interface files ✅
- Utilities: ~150 lines → Utility classes ✅
- Dialog methods: ~200 lines → Dialog components ✅

**Revised Target**: ~850 line reduction (instead of ~1200)

### Benefits:
1. **Single Responsibility** - Each service handles one domain
2. **Testability** - Services can be unit tested independently
3. **Reusability** - Services can be used by other components
4. **Maintainability** - Easier to find and modify specific functionality
5. **Performance** - Potential for lazy loading and tree shaking
6. **Team Development** - Multiple developers can work on different services

### Risks and Mitigation:
1. **Risk**: Breaking existing functionality
   - **Mitigation**: Incremental refactoring with comprehensive testing
2. **Risk**: Circular dependencies between services
   - **Mitigation**: Clear dependency hierarchy and interfaces
3. **Risk**: Over-engineering with too many small services
   - **Mitigation**: Group related functionality logically

## Testing Strategy:
1. **Unit Tests**: Each extracted service
2. **Integration Tests**: Service interactions
3. **E2E Tests**: Complete user workflows
4. **Performance Tests**: Ensure no regression in performance
5. **Visual Tests**: UI consistency validation

This refactoring will transform the monolithic app.component.ts into a clean, maintainable architecture following Angular best practices.