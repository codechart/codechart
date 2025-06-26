import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getWorkspaceFolder } from './utils';
import { PanelWebviewProvider } from './panelWebviewProvider';

export class WebviewMdFile {
    constructor(
        private readonly context: vscode.ExtensionContext,
		private readonly webviewProvider: PanelWebviewProvider
	) {}

    public createWebviewMdFileIfNotExists(): void {
        const webviewPath = this.getWebviewMdFilePath();

        if (webviewPath === undefined) {
            return;
        }

        if (!fs.existsSync(webviewPath)) {
            fs.writeFileSync(webviewPath, '', {flag: 'w'});
        }
    }

    public getWebviewMdFilePath(): string | undefined {
        const workspaceFolder = getWorkspaceFolder();
        if (workspaceFolder === undefined) {
            return;
        }
    
        return path.join(workspaceFolder, 'covalent-group.md');
    }

    public setup() {
        this.createWebviewMdFileIfNotExists();

        this.setWebviewTextFromFile();

        this.setupListener();
    }

    public setupListener() {
        const webviewPath = this.getWebviewMdFilePath();

        if (webviewPath === undefined) {
            return;
        }

        const disposable = vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
            vscode.window.activeTextEditor?.edit((edit: vscode.TextEditorEdit) => {
                const uri: vscode.Uri  | undefined = vscode.window.activeTextEditor?.document.uri;
                const filePath: string | undefined = uri?.fsPath;

                if (filePath === webviewPath) {
                    this.webviewProvider.updateWebviewMdContent(vscode.window.activeTextEditor?.document.getText());
                }
            });
        });

        this.context.subscriptions.push(disposable);
    }

    public setWebviewTextFromFile() {
        const webviewPath = this.getWebviewMdFilePath();

        if (webviewPath === undefined) {
            return;
        }

        this.createWebviewMdFileIfNotExists();
        const text = fs.readFileSync(webviewPath,'utf8');
        this.webviewProvider.updateWebviewMdContent(text);
    }
}