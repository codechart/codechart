# Dialog Refactoring Implementation Guide

## Step-by-Step Implementation Plan

### Guidelines for Dialog Component Development

1. **Follow side-menu component pattern** - Use `side-menu.component.ts` as reference
2. **Each component wraps own p-dialog** - Self-contained components
3. **Pass dependencies as @Input** - Services and data from app.component
4. **Emit custom events** - For actions and visibility changes
5. **Initialize on visibility change** - Use ngOnChanges or visibility setter
6. **Emit errors to notification system** - Standardized error handling

### Implementation Order (Small → Big)

1. Help Dialog (1 method)
2. Open File Dialog (4 methods)
3. Sync Dialog (3 methods)
4. Search Results Dialog (4 methods)
5. Load Diagram Dialog (2 methods)  
6. Save Diagram Dialog (2 methods + complex logic)

---

## Phase 1: Project Structure Setup

### Step 1: Create Directory Structure
```bash
mkdir -p packages/ui/src/app/dialogs/help-dialog
mkdir -p packages/ui/src/app/dialogs/open-file-dialog
mkdir -p packages/ui/src/app/dialogs/sync-dialog
mkdir -p packages/ui/src/app/dialogs/search-results-dialog
mkdir -p packages/ui/src/app/dialogs/load-diagram-dialog
mkdir -p packages/ui/src/app/dialogs/save-diagram-dialog
```

### Step 2: Prepare App Module for Components
- Identify import pattern in `app.module.ts:22-31`
- Add components to declarations array following pattern at line 34-41

---

## Phase 2: Help Dialog Implementation (Simplest)

### Step 2.1: Create Help Dialog Files

**help-dialog.component.ts**:
```typescript
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TutorialService } from '../tutorial/tutorial.service';

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  styleUrls: ['./help-dialog.component.scss']
})
export class HelpDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() tutorialService: TutorialService;
  @Input() ideConnect: any;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() tutorialStarted = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  ngOnInit() {}

  onHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  startTutorial() {
    try {
      // Extract startTutorial() method from app.component.ts
      this.tutorialService.start();
      this.tutorialStarted.emit();
      this.onHide();
    } catch (error) {
      this.error.emit('Tutorial start failed: ' + error.message);
    }
  }
}
```

**help-dialog.component.html**:
- Extract HTML from `app.component.html:797-859`
- Wrap in `<p-dialog>` with bindings:
  ```html
  <p-dialog [(visible)]="visible" (onHide)="onHide()" ...>
    <!-- Extracted dialog content -->
  </p-dialog>
  ```

**help-dialog.component.scss**:
- Empty file initially, add styles as needed

### Step 2.2: Extract Methods from app.component.ts
- **Extract**: `startTutorial()` method → Move to HelpDialogComponent
- **Keep Dependencies**: TutorialService, IdeConnect (pass as @Input)

### Step 2.3: Update app.component.html
Replace dialog block (lines 797-859) with:
```html
<app-help-dialog 
  [visible]="helpVisible"
  [tutorialService]="tutorialService"
  [ideConnect]="ideConnect"
  (visibleChange)="helpVisible = $event"
  (tutorialStarted)="onTutorialStarted()"
  (error)="onDialogError($event)">
</app-help-dialog>
```

### Step 2.4: Update app.component.ts
- Remove `startTutorial()` method
- Add event handlers:
  ```typescript
  onTutorialStarted() {
    // Handle tutorial start logic that remains in app
  }
  
  onDialogError(message: string) {
    this.addMessageToQueue(message);
  }
  ```

### Step 2.5: Register Component in app.module.ts
```typescript
// Add import
import { HelpDialogComponent } from './dialogs/help-dialog/help-dialog.component';

// Add to declarations
declarations: [
  // ... existing components
  HelpDialogComponent
],
```

### Step 2.6: Test Help Dialog
- Dialog opens/closes correctly
- Tutorial starts properly
- Error handling works
- Visual appearance consistent

---

## Phase 3: Open File Dialog Implementation

### Step 3.1: Create Open File Dialog Files

**open-file-dialog.component.ts** pattern:
```typescript
@Component({
  selector: 'app-open-file-dialog',
  templateUrl: './open-file-dialog.component.html',
  styleUrls: ['./open-file-dialog.component.scss']
})
export class OpenFileDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() suggestions: any[];
  @Input() fileTreeNodes: any[];
  @Input() selectedPath: string;
  @Input() selectedLabel: string;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() fileSelected = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  // Extract these methods from app.component.ts:
  focusOnFileOpenInput() { /* ... */ }
  filterAvailableFiles() { /* ... */ }
  selectFile() { /* ... */ }
  openFileAction() { /* ... */ }
}
```

### Step 3.2: Extract Specific Methods
- `focusOnFileOpenInput()` → Move to component
- `filterAvailableFiles()` → Move to component  
- `selectFile()` → Move to component
- `openFileAction()` → Move to component

### Step 3.3: Update Integration
- Replace dialog HTML (lines 545-558) with component tag
- Update app.component.ts with event handlers
- Register in app.module.ts

---

## Phase 4: Remaining Dialogs (Same Pattern)

### Step 4.1: Sync Dialog
- Extract: `toggleSelectAllFilesToSync()`, `changePathSelectedFiles()`, `showSyncDialog()`
- Keep: `checkSyncFilesExist()`, `syncCode()` (heavy SynchActions integration)
- Inputs: `syncPath`, `syncFilesList`, `isAllFilesToSyncSelected`

### Step 4.2: Search Results Dialog  
- Extract: `toggleSelectAllMatches()`, `selectfileMatches()`, `selectMatch()`, `selectSearchResultForDisplay()`
- Keep: `loadFindResults()`, `clearFindResults()` (heavy SearchActions integration)
- Inputs: `findResults`, `selectedNode`, `allMatchesSelected`

### Step 4.3: Load Diagram Dialog
- Extract: `clickOnDiagramResult()`, `onLoadTableFilter()`
- Keep: `deleteDiagram()` (uses SaveLoadService)
- Inputs: `diagramsList`, `windowDims`

### Step 4.4: Save Diagram Dialog (Most Complex)
- Extract: `copyDiagramLoadLink()`, `getSimilarCharts()`
- Keep: `jsonSave()`, `dbSave()` (heavy SaveLoadService integration)
- Inputs: `currentDiagramDetails`, `diagramProjectList`, `filesInLegend`, `similarCharts`, `preventSimilarSave`

---

## Phase 5: Final Integration & Testing

### Step 5.1: Complete app.component.html Updates
- Replace all 6 dialog blocks with component tags
- Ensure proper event binding
- Verify data binding

### Step 5.2: Complete app.component.ts Updates  
- Remove all extracted methods
- Add all event handlers
- Update visibility properties

### Step 5.3: Complete app.module.ts Registration
- Import all 6 dialog components
- Add all to declarations array

### Step 5.4: Validation Testing
1. Each dialog opens/closes correctly
2. All dialog actions work as before
3. Error handling emits properly
4. Data flow works correctly
5. Visual consistency maintained

---

## Code Guidelines & Patterns

### Angular Component Structure (from side-menu.component.ts)
```typescript
// Standard imports
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

// Component decorator
@Component({
  selector: 'app-[name]-dialog',
  templateUrl: './[name]-dialog.component.html',
  styleUrls: ['./[name]-dialog.component.scss']
})
export class NameDialogComponent implements OnInit {
  // Standard visibility pattern
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  
  // Dialog-specific inputs/outputs
  @Input() data: any;
  @Output() action = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  // Lifecycle
  ngOnInit() {
    // Initialization logic
  }

  // Standard hide handler
  onHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  // Dialog-specific methods
}
```

### HTML Template Pattern
```html
<p-dialog [(visible)]="visible" (onHide)="onHide()" [modal]="true" [closable]="true" ...>
  <div class="dialog-header">
    <!-- Header content -->
  </div>
  
  <div class="dialog-content">
    <!-- Main dialog content extracted from app.component.html -->
  </div>
  
  <div class="dialog-footer">
    <!-- Footer with action buttons -->
  </div>
</p-dialog>
```

### Event Emission Pattern
```typescript
// Success action
this.action.emit(data);
this.onHide();

// Error handling  
try {
  // ... operation
} catch (error) {
  this.error.emit('Operation failed: ' + error.message);
}

// Visibility change
this.visible = false;
this.visibleChange.emit(this.visible);
```

### App Component Integration Pattern
```html
<!-- In app.component.html -->
<app-[name]-dialog 
  [visible]="[name]Visible"
  [data]="[requiredData]"
  [service]="[requiredService]"
  (visibleChange)="[name]Visible = $event"
  (action)="on[Name]Action($event)"
  (error)="onDialogError($event)">
</app-[name]-dialog>
```

```typescript
// In app.component.ts
on[Name]Action(data: any) {
  // Handle action logic that remains in app component
}

onDialogError(message: string) {
  this.addMessageToQueue(message);
}
```

---

## Files Modified Summary

### New Files (18 total):
- `help-dialog/help-dialog.component.ts|html|scss`
- `open-file-dialog/open-file-dialog.component.ts|html|scss`
- `sync-dialog/sync-dialog.component.ts|html|scss`
- `search-results-dialog/search-results-dialog.component.ts|html|scss`
- `load-diagram-dialog/load-diagram-dialog.component.ts|html|scss`
- `save-diagram-dialog/save-diagram-dialog.component.ts|html|scss`

### Modified Files (3 total):
- `app.component.html` - Replace 6 dialog blocks with component tags
- `app.component.ts` - Remove ~12 methods, add event handlers
- `app.module.ts` - Register 6 new components

### Expected Results:
- **HTML Reduction**: ~300 lines from app.component.html
- **TypeScript Reduction**: ~150 lines from app.component.ts  
- **Risk Level**: Medium-Low (selective extraction)
- **Testing**: Manual verification only

This implementation guide provides the complete step-by-step process to refactor all dialogs from the monolithic app component into separate, maintainable components following established Angular patterns.