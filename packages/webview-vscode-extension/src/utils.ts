import * as vscode from 'vscode';
import path = require('path');

export function getWorkspaceFolder(): string | undefined {
    const filePath = vscode.window.activeTextEditor?.document.fileName;

    if (!vscode.workspace.workspaceFolders) {
        throw new Error('No opened workspace');
    }

    return vscode.workspace.workspaceFolders.find(workspaceFolder => filePath?.includes(workspaceFolder.uri.fsPath))?.uri.fsPath;
}

export async function showErrorMessage(message: string) {
    vscode.window.showErrorMessage('webview-plugin: ' + message);
}
