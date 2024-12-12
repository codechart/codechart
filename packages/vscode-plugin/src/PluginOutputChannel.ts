import * as vscode from 'vscode';

export class PluginOutputChannel {    
    private static instance: PluginOutputChannel;

    private outputChannel = vscode.window.createOutputChannel("webview-plugin");

    constructor() {
        this.outputChannel.show();
    }

    static getInstance(): PluginOutputChannel {
        if (!this.instance) {
            this.instance = new PluginOutputChannel();
        }

        return this.instance;
    }

    log(message: string) {
        this.outputChannel.appendLine(message);
    }
}