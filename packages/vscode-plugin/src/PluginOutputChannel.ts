import * as vscode from 'vscode';

export class PluginOutputChannel2 {    
    private static instance: PluginOutputChannel2;

    private outputChannel = vscode.window.createOutputChannel("webview-plugin");

    constructor() {
        this.outputChannel.show();
    }

    static getInstance(): PluginOutputChannel2 {
        if (!this.instance) {
            this.instance = new PluginOutputChannel2();
        }

        return this.instance;
    }

    log(message: string) {
        this.outputChannel.appendLine(message);
    }
}