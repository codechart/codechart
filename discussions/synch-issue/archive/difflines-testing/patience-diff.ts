import { PatienceDiff } from 'patience-diff';

interface LineInfo {
  lineNumber: number;
  content: string;
}

interface LineChange {
  originalLineNumber: number;
  originalContent: string;
  status: 'moved' | 'modified' | 'deleted' | 'unchanged';
  newLineNumber?: number;
  newContent?: string;
  movedTo?: number;
}

interface DiffResult {
  lines: any[];
  lineCountDeleted: number;
  lineCountInserted: number;
  lineCountMoved: number;
}

export class LineChangeTracker {
  
  /**
   * Analyzes changes between original and updated text for specific lines
   */
  analyzeLineChanges(
    originalText: string,
    updatedText: string,
    trackedLines: LineInfo[]
  ): LineChange[] {
    
    const originalLines = originalText.split('\n');
    const updatedLines = updatedText.split('\n');
    
    // Run patience diff
    const diffResult: DiffResult = PatienceDiff(originalLines, updatedLines);
    
    // Build mapping from original to new line numbers
    const lineMapping = this.buildLineMapping(diffResult, originalLines, updatedLines);
    
    // Analyze each tracked line
    return trackedLines.map(lineInfo => 
      this.analyzeLineChange(lineInfo, lineMapping, updatedLines)
    );
  }

  private buildLineMapping(
    diffResult: DiffResult, 
    originalLines: string[], 
    updatedLines: string[]
  ): Map<number, { newLineNumber: number; content: string; status: string }> {
    
    const mapping = new Map<number, { newLineNumber: number; content: string; status: string }>();
    
    let originalIndex = 0;
    let updatedIndex = 0;
    
    for (const diffLine of diffResult.lines) {
      const { line, aIndex, bIndex } = diffLine;
      
      if (aIndex !== -1 && bIndex !== -1) {
        // Line exists in both (might be modified or unchanged)
        const originalContent = originalLines[aIndex];
        const updatedContent = updatedLines[bIndex];
        
        mapping.set(aIndex + 1, {
          newLineNumber: bIndex + 1,
          content: updatedContent,
          status: originalContent === updatedContent ? 'unchanged' : 'modified'
        });
        
      } else if (aIndex !== -1 && bIndex === -1) {
        // Line deleted from original
        mapping.set(aIndex + 1, {
          newLineNumber: -1,
          content: '',
          status: 'deleted'
        });
        
      }
      // Lines with aIndex === -1 are insertions, not relevant for original line tracking
    }
    
    // Handle moved lines by checking content matches
    this.detectMovedLines(mapping, originalLines, updatedLines);
    
    return mapping;
  }

  private detectMovedLines(
    mapping: Map<number, { newLineNumber: number; content: string; status: string }>,
    originalLines: string[],
    updatedLines: string[]
  ): void {
    
    // Find deleted lines that might have moved
    const deletedLines = new Map<string, number[]>();
    
    for (const [originalLineNum, info] of mapping.entries()) {
      if (info.status === 'deleted') {
        const content = originalLines[originalLineNum - 1];
        if (!deletedLines.has(content)) {
          deletedLines.set(content, []);
        }
        deletedLines.get(content)!.push(originalLineNum);
      }
    }
    
    // Look for matches in updated text
    updatedLines.forEach((content, index) => {
      if (deletedLines.has(content)) {
        const originalLineNums = deletedLines.get(content)!;
        
        if (originalLineNums.length > 0) {
          const originalLineNum = originalLineNums.shift()!;
          
          // Check if this line isn't already mapped
          let alreadyMapped = false;
          for (const [, info] of mapping.entries()) {
            if (info.newLineNumber === index + 1 && info.status !== 'deleted') {
              alreadyMapped = true;
              break;
            }
          }
          
          if (!alreadyMapped) {
            mapping.set(originalLineNum, {
              newLineNumber: index + 1,
              content: content,
              status: 'moved'
            });
          }
        }
      }
    });
  }

  private analyzeLineChange(
    lineInfo: LineInfo,
    mapping: Map<number, { newLineNumber: number; content: string; status: string }>,
    updatedLines: string[]
  ): LineChange {
    
    const mappingInfo = mapping.get(lineInfo.lineNumber);
    
    if (!mappingInfo) {
      // Line not found in diff result, assume deleted
      return {
        originalLineNumber: lineInfo.lineNumber,
        originalContent: lineInfo.content,
        status: 'deleted'
      };
    }
    
    const result: LineChange = {
      originalLineNumber: lineInfo.lineNumber,
      originalContent: lineInfo.content,
      status: mappingInfo.status as 'moved' | 'modified' | 'deleted' | 'unchanged'
    };
    
    if (mappingInfo.newLineNumber > 0) {
      result.newLineNumber = mappingInfo.newLineNumber;
      result.newContent = mappingInfo.content;
      
      if (mappingInfo.status === 'moved') {
        result.movedTo = mappingInfo.newLineNumber;
      }
    }
    
    return result;
  }
}

// Usage example
export function trackLineChanges(
  originalText: string,
  updatedText: string,
  trackedLines: LineInfo[]
): LineChange[] {
  const tracker = new LineChangeTracker();
  return tracker.analyzeLineChanges(originalText, updatedText, trackedLines);
}

// Helper function to create LineInfo objects
export function createLineInfo(lineNumber: number, content: string): LineInfo {
  return { lineNumber, content };
}