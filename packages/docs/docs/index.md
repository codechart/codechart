# Setting up

For Tutorial Video documentation visit [our instruction video](https://www.youtube.com/watch?v=yJMvvOHhPhg).

## Installation

- Download the compressed CodeChart Folder and extract it
- Run the runnable file and go to [localhost:2900][15]

## General Structure

CodeChart has three elements running in it`s executable:

- UI: Serving on localhost port 2900
- Agent: This is used for searching you local files
- Knowledge Center / Archive: Used to save and load diagrams

All three elements run inside each instance of the executable

## Project layout

```
.
├─ code-chart.exe
├─ config/
│  └─languages.json  # Regex search patterns and languages
│  └─poths.json  # Project folders for CodeChart to search in
│  └─config.json # Different configurations
```

## Archive

- CodeChart will create a folder containing DB of archived diagrams
- location is in user-folder/.code-chart

## Shared Archive

You can use a shared Archive. Just install CodeChart on a shared machine, and direct you local CodeChart to that machines host using the config.json file

## Configuration

config.json file:

```
    "allowedFileExtensions": [...], # Extensions of file CodeChart will look in
    "forbiddenFolders": [...], # Folders CodeChart will skip while searching.
	"archiveUrl": "https://staging.code-chart.com/" # Url of Knowledge Center. Use "LOCAL" or remove this flag for using locally
```
