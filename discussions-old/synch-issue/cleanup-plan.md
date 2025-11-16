# Cleanup and Refactoring Plan

## A. Log Cleanup

### Files to clean:
- `packages/ui/src/app/chart/synch.actions.ts`
  - Remove all `[SYNCH_DEBUG]` tags and development debug logs
  - Replace with concise descriptive logs:
    - "Starting file comparison"
    - "Found similar line at position X"
    - "Line mapping completed"

- Test files in `/synch-issue/`
  - Keep final results table in test.js
  - Remove intermediate debug console.log statements
  - Keep essential test progress indicators

## B. Synch-Issue Folder Organization

### Current Structure Analysis:
```
/synch-issue/
├── test.js, setup.js, sync-test-scenarios.md    # Core test files
├── sample-*.ts, app.interceptor.service-modified.ts, GitRepo-modified.ts  # Test data
├── debug-*.js, test-*.js                        # Experimental files
├── /difflines-testing/                          # Old experimental folder
├── /archive/ (EXISTS)                           # PatienceDiff.js, patience-diff-reversion-log.md
└── /logs/ (EXISTS)                              # Test logs
```

### Target Structure:
```
/synch-issue/
├── /tests/          # NEW - move core test files here
│   ├── test.js
│   ├── setup.js
│   └── sync-test-scenarios.md
├── /test-data/      # NEW - move sample files here
│   ├── sample-original.ts
│   ├── sample-modified.ts
│   ├── app.interceptor.service-modified.ts
│   └── GitRepo-modified.ts
├── /archive/        # EXISTS - add remaining experimental files
│   ├── patience-diff-reversion-log.md ✓
│   ├── PatienceDiff.js ✓
│   ├── debug-indentation.js (MOVE)
│   ├── debug-similarity.js (MOVE)
│   ├── test-tokenization.js (MOVE)
│   ├── test-patience-diff.js (MOVE)
│   └── /difflines-testing/ (MOVE ENTIRE FOLDER)
└── /logs/           # EXISTS ✓
```

## C. Text-Diff Module Organization

### Current State:
- `packages/ui/src/app/chart/text.comparison.ts` - Contains all text diff functionality
- `NodeChange` interface duplicated in synch.actions.ts and text.comparison.ts

### Target Structure:
```
/packages/ui/src/app/text-diff/
├── text.comparison.ts       # (MOVE from chart/)
└── textDiffTypes.ts         # (NEW - extract NodeChange interface)
```

### Changes:
- Move `text.comparison.ts` from `/chart/` to `/text-diff/`
- Extract `NodeChange` interface to `textDiffTypes.ts`
- Update imports in `synch.actions.ts`
- **Note:** text.comparison.ts already contains all needed functionality (diffLines, isSimilarLine, findSimilarLine)

### Benefits:
1. **Separation of concerns**: Text diffing logic isolated from chart orchestration
2. **No duplication**: Single location for NodeChange interface
3. **Maintainability**: Clear boundaries between text comparison and chart logic

## Implementation Order:
1. ✅ Clean logs in existing files
   - Removed all `[SYNCH_DEBUG]` tags from synch.actions.ts
   - Replaced with concise descriptive logs
   - Test files were already clean
2. ✅ Reorganize synch-issue folder structure
   - Created `/tests/` and moved: test.js, setup.js, sync-test-scenarios.md
   - Created `/test-data/` and moved: sample-*.ts, app.interceptor.service-modified.ts, GitRepo-modified.ts
   - Moved to `/archive/`: debug-*.js, test-*.js, entire difflines-testing/ folder
3. ✅ Create text-diff folder and move text.comparison.ts
   - Created `/packages/ui/src/app/text-diff/` folder
   - Moved text.comparison.ts from chart/ to text-diff/
4. ✅ Extract NodeChange interface to textDiffTypes.ts
   - Created textDiffTypes.ts with NodeChange interface
   - Updated text.comparison.ts to import NodeChange
5. ✅ Update imports in synch.actions.ts
   - Updated import path for text comparison functions
   - Added import for NodeChange interface
   - Removed duplicate NodeChange interface definition
6. ✅ Verify all functionality still works
   - Fixed test file paths in setup.js
   - TypeScript compilation passes with no errors
   - Test runs successfully and produces expected results

## Next Steps

After cleanup, address the remaining issue: **diffLines method still corrupts originalLineText data**
- This is the root cause that our similarity search fixes work around
- Should be investigated and fixed in text.comparison.ts once moved to text-diff module