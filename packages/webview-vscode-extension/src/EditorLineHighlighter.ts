import * as vscode from 'vscode';
import * as path from 'path';

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

    public async highlightSingleLine(filePath: string, lineNumber: number) {          
        const fileUri = vscode.Uri.file(path.resolve(filePath));
      
        const document = await vscode.workspace.openTextDocument(fileUri);
        const editor = await vscode.window.showTextDocument(document);
        const range = new vscode.Range(lineNumber, 0, lineNumber, 0);
      
        editor.setDecorations(this.singleLineHighlightDecorationType, [range]);
    }

    public async highlightMultipleLines(filePath: string, lineNumbers: number[]) {          
        const fileUri = vscode.Uri.file(path.resolve(filePath));
      
        const document = await vscode.workspace.openTextDocument(fileUri);
        const editor = await vscode.window.showTextDocument(document);
        const ranges = lineNumbers.map(lineNumber => new vscode.Range(lineNumber, 0, lineNumber, 0));        
      
        editor.setDecorations(this.multiLineHighlightDecorationType, ranges);
    }
}