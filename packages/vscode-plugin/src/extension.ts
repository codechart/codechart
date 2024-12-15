import * as vscode from 'vscode';
import { PanelWebviewProvider } from './panelWebviewProvider';
import { WebviewMdFile } from './WebviewMdFile';
import { getWorkspaceFolder, showErrorMessage } from './utils';
import { EditorLineHighlighter } from './EditorLineHighlighter';

export function activate(context: vscode.ExtensionContext) {
  const webviewProvider = new PanelWebviewProvider(context, context.extensionUri);

  const sendToWebviewCommand = vscode.commands.registerCommand('webview-plugin.sendToWebview', (fileUri?: vscode.Uri) => {
    // If fileUri is provided, it's from explorer context menu
    // If not, it's from editor context menu
    let filePath;
    let lineNumber = -1;  // Default line number for explorer context

    if (fileUri) {
      // Called from explorer context menu
      filePath = fileUri.fsPath;
    } else {
      // Called from editor context menu
      filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
      lineNumber = vscode.window.activeTextEditor?.selection.active.line ?? 0;
    }

    if (filePath) {
      webviewProvider.sendDataToWebView(filePath, lineNumber);
    }
  });

  context.subscriptions.push(sendToWebviewCommand);

  let disposable = vscode.commands.registerCommand('webview-plugin.openWebview', () => {
    if (!webviewProvider.getPanel()) {
      webviewProvider.initializePanel();
    }
  });
  context.subscriptions.push(disposable);

  const refreshWebviewCommand = vscode.commands.registerCommand('webview-plugin.refreshWebview', () => {
    webviewProvider.refresh();
  });

  context.subscriptions.push(sendToWebviewCommand, refreshWebviewCommand);


  const webviewMdFile = new WebviewMdFile(context, webviewProvider);

  webviewProvider.webviewMdFile = webviewMdFile;

  webviewMdFile.setup();
}
