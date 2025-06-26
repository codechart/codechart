import * as vscode from 'vscode';
import { PanelWebviewProvider } from './panelWebviewProvider';
import { WebviewMdFile } from './WebviewMdFile';
import { getWorkspaceFolder, showErrorMessage } from './utils';
import { EditorLineHighlighter } from './EditorLineHighlighter';

let webviewProvider

export function activate(context: vscode.ExtensionContext) {

  webviewProvider = new PanelWebviewProvider(context, context.extensionUri);

  const sendLineToWebviewCommand = vscode.commands.registerCommand('webview-plugin.sendLineToWebview', (fileUri?: vscode.Uri) => {
    // Called from editor context menu
    const filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    const lineNumber = vscode.window.activeTextEditor?.selection.active.line ?? 0;
    webviewProvider.sendLineToWebview(filePath, lineNumber);
  });

  const replaceLineToWebviewCommand = vscode.commands.registerCommand('webview-plugin.replaceLineToWebview', (fileUri?: vscode.Uri) => {
    // Called from editor context menu
    const filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    const lineNumber = vscode.window.activeTextEditor?.selection.active.line ?? 0;
    webviewProvider.replaceLineInWebview(filePath, lineNumber);
  });

  const sendFileToWebviewCommand = vscode.commands.registerCommand('webview-plugin.sendFileToWebview', (fileUri?: vscode.Uri) => {
    webviewProvider.sendFileToWebview(fileUri.fsPath);
  });

  const openWebviewCommand = vscode.commands.registerCommand('webview-plugin.openWebview', () => {
    if (!webviewProvider.getPanel()) {
      webviewProvider.initializePanel();
    }
  });

  const refreshWebviewCommand = vscode.commands.registerCommand('webview-plugin.refreshWebview', () => {
    webviewProvider.refresh();
  });

  context.subscriptions.push(sendLineToWebviewCommand, replaceLineToWebviewCommand, refreshWebviewCommand, sendFileToWebviewCommand, openWebviewCommand);


  const webviewMdFile = new WebviewMdFile(context, webviewProvider);

  webviewProvider.webviewMdFile = webviewMdFile;

  webviewMdFile.setup();
}

export function deactivate() {
  webviewProvider.panel.dispose();
  
}