# Setting up

Visit our online docs at docs.code-chart.com

For Tutorial Video documentation visit our web site code-chart.com where you can find it in the gallery.

## Installation

- Download the compressed CodeChart Folder and extract it
- Run the runnable file and go to [localhost:2900][15] in Chrome browser

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
│  └─poths.json  # Project folders for CodeChart to search in
│  └─config.json # Different configurations

## Archive

- CodeChart will create a folder containing DB of archived diagrams
- location is in user-folder/.code-chart

## Shared Archive

You can use a shared Archive. Just install CodeChart on a shared machine, and direct you local CodeChart to that machines host using the config.json file

## Configuration

config.json file:
    "allowedFileExtensions": [...], # Extensions of file CodeChart will look in
    "forbiddenFolders": [...], # Folders CodeChart will skip while searching.
	"archiveUrl": "https://staging.code-chart.com/" # Url of Knowledge Center. Use "LOCAL" or remove this flag for using locally
    "repo": "local" # Use "local" to save diagrams at $HOME/.codechart and "git" to sync the diagrams with a git repo
    "gitRemoteUrl": null # Set only if "repo" is set to "git". This is the git repo URL to sync diagrams with e.g. "git@github.com:organization/codechart-repo.git"
	
## Setting CodeChart to run at start up on windows:

press the Windows key + R, type shell:startup, then select OK. This opens the Startup folder. Paste here a shortcut to your code-chart.exe file

