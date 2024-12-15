import * as vscode from "vscode";
import * as fs from 'fs';
import { getWorkspaceFolder } from "./utils";
import { WebviewMdFile } from './WebviewMdFile';
import { EditorLineHighlighter } from "./EditorLineHighlighter";

export class PanelWebviewProvider {
    private panel: vscode.WebviewPanel | undefined;

    private _webviewMdFile: WebviewMdFile | undefined;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly extensionPath: vscode.Uri
    ) {
        this.initializePanel();
    }

    getPanel(): vscode.WebviewPanel | undefined {
        return this.panel;
    }

    get webviewMdFile(): WebviewMdFile {
        return this._webviewMdFile!;
    }

    set webviewMdFile(value: WebviewMdFile) {
        this._webviewMdFile = value;
    }

    public initializePanel() {
        this.panel = vscode.window.createWebviewPanel(
            'webview-provider',
            'Covalent',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [this.extensionPath]
            }
        );

        this.panel.webview.html = this.getWebviewHtml();

        // Handle panel disposal
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            async event => {
                switch (event.action) {
                    case 'goToLineEvent':
                        try {
                            const targetEditor = await this.getOrCreateEditor(event.filePath, true);
                            const range = targetEditor.document.lineAt(event.lineNumber - 1).range;
                            targetEditor.selection = new vscode.Selection(range.start, range.end);
                            await targetEditor.revealRange(range);
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to open file ${event.filePath}: ${error}`);
                        }
                        return;

                    case 'updateWebviewMdEvent':
                        try {
                            this.webviewMdFile.createWebviewMdFileIfNotExists();
                            const webviewMdFilePath = this.webviewMdFile.getWebviewMdFilePath();

                            if (!webviewMdFilePath) {
                                return;
                            }

                            console.log('Before getting editor:', vscode.window.activeTextEditor?.document.uri.fsPath);
                            const targetEditor = await this.getOrCreateEditor(webviewMdFilePath);
                            console.log('After getting editor:', targetEditor.document.uri.fsPath);
                            console.log('Current text:', targetEditor.document.getText());
                            console.log('New text:', event.text);

                            await targetEditor.edit(editBuilder => {
                                editBuilder.replace(new vscode.Range(
                                    targetEditor.document.positionAt(0),
                                    targetEditor.document.positionAt(targetEditor.document.getText().length)
                                ), event.text);
                            });
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to update MD file: ${error}`);
                        }
                        return;

                    case 'highlightFilesInIdeEvent':
                        try {
                            const activeEditor = vscode.window.activeTextEditor;

                            if (activeEditor === undefined) {
                                return;
                            }

                            if (event.fileInfo === undefined) {
                                return;
                            }

                            const fileInfo = event.fileInfo.split('::');
                            const filePath = fileInfo[0];
                            const lineNumbers = fileInfo[1].split(',').map(Number);

                            EditorLineHighlighter.getInstance().highlightMultipleLines(filePath, lineNumbers);
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to open file ${event.filePath}: ${error}`);
                        }
                        return;
                }
            },
            undefined,
            this.context.subscriptions
        );

        if (this._webviewMdFile) {
            this._webviewMdFile.setWebviewTextFromFile();
        }
    }

    refresh(): void {
        if (this.panel === undefined) {
            return;
        }
        this.panel.webview.html = ""
        setTimeout(() => { if (this.panel) { this.panel.webview.html = this.getWebviewHtml() } }, 500)
    }

    public sendDataToWebView(filePath: string, lineNumber: number) {
        if (this.panel === undefined) {
            return;
        }

        this.panel.webview.postMessage({
            action: 'clickedOnLineInFile',
            data: {
                filePath: filePath,
                projectPath: getWorkspaceFolder(),
                lineContent: vscode.window.activeTextEditor?.document.lineAt(vscode.window.activeTextEditor?.selection.active.line).text,
                lineNumber: lineNumber,
                fileContent: vscode.window.activeTextEditor?.document.getText()
            }
        });
    }

    public sendFilePathAndLineNumberToWebView(filePath: string, lineNumber: number) {
        if (this.panel === undefined) {
            return;
        }

        this.panel.webview.postMessage({
            action: 'Editor_LineNumberChanged_VsCodeEvent',
            currentFilePath: filePath,
            lineNumber: lineNumber,
        });
    }

    public updateWebviewMdContent(webviewText: string | undefined) {
        if (this.panel === undefined) {
            return;
        }

        this.panel.webview.postMessage({
            action: 'UpdateWebviewMd_VsCodeEvent',
            text: webviewText
        });
    }

    private getWebviewHtml() {
        const htmlPath = vscode.Uri.joinPath(this.extensionPath, 'webview', 'vscode-plugin.html');
        const htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');

        return htmlContent;
    }

    private async getOrCreateEditor(filePath: string, preserveFocus: boolean = false): Promise<vscode.TextEditor> {
        // Search through all groups and their tabs
        for (const group of vscode.window.tabGroups.all) {
            const tab = group.tabs.find(tab =>
                tab.input instanceof vscode.TabInputText &&
                tab.input.uri.fsPath === filePath
            );

            if (tab && tab.input instanceof vscode.TabInputText) {
                // Found the tab, make it active in its current group
                return await vscode.window.showTextDocument(
                    await vscode.workspace.openTextDocument(tab.input.uri),
                    {
                        viewColumn: group.viewColumn,
                        preserveFocus
                    }
                );
            }
        }

        // File wasn't found in any existing tabs
        // Find first non-webview group to open it in
        const targetGroup = vscode.window.tabGroups.all.find(group =>
            !group.tabs.some(tab => tab.label === 'Covalent')  // Adjust 'Covalent' to match your webview title
        );

        // Open document in target group or first group if no suitable group found
        const document = await vscode.workspace.openTextDocument(filePath);
        return await vscode.window.showTextDocument(document, {
            viewColumn: targetGroup?.viewColumn || vscode.ViewColumn.One,
            preserveFocus
        });
    }
}
