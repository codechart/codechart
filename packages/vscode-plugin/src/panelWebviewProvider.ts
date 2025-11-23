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
            'Cochart',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                localResourceRoots: [this.extensionPath],
                retainContextWhenHidden: true
            }
        );
        this.panel.iconPath = {
            light: vscode.Uri.file(path.join(this.extensionPath.fsPath, 'media', 'favicon-16x16-light.png')),
            dark: vscode.Uri.file(path.join(this.extensionPath.fsPath, 'media', 'favicon-16x16-dark.png'))
        }


        this.panel.webview.html = this.getWebviewHtml();

        // Show version info when panel opens
        const extension = vscode.extensions.getExtension('Cochart.cochart-vscode-plugin');
        const version = extension?.packageJSON.version || 'unknown';
        vscode.window.showInformationMessage(`Cochart v${version} opened`);

        // Handle panel disposal
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            async event => {
                switch (event.action) {
                    case "getProjectPath_webviewEvent":
                        try {
                            const projectPath = getWorkspaceFolder();
                            this.panel.webview.postMessage({
                                action:"setProjectPath_ideEvent",
                                data: {
                                    projectPath: projectPath
                                }
                            });
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to get workspace folder: ${error}`);
                        }
                        return;

                    case 'goToLineEvent':
                        try {
                            const targetEditor = await this.getOrCreateEditor(event.projectPath, event.filePath, true);
                            if (!event.lineNumber) return

                            const range = targetEditor.document.lineAt(event.lineNumber).range;
                            targetEditor.selection = new vscode.Selection(range.start, range.end);
                            targetEditor.revealRange(range);

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

                    case 'displayReadmeInIde':
                        try {
                            if (!event.data || !event.data.content) {
                                console.error('[PanelWebviewProvider] Error: Missing content data');
                                return;
                            }

                            this.webviewMdFile.createWebviewMdFileIfNotExists();
                            const webviewMdFilePath = this.webviewMdFile.getWebviewMdFilePath();

                            if (!webviewMdFilePath) {
                                console.error('[PanelWebviewProvider] Error: Could not determine webview MD file path');
                                return;
                            }

                            const targetEditor = await this.getOrCreateEditor(null, webviewMdFilePath);
                            await targetEditor.edit(editBuilder => {
                                editBuilder.replace(new vscode.Range(
                                    targetEditor.document.positionAt(0),
                                    targetEditor.document.positionAt(targetEditor.document.getText().length)
                                ), event.data.content);
                            });
                        } catch (error) {
                            console.error('[PanelWebviewProvider] Error: Failed to display README in IDE:', error);
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

                    case 'saveDiagramToFile_ideEvent':
                        try {
                            const filePath = event.filePath;
                            const jsonContent = event.jsonContent;

                            if (!filePath || !jsonContent) {
                                vscode.window.showErrorMessage('Missing file path or JSON content for save');
                                return;
                            }

                            fs.writeFileSync(filePath, jsonContent, 'utf8');
                            vscode.window.showInformationMessage(`Diagram saved to ${path.basename(filePath)}`);
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to save diagram: ${error}`);
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

    public replaceLineInWebview(filePath: string, lineNumber: number) {
        this.sendLineToWebview(filePath, lineNumber, true);
    }

    public sendLineToWebview(filePath: string, lineNumber: number, isReplace: boolean = false) {
        if (this.panel === undefined) {
            return;
        }

        this.panel.webview.postMessage({
            action: "clickedOnLine_ideEvent",
            data: {
                filePath: filePath,
                projectPath: getWorkspaceFolder(),
                lineContent: vscode.window.activeTextEditor?.document.lineAt(vscode.window.activeTextEditor?.selection.active.line).text,
                lineNumber: lineNumber,
                fileContent: vscode.window.activeTextEditor?.document.getText(),
                isReplaceNode: isReplace
            }
        });
    }

    public sendFileToWebview(filePath: string) {
        if (this.panel === undefined) {
            return;
        }
        this.panel.webview.postMessage({
            action: "clickedOnFile_ideEvent",
            data: {
                filePath: filePath,
                projectPath: getWorkspaceFolder(filePath),
                fileContent: vscode.window.activeTextEditor?.document.getText()
            }
        });
    }

    public sendDiagramToWebview(filePath: string) {
        if (this.panel === undefined) {
            return;
        }
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const filename = path.basename(filePath);
            this.panel.webview.postMessage({
                action: "clickedOnDiagram_ideEvent",
                data: {
                    jsonContent: fileContent,
                    filename: filename,
                    filePath: filePath,
                    projectPath: getWorkspaceFolder(filePath)
                }
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to read diagram file ${filePath}: ${error}`);
        }
    }

    public updateWebviewMdContent(webviewText: string | undefined) {
        if (this.panel === undefined) {
            console.error('[PanelWebviewProvider] Error: Panel is undefined');
            return;
        }

        this.panel.webview.postMessage({
            action: "updateWebviewMd_ideEvent",
            text: webviewText
        });
    }


    private getWebviewHtml() {
        const htmlPath = vscode.Uri.joinPath(this.extensionPath, 'webview', 'vscode-plugin.html');
        const htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');

        return htmlContent;
    }

    private async getOrCreateEditor(projectPath: string | null, filePath: string, preserveFocus: boolean = false): Promise<vscode.TextEditor> {
        console.debug('[DEBUG] getOrCreateEditor called with projectPath:', projectPath, 'filePath:', filePath);

        // Determine the workspace folder first (needed for both path resolution and tab matching)
        const workspaceFolder = projectPath
            ? vscode.workspace.workspaceFolders?.find(folder =>
                path.basename(folder.uri.fsPath) === path.basename(projectPath)
            )
            : vscode.workspace.workspaceFolders?.[0];

        if (!workspaceFolder) {
            throw new Error(`No workspace folder found matching project: ${projectPath}`);
        }

        console.debug('[DEBUG] workspaceFolder.uri.fsPath:', workspaceFolder.uri.fsPath);

        // Normalize the filePath first to handle double slashes and mixed separators
        const normalizedFilePath = path.normalize(filePath);
        const workspaceFolderNormalized = path.normalize(workspaceFolder.uri.fsPath);

        // Determine if filePath is already a full/absolute path
        // Check: does it start with workspace folder path (accounting for case sensitivity on Windows)
        const isFullPath = normalizedFilePath.toLowerCase().startsWith(workspaceFolderNormalized.toLowerCase());

        let fullPath: string;
        if (isFullPath && fs.existsSync(normalizedFilePath)) {
            // Path already contains workspace folder and file exists - use it directly
            fullPath = normalizedFilePath;
            console.debug('[DEBUG] Using full filePath (verified existing):', fullPath);
        } else if (path.isAbsolute(normalizedFilePath) && fs.existsSync(normalizedFilePath)) {
            // Absolute path that exists - use it directly
            fullPath = normalizedFilePath;
            console.debug('[DEBUG] Using absolute filePath (verified existing):', fullPath);
        } else {
            // Treat as relative to workspace folder
            fullPath = path.join(workspaceFolderNormalized, normalizedFilePath);
            console.debug('[DEBUG] Treating as relative filePath, resolved to:', fullPath);
        }

        const fileUri = vscode.Uri.file(fullPath);

        console.debug('[DEBUG] fullPath:', fullPath);

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
            !group.tabs.some(tab => tab.label === 'Cochart')
        );

        // Open document
        const document = await vscode.workspace.openTextDocument(fileUri);
        return await vscode.window.showTextDocument(document, {
            viewColumn: targetGroup?.viewColumn || vscode.ViewColumn.One,
            preserveFocus
        });
    }
}
