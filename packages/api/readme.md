# CodeChart

Visit our online docs at use-covalent.com/how-to-use


## Installation of Agent

- Download the compressed CodeChart Folder and extract it
- Run the runnable file. You can run it anywhere, just leave the config folder next to it.
- The diagram repo is set to 'local' by default. You can set a git repo for the diagrams by setting config.json -> repo: "git" and config.json -> gitRemoteUrl: "your repo url"

## Webapp
Go to [localhost:2900](http://localhost:2900) in Chrome browser, or open your IDE extension

## VScode installation
- Open Command Palette (Ctrl+Shift+P)
- Type "Install from VSIX"
- Select downloaded .vsix file
- Restart VS Code if prompted
- ctrl+shift+p -> Open Covalent
- note: you need the agent running!

## IntelliJ installation
- Open Settings/Preferences → Plugins
- Click gear icon → Install Plugin from Disk
- Select downloaded .zip file
- Restart IntelliJ
- Click the Covalent icon on the bottom
- note: you need the agent running!

## General Structure

CodeChart has three elements running in its executable:

- UI: Serving on localhost port 2900
- Agent: This is used for searching your local diagrams
- Knowledge Center / Archive: Used to save and load diagrams

All three elements run inside each instance of the executable

## Project layout

.
├─ covalent.js
├─ readme.md
├─ config/
│  ├─languages.json  # Regex search patterns and languages
│  ├─paths.json  # Project folders for CodeChart to search in
│  └─config.json # Different configurations - allowed file extensions, forbidden files, allowed folders, forbidden folders, repo, gitRemoteUrl, examples
