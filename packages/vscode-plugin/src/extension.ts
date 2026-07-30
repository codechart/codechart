import * as vscode from 'vscode';
import { PanelWebviewProvider } from './panelWebviewProvider';
import { WebviewMdFile } from './WebviewMdFile';

let webviewProvider: PanelWebviewProvider;

export function activate(context: vscode.ExtensionContext) {
  // Show version info in status bar for easy verification
  const extension = vscode.extensions.getExtension('Cochart.cochart-vscode-plugin');
  const version = extension?.packageJSON.version || 'unknown';

  // Create status bar item showing version
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text = `Cochart v${version}`;
  statusBar.tooltip = `Cochart VSCode Extension v${version}`;
  statusBar.show();
  context.subscriptions.push(statusBar);

  webviewProvider = new PanelWebviewProvider(context, context.extensionUri);

  const sendDiagramToWebviewCommand = vscode.commands.registerCommand('webview-plugin.sendDiagramToWebview', (fileUri: vscode.Uri) => {
    webviewProvider.sendDiagramToWebview(fileUri.fsPath);
  });

  const openWebviewCommand = vscode.commands.registerCommand('webview-plugin.openWebview', () => {
    if (!webviewProvider.getPanel()) {
      webviewProvider.initializePanel();
    }
  });

  const refreshWebviewCommand = vscode.commands.registerCommand('webview-plugin.refreshWebview', () => {
    webviewProvider.refresh();
  });

  context.subscriptions.push(refreshWebviewCommand, sendDiagramToWebviewCommand, openWebviewCommand);


  const webviewMdFile = new WebviewMdFile(context, webviewProvider);

  webviewProvider.webviewMdFile = webviewMdFile;

  webviewMdFile.setup();
}

export function deactivate() {
  webviewProvider.getPanel()?.dispose();
}