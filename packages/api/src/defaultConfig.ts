import * as Path from "path";

export interface ConfigPathsInterface {
  folder: string;
  paths: string;
  languages: string;
  config: string;
}

export const ConfigPaths: ConfigPathsInterface = {
  folder: Path.normalize("./config"),
  paths: Path.normalize("./config/paths.json"),
  languages: Path.normalize("./config/languages.json"),
  config: Path.normalize("./config/config.json"),
};

export const DefaultLanguages = [
  {
    "language": "common",
    "searchOptions": [
      {
        "name": "Function",
        "pattern": "function\\s+(\\w+)\\s*\\(",
        "isRegex": true
      },
      {
        "name": "Todo",
        "pattern": "//\\s*TODO",
        "isRegex": true
      }
    ]
  },
  {
    "language": "typescript",
    "extension": ".ts",
    "searchOptions": [
      {
        "name": "Class",
        "pattern": "class\\s+(\\w+)",
        "isRegex": true
      },
      {
        "name": "Interface",
        "pattern": "interface\\s+(\\w+)",
        "isRegex": true
      }
    ]
  },
  {
    "language": "javascript",
    "extension": ".js",
    "searchOptions": [
      {
        "name": "Variable",
        "pattern": "const\\s+(\\w+)\\s*=",
        "isRegex": true
      }
    ]
  }
];

export const DefaultPaths = [
  {
    "label": "Current Working Directory",
    "localPath": process.cwd(),
    "gitUrl": "",
    "rootToProjectPath": "",
    "rootPath": process.cwd()
  }
];

export const DefaultConfig = {
  "allowedFileExtensions": [".ts", ".js", ".html", ".css", ".java", ".c", ".cpp", ".py", ".md"],
  "forbiddenFiles": ["node_modules", ".git", ".vscode", "dist", "build"],
  "allowedFolders": [],
  "forbiddenFolders": ["node_modules", ".git", ".vscode", "dist", "build"],
  "repo": "local",
  "gitRemoteUrl": "",
  "remarks": {
    "default": ["/*", "*/"],
    ".js": ["/*", "*/"],
    ".ts": ["/*", "*/"],
    ".html": ["<!--", "-->"],
    ".css": ["/*", "*/"],
    ".java": ["/*", "*/"],
    ".c": ["/*", "*/"],
    ".cpp": ["/*", "*/"],
    ".py": ["#", ""]
  }
};

export const DefaultReadme = `# Cochart

Visit our online docs at cochart.dev/how-to-use


## Installation of Agent

- Download the compressed Cochart Folder and extract it
- Run the runnable file. You can run it anywhere, just leave the config folder next to it.
- The diagram repo is set to 'local' by default. You can set a git repo for the diagrams by setting config.json -> repo: "git" and config.json -> gitRemoteUrl: "your repo url"

## Webapp
Go to [localhost:2900](http://localhost:2900) in Chrome browser, or open your IDE extension

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
- Agent: This is used for searching your local diagrams
- Knowledge Center / Archive: Used to save and load diagrams

All three elements run inside each instance of the executable

## Project layout

.
├─ cochart.js
├─ readme.md
├─ config/
│  ├─languages.json  # Regex search patterns and languages
│  ├─paths.json  # Project folders for CodeChart to search in
│  └─config.json # Different configurations - allowed file extensions, forbidden files, allowed folders, forbidden folders, repo, gitRemoteUrl, examples
`;

export function ensureConfigsExist(): void {
  const fs = require('fs');
  
  // Check if config folder exists
  if (!fs.existsSync(ConfigPaths.folder)) {
    console.log("Creating config folder...");
    try {
      fs.mkdirSync(ConfigPaths.folder, { recursive: true });
    } catch (err) {
      console.error(`Failed to create config folder: ${err.message}`);
      process.exit(1);
    }
  }

  // Check and create paths.json if it doesn't exist
  if (!fs.existsSync(ConfigPaths.paths)) {
    console.log("Creating paths.json...");
    try {
      fs.writeFileSync(ConfigPaths.paths, JSON.stringify(DefaultPaths, null, 2));
    } catch (err) {
      console.error(`Failed to create paths.json: ${err.message}`);
    }
  }

  // Check and create languages.json if it doesn't exist
  if (!fs.existsSync(ConfigPaths.languages)) {
    console.log("Creating languages.json...");
    try {
      fs.writeFileSync(ConfigPaths.languages, JSON.stringify(DefaultLanguages, null, 2));
    } catch (err) {
      console.error(`Failed to create languages.json: ${err.message}`);
    }
  }

  // Check and create config.json if it doesn't exist
  if (!fs.existsSync(ConfigPaths.config)) {
    console.log("Creating config.json...");
    try {
      fs.writeFileSync(ConfigPaths.config, JSON.stringify(DefaultConfig, null, 2));
    } catch (err) {
      console.error(`Failed to create config.json: ${err.message}`);
    }
  }

  // Create readme.md if it doesn't exist
  const readmePath = Path.join(process.cwd(), "readme.md");
  if (!fs.existsSync(readmePath)) {
    console.log("Creating readme.md...");
    try {
      fs.writeFileSync(readmePath, DefaultReadme);
    } catch (err) {
      console.error(`Failed to create readme.md: ${err.message}`);
    }
  }
  // Verify that all required config files exist
  let missingFiles = false;
  Object.keys(ConfigPaths).forEach(key => {
    const path = ConfigPaths[key as keyof ConfigPathsInterface];
    if (!fs.existsSync(path)) {
      console.error(`Failed to create ${key} at ${Path.resolve(path)}`);
      missingFiles = true;
    }
  });

  // Exit if any required files are missing
  if (missingFiles) {
    console.error("The application cannot start due to missing configuration files.");
    console.error("Please ensure you have write permissions to the current directory.");
    process.exit(1);
  }
}