Visit our online docs at use-covalent.com/how-to-use


## Installation

- Download the compressed CodeChart Folder and extract it
- Run the runnable file and go to [localhost:2900][15] in Chrome browser, or open your IDE extension

## VScode installation
- Open Command Palette (Ctrl+Shift+P)
- Type "Install from VSIX"
- Select downloaded .vsix file
- Restart VS Code if prompted
- ctrl+shift+p -> Open Covalent

## IntelliJ installation
- Open Settings/Preferences → Plugins
- Click gear icon → Install Plugin from Disk
- Select downloaded .zip file
- Restart IntelliJ
- Click the Covalent icon on the bottom

## General Structure

CodeChart has three elements running in it`s executable:

- UI: Serving on localhost port 2900
- Agent: This is used for searching you local diagrams
- Knowledge Center / Archive: Used to save and load diagrams

All three elements run inside each instance of the executable

## Project layout

.
├─ code-chart.exe
├─ config/
│  └─languages.json  # Regex search patterns and languages
│  └─paths.json  # Project folders for CodeChart to search in
│  └─config.json # Different configurations - allowed file extensions, forbidden files, allowed folders, forbidden folders, repo, gitRemoteUrl, examples
