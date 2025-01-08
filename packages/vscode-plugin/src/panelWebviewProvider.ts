import * as vscode from "vscode";
import * as fs from 'fs';
import { getWorkspaceFolder } from "./utils";
import { WebviewMdFile } from './WebviewMdFile';
import { EditorLineHighlighter } from "./EditorLineHighlighter";
import path = require("path");

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
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                localResourceRoots: [this.extensionPath],
                retainContextWhenHidden: true
            }
        );

        this.panel.iconPath = vscode.Uri.file(path.join(this.extensionPath.fsPath, 'media', 'pluginIcon.svg'));


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
                            const targetEditor = await this.getOrCreateEditor(event.projectPath, event.filePath, true);
                            if (!event.lineNumber) return

                            const range = targetEditor.document.lineAt(event.lineNumber - 1).range;
                            targetEditor.selection = new vscode.Selection(range.start, range.end);
                            await targetEditor.revealRange(range);

                            EditorLineHighlighter.getInstance().highlightMultipleLines(targetEditor, event.filePath, [event.lineNumber]);
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to open file ${event.filePath}\n: ${error}`);
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
                            const targetEditor = await this.getOrCreateEditor(null, webviewMdFilePath);
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

                            EditorLineHighlighter.getInstance().highlightMultipleLines(activeEditor, filePath, lineNumbers);
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

    public sendLineToWebview(filePath: string, lineNumber: number) {
        if (this.panel === undefined) {
            return;
        }

        this.panel.webview.postMessage({
            action: 'clickedOnLine',
            data: {
                filePath: filePath,
                projectPath: getWorkspaceFolder(),
                lineContent: vscode.window.activeTextEditor?.document.lineAt(vscode.window.activeTextEditor?.selection.active.line).text,
                lineNumber: lineNumber,
                fileContent: vscode.window.activeTextEditor?.document.getText()
            }
        });
    }

    public sendFileToWebview(filePath: string) {
        if (this.panel === undefined) {
            return;
        }

        this.panel.webview.postMessage({
            action: 'clickedOnFile',
            data: {
                filePath: filePath,
                projectPath: getWorkspaceFolder(),
                fileContent: vscode.window.activeTextEditor?.document.getText()
            }
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

    private async getOrCreateEditor(projectPath: string, filePath: string, preserveFocus: boolean = false): Promise<vscode.TextEditor> {
        // Find matching workspace folder by last directory name
        const projectName = path.basename(projectPath);
        const workspaceFolder = projectPath ? vscode.workspace.workspaceFolders?.find(folder =>
            path.basename(folder.uri.fsPath) === projectName
        ) : vscode.workspace.workspaceFolders[0];

        if (!workspaceFolder) {
            throw new Error(`No workspace folder found matching project: ${projectName}`);
        }

        // Create full path using workspace folder and relative path
        const fullPath = path.join(workspaceFolder.uri.fsPath, filePath);
        const fileUri = vscode.Uri.file(fullPath);

        // Search through existing tabs
        for (const group of vscode.window.tabGroups.all) {
            const tab = group.tabs.find(tab =>
                tab.input instanceof vscode.TabInputText &&
                path.relative(workspaceFolder.uri.fsPath, tab.input.uri.fsPath) === filePath
            );

            if (tab && tab.input instanceof vscode.TabInputText) {
                return await vscode.window.showTextDocument(
                    await vscode.workspace.openTextDocument(tab.input.uri),
                    {
                        viewColumn: group.viewColumn,
                        preserveFocus
                    }
                );
            }
        }

        // Find first non-webview group
        const targetGroup = vscode.window.tabGroups.all.find(group =>
            !group.tabs.some(tab => tab.label === 'Covalent')
        );

        // Open document
        const document = await vscode.workspace.openTextDocument(fileUri);
        return await vscode.window.showTextDocument(document, {
            viewColumn: targetGroup?.viewColumn || vscode.ViewColumn.One,
            preserveFocus
        });
    }
}
