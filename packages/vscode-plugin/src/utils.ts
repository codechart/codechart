import * as vscode from 'vscode';
import path = require('path');

export function getWorkspaceFolder(explicitFilePath?: string): string | undefined {
    const filePath = explicitFilePath || vscode.window.activeTextEditor?.document.fileName;

    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        return undefined;
    }

    if (!filePath) {
        return vscode.workspace.workspaceFolders[0]?.uri.fsPath;
    }
    return vscode.workspace.workspaceFolders.find(workspaceFolder => filePath.includes(workspaceFolder.uri.fsPath))?.uri.fsPath;
}

export async function showErrorMessage(message: string) {
    vscode.window.showErrorMessage('webview-plugin: ' + message);
}
