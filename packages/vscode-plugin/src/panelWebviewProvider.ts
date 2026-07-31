import * as vscode from "vscode";
import * as fs from 'fs';
import { getWorkspaceFolder } from "./utils";
import { WebviewMdFile } from './WebviewMdFile';
import { EditorLineHighlighter } from "./EditorLineHighlighter";
import * as path from "path";

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
        // Held in a local so the async message handler below keeps a non-undefined
        // reference even after `this.panel` is cleared by onDidDispose.
        const panel = vscode.window.createWebviewPanel(
            'webview-provider',
            'Cochart',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                localResourceRoots: [this.extensionPath],
                retainContextWhenHidden: true
            }
        );
        this.panel = panel;

        panel.iconPath = {
            light: vscode.Uri.file(path.join(this.extensionPath.fsPath, 'media', 'favicon-16x16-light.png')),
            dark: vscode.Uri.file(path.join(this.extensionPath.fsPath, 'media', 'favicon-16x16-dark.png'))
        }


        panel.webview.html = this.getWebviewHtml();

        // Show version info when panel opens
        const extension = vscode.extensions.getExtension('Cochart.cochart-vscode-plugin');
        const version = extension?.packageJSON.version || 'unknown';
        vscode.window.showInformationMessage(`Cochart v${version} opened`);

        // Handle panel disposal
        panel.onDidDispose(() => {
            this.panel = undefined;
        });

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async event => {
                switch (event.action) {
                    case "getProjectPath_webviewEvent":
                        try {
                            const projectPath = getWorkspaceFolder();
                            panel.webview.postMessage({
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
                            if (event.lineNumber === undefined || event.lineNumber === null) {
                                return;
                            }

                            // preserveFocus must be false, otherwise focus stays in this webview
                            // and the editor never becomes the active one.
                            const targetEditor = await this.getOrCreateEditor(event.projectPath, event.filePath, false);

                            const line = Math.max(0, Math.min(event.lineNumber, targetEditor.document.lineCount - 1));
                            const range = targetEditor.document.lineAt(line).range;

                            // Collapsed selection (caret, not a whole-line selection). VS Code only
                            // draws the current-line highlight when the selection is empty.
                            targetEditor.selection = new vscode.Selection(range.start, range.start);
                            targetEditor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);

                            EditorLineHighlighter.getInstance().highlightMultipleLines(targetEditor, event.filePath, [line]);

                            // Pull keyboard focus out of the webview iframe into the editor group
                            // that showTextDocument just activated.
                            await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
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

        const configured = vscode.workspace
            .getConfiguration('cochart')
            .get<string[]>('viewerAddresses');

        if (!Array.isArray(configured) || configured.length === 0) {
            // No silent fallback: an empty list means the panel would probe nothing
            // and sit blank with no explanation.
            throw new Error(
                'Setting "cochart.viewerAddresses" is empty. Add at least one address for the panel to load.'
            );
        }

        // JSON.stringify twice: the result is embedded inside a single-quoted JS
        // string literal, so it has to survive as a quoted JSON payload. The
        // single quotes JSON does not escape are escaped here, or an address
        // containing one would terminate the literal and break the panel.
        const addressesLiteral = JSON.stringify(JSON.stringify(configured))
            .slice(1, -1)
            .replace(/'/g, "\\'");

        return htmlContent.replace('__COCHART_VIEWER_ADDRESSES__', addressesLiteral);
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

        // Search through existing tabs. Compare resolved absolute paths - the previous
        // version compared a relative path against `filePath`, which never matched when
        // the webview sent an absolute path, so every click re-opened the file.
        const isSamePath = (a: string, b: string) =>
            process.platform === 'win32'
                ? path.normalize(a).toLowerCase() === path.normalize(b).toLowerCase()
                : path.normalize(a) === path.normalize(b);

        for (const group of vscode.window.tabGroups.all) {
            const tab = group.tabs.find(tab =>
                tab.input instanceof vscode.TabInputText &&
                isSamePath(tab.input.uri.fsPath, fullPath)
            );

            if (tab && tab.input instanceof vscode.TabInputText) {
                return await vscode.window.showTextDocument(
                    await vscode.workspace.openTextDocument(tab.input.uri),
                    {
                        viewColumn: group.viewColumn,
                        preserveFocus,
                        preview: false
                    }
                );
            }
        }

        // Find first non-webview group
        const targetGroup = vscode.window.tabGroups.all.find(group =>
            !group.tabs.some(tab => tab.label === 'Cochart')
        );

        // Open document. preview: false pins the tab, otherwise each node click
        // recycles the same preview tab.
        const document = await vscode.workspace.openTextDocument(fileUri);
        return await vscode.window.showTextDocument(document, {
            viewColumn: targetGroup?.viewColumn || vscode.ViewColumn.One,
            preserveFocus,
            preview: false
        });
    }
}
