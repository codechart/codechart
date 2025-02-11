## UI and Agent
1. UI build: `npm run build`
2. copy files from /ui/dist into /api/public
3. API build: in /api folder `npm run build`
4. build exe: in /api folder `pkg .` or `pkg . --targets windows`

## vscode extension: 
1. in folder /vscode-plugin `npm run package`; then `npx vsce package`
2. the file gets created: `/vscode-plugin/covalent-vscode-plugin-1.0.0.vsix`
3. to install in vscode: ctrl+shift+p -> VSIX install extension -> select the vsix file

## IJ extension: 
1. in IntelliJ run gradle build webview-java-intellij-plugin [buildPlugin]
2. the file gets created: `/intellij-plugin/build/distributions/Covalent-IJ-Plugin.zip`
3. to install in IJ: open settings -> plugins -> gear icon -> install plugin from disk -> select the zip file



