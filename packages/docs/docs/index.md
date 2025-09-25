# Setting up

For Tutorial Video documentation visit [our instruction video](https://www.youtube.com/watch?v=yJMvvOHhPhg).

## Installation

- Download the compressed Cochart Folder and extract it
- Run the runnable file and go to [localhost:2900][15] in Chrome browser

## General Structure

Cochart has three elements running in its executable:

- UI: Serving on localhost port 2900
- Agent: This is used for searching you local files
- Knowledge Center / Archive: Used to save and load diagrams

All three elements run inside each instance of the executable

## Project layout

```
.
├─ cochart.exe
├─ config/
│  └─languages.json  # Regex search patterns and languages
│  └─paths.json  # Project folders for Cochart to search in
│  └─config.json # Different configurations
```

## Archive

- Cochart will create a folder containing DB of archived diagrams
- location is in user-folder/.cochart

## Shared Archive

You can use a shared Archive. Just install Cochart on a shared machine, and direct you local Cochart to that machines host using the config.json file

## Configuration

config.json file:

```
    "allowedFileExtensions": [...], # Extensions of file Cochart will look in
    "forbiddenFolders": [...], # Folders Cochart will skip while searching.
	"archiveUrl": "https://staging.cochart.dev/" # Url of Knowledge Center. Use "LOCAL" or remove this flag for using locally
```
