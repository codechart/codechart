Visit our online docs at cochart.dev/how-to-use

## Installation of Agent

- Download the compressed CodeChart Folder and extract it
- Run the runnable file. You can run it anywhere, just leave the config folder next to it.
- The diagram repo is set to 'local' by default. You can set a git repo for the diagrams by setting config.json -> repo: "git" and config.json -> gitRemoteUrl: "your repo url"

## Webapp
go to [localhost:2900] in Chrome browser, or open your IDE extension

## VScode installation
- Open Command Palette (Ctrl+Shift+P)
- Type "Install from VSIX"
- Select downloaded .vsix file
- Restart VS Code if prompted
- ctrl+shift+p -> Open Cochart
- note: you need the agent running!

## IntelliJ installation
- Open Settings/Preferences → Plugins
- Click gear icon → Install Plugin from Disk
- Select downloaded .zip file
- Restart IntelliJ
- Click the Cochart icon on the bottom
- note: you need the agent running!

## General Structure

Cochart has three elements running in its executable:

- UI: Serving on localhost port 2900
- Agent: This is used for searching you local diagrams
- Knowledge Center / Archive: Git repo used to save and load diagrams

## Project layout

.
├─ cochart.exe
├─ config/
│  └─languages.json  # Regex search patterns and languages
│  └─paths.json  # Project folders for Cochart to search in
│  └─config.json # Different configurations - allowed file extensions, forbidden files, allowed folders, forbidden folders, repo, gitRemoteUrl, examples


## Use with AI Helpers

### Create Diagrams
Use the write-cochart prompt to generate Cochart diagrams with your AI assistant:
1. Use the write prompt
2. Copy the resulting JSON and paste into Cochart using Ctrl+V
3. Direct the prompt to use the validation scripts

### Read Diagrams  
Use the read-cochart prompt to have your AI analyze existing diagrams:
1. Copy diagram from Cochart using the button on the top menu
2. Paste the json in a file, and give your AI the reading prompt
