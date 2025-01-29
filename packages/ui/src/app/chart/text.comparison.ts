import { createPatch, parsePatch } from 'diff';

export interface LineInfo {
    lineNumber: number;
    content: string;
}

export class TextComparison {
    private sortedLines: LineInfo[] = [];
    private lineMap = new Map<number, number>();

    constructor() {
        this.sortedLines = [];
        this.lineMap = new Map<number, number>();
    }   

    // trackLines(oldText: string, newText: string, lines: LineInfo[]): (number | null)[] {
    trackLines(oldText: string, newText: string, lines: LineInfo[]): (number | null | string)[] {
        this.initializeTracking(lines);
        const diff = parsePatch(createPatch('file', oldText, newText))[0].hunks;
        const results = new Array(lines.length).fill(null);

        let lineIdx = 0;
        for (const hunk of diff) {
            let oldLine = hunk.oldStart;
            let newLine = hunk.newStart;

            for (const change of hunk.lines) {
                while (lineIdx < this.sortedLines.length &&
                    this.sortedLines[lineIdx].lineNumber < oldLine) {
                    lineIdx++;
                }

                if (lineIdx < this.sortedLines.length &&
                    this.sortedLines[lineIdx].lineNumber === oldLine) {
                    const originalIdx = this.lineMap.get(oldLine)!;
                    results[originalIdx] = { lineNumber: change[0] === '-' ? null : newLine, oldContent: this.sortedLines[lineIdx].content, newContent: change.slice(1) };
                }

                if (change[0] !== '+') oldLine++;
                if (change[0] !== '-') newLine++;
            }
        }

        return results;
    }

    private initializeTracking(lines: LineInfo[]): void {
        this.sortedLines = [...lines].sort((a, b) => a.lineNumber - b.lineNumber);
        this.lineMap = new Map<number, number>(lines.map((l, i): [number, number] => [l.lineNumber, i]));
    }
}