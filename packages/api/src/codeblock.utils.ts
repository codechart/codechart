/**
 * codeBlockUtils.ts
 * Utility for determining code block boundaries
 */

// Types
export interface BlockInfo {
  type: 'brackets' | 'indentation';
  openChar?: string;
  closeChar?: string;
}

// Private helper functions (not exported)
function detectBlockType(line: string): BlockInfo | undefined {
  if (!line) return undefined;
  
  // Process the line to ignore comments and strings
  const processedLine = removeCommentsAndStrings(line);
  
  // Bracket detection
  const bracketPairs = [
    { open: '{', close: '}' },
    { open: '(', close: ')' },
    { open: '[', close: ']' }
  ];
  
  for (const { open, close } of bracketPairs) {
    let count = 0;
    for (let i = 0; i < processedLine.length; i++) {
      if (processedLine[i] === open) count++;
      if (processedLine[i] === close) count--;
    }
    
    if (count > 0) {
      return { type: 'brackets', openChar: open, closeChar: close };
    }
  }
  
  // Check for indentation-based blocks
  if (line.trim().match(/:\s*(?:\/\/.*)?$/)) {
    return { type: 'indentation' };
  }
  
  return undefined;
}

function removeCommentsAndStrings(line: string): string {
  if (!line) return '';
  
  let processed = line;
  processed = processed.replace(/\/\*.*?\*\//g, '');
  processed = processed.replace(/\/\/.*$/, '');
  processed = processed.replace(/"([^"\\]|\\.)*"/g, '""');
  processed = processed.replace(/'([^'\\]|\\.)*'/g, "''");
  processed = processed.replace(/`([^`\\]|\\.)*`/g, '``');
  
  return processed;
}

function findMatchingBracket(lines: string[], startLineIndex: number, openChar: string, closeChar: string): number | undefined {
  if (!lines || startLineIndex < 0 || startLineIndex >= lines.length) return undefined;
  
  let count = 0;
  let lineOffset = 0;
  
  for (const char of removeCommentsAndStrings(lines[startLineIndex])) {
    if (char === openChar) count++;
    if (char === closeChar) count--;
  }
  
  while (count > 0 && startLineIndex + lineOffset + 1 < lines.length) {
    lineOffset++;
    const processedLine = removeCommentsAndStrings(lines[startLineIndex + lineOffset]);
    
    for (const char of processedLine) {
      if (char === openChar) count++;
      if (char === closeChar) count--;
    }
  }
  
  return count === 0 ? lineOffset : undefined;
}

function findIndentationEnd(lines: string[], startLineIndex: number): number | undefined {
  if (!lines || startLineIndex < 0 || startLineIndex >= lines.length) return undefined;
  
  const startIndentation = getIndentation(lines[startLineIndex]);
  let lineOffset = 0;
  let foundIndentedContent = false;
  
  while (++lineOffset < lines.length - startLineIndex) {
    const currentLine = lines[startLineIndex + lineOffset];
    
    if (!currentLine.trim() || currentLine.trim().startsWith('//')) continue;
    
    const currentIndentation = getIndentation(currentLine);
    if (currentIndentation <= startIndentation) return undefined;
    
    foundIndentedContent = true;
    break;
  }
  
  if (!foundIndentedContent) return undefined;
  
  let lastBlockLine = lineOffset;
  
  while (startLineIndex + lineOffset < lines.length - 1) {
    lineOffset++;
    const currentLine = lines[startLineIndex + lineOffset];
    
    if (!currentLine.trim()) continue;
    
    const currentIndentation = getIndentation(currentLine);
    if (currentIndentation <= startIndentation) break;
    
    lastBlockLine = lineOffset;
  }
  
  return lastBlockLine;
}

function getIndentation(line: string): number {
  if (!line) return 0;
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

/**
 * Determines the ending line of a code block starting at a given line index
 * 
 * @param lines Array of code lines
 * @param lineIndex Starting line index to analyze
 * @returns Number of lines to the end of the block from the starting line, or undefined if no block detected
 */
export function getEndLineOfBlock(lines: string[], lineIndex: number): number | undefined {
  if (!lines || lineIndex < 0 || lineIndex >= lines.length) return undefined;

  const startLine = lines[lineIndex];
  const blockType = detectBlockType(startLine);
  
  if (!blockType) return undefined;
  
  let endLineOffset: number | undefined;
  
  switch (blockType.type) {
    case 'brackets':
      endLineOffset = findMatchingBracket(lines, lineIndex, blockType.openChar!, blockType.closeChar!);
      break;
    case 'indentation':
      endLineOffset = findIndentationEnd(lines, lineIndex);
      break;
    default:
      return undefined;
  }
  
  return endLineOffset;
}

// Only export the single function
export default getEndLineOfBlock;