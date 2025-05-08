/**
 * Code Block Analyzer module
 * Helps identify and analyze code blocks in source code
 */

// Types
export interface BlockInfo {
    type: 'brackets' | 'indentation';
    openChar?: string;
    closeChar?: string;
  }
  
  /**
   * CodeBlockAnalyzer provides utilities for detecting and analyzing code blocks
   */
  export class CodeBlockAnalyzer {
    /**
     * Determines the ending line of a code block starting at a given line index
     * 
     * @param lines Array of code lines
     * @param lineIndex Starting line index to analyze
     * @returns Number of lines to the end of the block from the starting line, or undefined if no block detected
     */
    public static getEndLineOfBlock(lines: string[], lineIndex: number): number | undefined {
      // Input validation
      if (!lines || lineIndex < 0 || lineIndex >= lines.length) return undefined;
  
      // 1. Detect block type by examining the starting line
      const startLine = lines[lineIndex];
      const blockType = this.detectBlockType(startLine);
      
      if (!blockType) return undefined;
      
      // 2. Find end of block based on detected type
      let endLineOffset: number | undefined;
      
      switch (blockType.type) {
        case 'brackets':
          endLineOffset = this.findMatchingBracket(lines, lineIndex, blockType.openChar!, blockType.closeChar!);
          break;
        case 'indentation':
          endLineOffset = this.findIndentationEnd(lines, lineIndex);
          break;
        default:
          return undefined;
      }
      
      return endLineOffset;
    }
  
    /**
     * Detects what type of block starts at the given line
     */
    private static detectBlockType(line: string): BlockInfo | undefined {
      if (!line) return undefined;
      
      // Process the line to ignore comments and strings
      const processedLine = this.removeCommentsAndStrings(line);
      
      // More intelligent bracket detection - find the rightmost unmatched bracket
      const bracketPairs = [
        { open: '{', close: '}' },
        { open: '(', close: ')' },
        { open: '[', close: ']' }
      ];
      
      for (const { open, close } of bracketPairs) {
        // Check if there's an unbalanced bracket
        let count = 0;
        for (let i = 0; i < processedLine.length; i++) {
          if (processedLine[i] === open) count++;
          if (processedLine[i] === close) count--;
        }
        
        if (count > 0) {
          return { type: 'brackets', openChar: open, closeChar: close };
        }
      }
      
      // Check for indentation-based blocks (e.g., Python)
      if (line.trim().match(/:\s*(?:\/\/.*)?$/)) {
        return { type: 'indentation' };
      }
      
      return undefined;
    }
  
    /**
     * Removes comments and string literals from a line of code
     */
    private static removeCommentsAndStrings(line: string): string {
      if (!line) return '';
      
      // Remove single and multi-line comments
      let processed = line;
      // Remove multi-line comment blocks
      processed = processed.replace(/\/\*.*?\*\//g, '');
      // Remove single-line comments
      processed = processed.replace(/\/\/.*$/, '');
      
      // Remove string literals, handling escaped quotes
      processed = processed.replace(/"([^"\\]|\\.)*"/g, '""');
      processed = processed.replace(/'([^'\\]|\\.)*'/g, "''");
      processed = processed.replace(/`([^`\\]|\\.)*`/g, '``');
      
      return processed;
    }
  
    /**
     * Finds the end of a bracket-based block
     */
    private static findMatchingBracket(lines: string[], startLineIndex: number, openChar: string, closeChar: string): number | undefined {
      if (!lines || startLineIndex < 0 || startLineIndex >= lines.length) return undefined;
      
      let count = 0;
      let lineOffset = 0;
      
      // Process the first line
      const firstLine = lines[startLineIndex];
      
      // Count brackets in the first line
      for (const char of this.removeCommentsAndStrings(firstLine)) {
        if (char === openChar) count++;
        if (char === closeChar) count--;
      }
      
      // Process subsequent lines until brackets balance out
      while (count > 0 && startLineIndex + lineOffset + 1 < lines.length) {
        lineOffset++;
        const currentLine = lines[startLineIndex + lineOffset];
        const processedLine = this.removeCommentsAndStrings(currentLine);
        
        for (const char of processedLine) {
          if (char === openChar) count++;
          if (char === closeChar) count--;
        }
      }
      
      // If brackets never balanced, return undefined
      if (count !== 0) return undefined;
      
      return lineOffset;
    }
  
    /**
     * Finds the end of an indentation-based block
     */
    private static findIndentationEnd(lines: string[], startLineIndex: number): number | undefined {
      if (!lines || startLineIndex < 0 || startLineIndex >= lines.length) return undefined;
      
      const startIndentation = this.getIndentation(lines[startLineIndex]);
      let lineOffset = 0;
      let foundIndentedContent = false;
      
      // Find first indented line
      while (++lineOffset < lines.length - startLineIndex) {
        const currentLine = lines[startLineIndex + lineOffset];
        
        // Skip empty or comment-only lines
        if (!currentLine.trim() || currentLine.trim().startsWith('//') || 
            currentLine.trim().startsWith('/*')) {
          continue;
        }
        
        const currentIndentation = this.getIndentation(currentLine);
        
        // If first non-empty line isn't indented more than the start line, no block exists
        if (currentIndentation <= startIndentation) return undefined;
        
        foundIndentedContent = true;
        break;
      }
      
      if (!foundIndentedContent) return undefined;
      
      // Now find where the block ends
      let lastBlockLine = lineOffset;
      
      while (startLineIndex + lineOffset < lines.length - 1) {
        lineOffset++;
        const currentLine = lines[startLineIndex + lineOffset];
        
        // Skip empty lines
        if (!currentLine.trim()) continue;
        
        const currentIndentation = this.getIndentation(currentLine);
        
        // If we found a line with indentation level <= start line, block is over
        if (currentIndentation <= startIndentation) break;
        
        lastBlockLine = lineOffset;
      }
      
      return lastBlockLine;
    }
  
    /**
     * Gets the indentation level of a line
     */
    private static getIndentation(line: string): number {
      if (!line) return 0;
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    }
  }
  
  // Named exports
  export const getEndLineOfBlock = CodeBlockAnalyzer.getEndLineOfBlock.bind(CodeBlockAnalyzer);
  
  // Default export
  export default CodeBlockAnalyzer;