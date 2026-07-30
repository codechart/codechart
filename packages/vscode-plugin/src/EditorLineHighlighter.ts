import * as vscode from 'vscode';

export class EditorLineHighlighter {    
    private static instance: EditorLineHighlighter;

    private singleLineHighlightDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 255, 0, 0.3)', // Yellow background with 30% opacity
        isWholeLine: true,
      });
    
    private multiLineHighlightDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(0, 255, 0, 0.3)',
        isWholeLine: true,
    });

    static getInstance(): EditorLineHighlighter {
        if (!this.instance) {
            this.instance = new EditorLineHighlighter();
        }

        return this.instance;
    }

    public async highlightSingleLine(targetEditor: vscode.TextEditor, filePath: string, lineNumber: number) {
        const range = new vscode.Range(lineNumber, 0, lineNumber, 0);

        targetEditor.setDecorations(this.singleLineHighlightDecorationType, [range]);
    }

    public async highlightMultipleLines(targetEditor: vscode.TextEditor, filePath: string, lineNumbers: number[]) {
        const ranges = lineNumbers.map(lineNumber => new vscode.Range(lineNumber, 0, lineNumber, 0));

        // Decorations are per-editor, not per-document: highlighting a new editor does not
        // clear the previous one, so old highlights would pile up across files.
        this.clearAllExcept(targetEditor);

        targetEditor.setDecorations(this.multiLineHighlightDecorationType, ranges);
    }

    public clear(targetEditor: vscode.TextEditor) {
        targetEditor.setDecorations(this.singleLineHighlightDecorationType, []);
        targetEditor.setDecorations(this.multiLineHighlightDecorationType, []);
    }

    private clearAllExcept(keepEditor: vscode.TextEditor) {
        for (const editor of vscode.window.visibleTextEditors) {
            if (editor === keepEditor) {
                continue;
            }
            this.clear(editor);
        }
    }
}