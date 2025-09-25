# Cleanup and Refactoring Plan

## A. Log Cleanup

### Files to clean:
- `packages/ui/src/app/chart/synch.actions.ts`
  - Remove all `[SYNCH_DEBUG]` tags and development debug logs
  - Replace with concise descriptive logs:
    - "Starting file comparison"
    - "Found similar line at position X"
    - "Line mapping completed"
    - "Similarity search triggered for line X"

- Test files in `/synch-issue/tests/`
  - Keep final results table in test.js
  - Remove intermediate debug console.log statements
  - Keep essential test progress indicators

## B. Synch-Issue Folder Organization

### New Structure:
```
/synch-issue/
├── /tests/          # Core test files
│   ├── test.js
│   ├── setup.js
│   └── sync-test-scenarios.md
├── /test-data/      # Sample files for testing
│   ├── sample-original.ts
│   ├── sample-modified.ts
│   └── app.interceptor.service-modified.ts
├── /archive/        # Old experimental files
│   ├── debug-indentation.js
│   ├── debug-similarity.js
│   ├── test-tokenization.js
│   └── /difflines-testing/
└── /logs/           # Keep existing logs folder
```

### Files to Remove (obsolete/experimental):
- `debug-indentation.js`
- `debug-similarity.js` 
- `test-tokenization.js`
- Files in `/difflines-testing/` (move to archive)

## C. Text-Diff Module Creation

### New Folder Structure:
```
/packages/ui/src/app/text-diff/
├── textCompare.ts           # (existing file moved from chart/)
├── patienceDiffWrapper.ts   # (existing file moved from chart/)  
├── lineSimilarity.ts        # (extracted from synch.actions)
├── textDiffService.ts       # (new service class)
└── textDiffTypes.ts         # (shared interfaces)
```

### Split synch.actions.ts:

#### Move to text-diff/lineSimilarity.ts:
- `findSimilarLine()` method
- Similarity algorithm functions
- Text tokenization logic
- Line comparison utilities

#### Move to text-diff/textDiffService.ts:
- Create service class to encapsulate:
  - Line similarity detection
  - Text comparison workflows
  - Similarity scoring algorithms

#### Keep in synch.actions.ts:
- `compareFileContent()` method (orchestration)
- Node creation and management
- File change detection logic
- Chart integration code

### Benefits:
1. **Separation of concerns**: Text diffing logic isolated from chart orchestration
2. **Testability**: Text diff service can be unit tested independently
3. **Reusability**: Text diff components can be used by other parts of the application
4. **Maintainability**: Clear boundaries between different functional areas

### Implementation Order:
1. Clean logs in existing files
2. Reorganize synch-issue folder
3. Create text-diff folder structure
4. Extract and move text comparison logic
5. Create TextDiffService class
6. Update imports in synch.actions.ts
7. Verify all functionality still works

## Next Steps

After cleanup, address the remaining issue: **diffLines method still corrupts originalLineText data**
- This is the root cause that our similarity search fixes work around
- Should be investigated and fixed in the textCompare.ts once moved to text-diff module