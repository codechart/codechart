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
            console.error('createWebviewMdFileIfNotExists: Could not determine webview path');
            return;
        }

        try {
            if (!fs.existsSync(webviewPath)) {
                fs.writeFileSync(webviewPath, '', {flag: 'w'});
            }
        } catch (error) {
            console.error(`[WebviewMdFile] Error creating file: ${error}`);
        }
    }

    public getWebviewMdFilePath(): string | undefined {
        const workspaceFolder = getWorkspaceFolder();
        if (workspaceFolder === undefined) {
            return;
        }
    
        return path.join(workspaceFolder, 'cochart-node-content.md');
    }

    public setup() {
        this.createWebviewMdFileIfNotExists();

        this.setWebviewTextFromFile();

        this.setupListener();
    }

    public setupListener() {
        const webviewPath = this.getWebviewMdFilePath();

        if (webviewPath === undefined) {
            console.error('[WebviewMdFile] Error: Could not determine webview path');
            return;
        }

        try {
            const disposable = vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
                const filePath: string | undefined = event.document.uri.fsPath;

                if (filePath === webviewPath) {
                    try {
                        this.webviewProvider.updateWebviewMdContent(event.document.getText());
                    } catch (error) {
                        console.error('[WebviewMdFile] Error updating webview content:', error);
                    }
                }
            });

            this.context.subscriptions.push(disposable);
        } catch (error) {
            console.error('[WebviewMdFile] Error setting up file listener:', error);
        }
    }

    public setWebviewTextFromFile() {
        const webviewPath = this.getWebviewMdFilePath();

        if (webviewPath === undefined) {
            console.error('setWebviewTextFromFile: Could not determine webview path');
            return;
        }

        try {
            this.createWebviewMdFileIfNotExists();
            const text = fs.readFileSync(webviewPath,'utf8');
            this.webviewProvider.updateWebviewMdContent(text);
        } catch (error) {
            console.error(`[WebviewMdFile] Error reading or setting file content: ${error}`);
        }
    }
}