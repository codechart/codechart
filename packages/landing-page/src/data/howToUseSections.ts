export type Instruction = {
    step: string;
    details?: string;
    copyText?: string;
};

export type Section = {
    title: string;
    subtitle: string;
    instructions: Instruction[];
};

export const howToUseSections: Section[] = [
    {
        "title": "Installation",
        "subTitle": "Basic Setup",
        "instructions": [
            {
                "step": "Open the zip file, run the runnable file",
                "details": "go to chrome browser localhost - your're there"
            },
            {
                "step": "VScode - press ctrl+shift+p, select Open Covalent",
                "details": ""
            },
            {
                "step": "IntelliJ - click the Covalent icon",
                "details": ""
            },
            {
                "step": "IDEs installation - see below",
                "details": "Dont worry - it's very easy"
            }
        ]
    },
    {
        "title": "Creating Nodes",
        "subTitle": "Adding Content",
        "instructions": [
            {
                "step": "Add/select projects - on the top left side of the menu",
                "details": "Change via dropdown"
            },
            {
                "step": "Add file using \"Add a File Node\" button",
                "details": "click to see content"
            },
            {
                "step": "Right click editor text to add nodes",
                "details": ""
            },
            {
                "step": "New nodes are linked to the selected node",
                "details": ""
            },
            {
                "step": "Replace node by clicking on text in the code viewer",
                "details": ""
            },
            {
                "step": "In IDE, you can click on code or file to add to chart",
                "details": ""
            }
        ]
    },
    {
        "title": "Explore code",
        "subTitle": "Search & Navigation",
        "instructions": [
            {
                "step": "Ctrl click text for searching",
                "details": "Clicked code and results will be displayed"
            },
            {
                "step": "input text on the top menu, and search",
                "details": "Results will be displayed. Toggle the Regex icon to use Regex"
            },
            {
                "step": "Using the search icon on the top menu",
                "details": "you can search in project, file or context of the code line you selected"
            }
        ]
    },
    {
        "title": "LLM integration",
        "subTitle": "AI Features",
        "instructions": [
            {
                "step": "Add nodes by adding <click-copy>this prompt</click-copy> at end of your chat",
                "details": "Copy the LLM output JSON output and press ctrl+v on the chart",
                "copyText": `describe your answer as code: a json, an array of objects , in this format: 
                [{
                id: running id,
                label: human explanation,
                filePath: relative path to file in project, 
                lineNumber: line number in file, 
                connectedTo: id of node logically previous in flow 
                }] 
                start with id 1, the first node is connected 0`
            },
            {
                "step": "LLM JSON object should be created correctly by LLM output",
                "details": "if problem exists you'll be notified"
            },
            {
                "step": "for analysis by LLM of the chart - Click the brain icon on top menu",
                "details": "to copy JSON description of chart"
            },
            {
                "step": "LLM JSON structure to be pasted into chart should be",
                "details": "[{label: short explanation, filePath: full path of file, lineNumber: number of line in file, id: incremental id of item connectedTo: id of item this is logically connected to}]"
            }
        ]
    },
    {
        "title": "Managing Chart",
        "subTitle": "Chart Controls",
        "instructions": [

            {
                "step": "Arrows on top of chart determine the direction for new nodes added",
                "details": ""
            },
            {
                "step": "Delete nodes with delete/backspace or right click on menu and select delete",
                "details": ""
            },
            {
                "step": "Link nodes by ctrl-selecting multiple",
                "details": "right click and click \"link nodes\""
            },
            {
                "step": "Select node and type to change text",
                "details": ""
            },
            {
                "step": "Double click for styling options",
                "details": ""
            },
            {
                "step": "IDE actions",
                "details": "You can refresh Covalent in IDEs by rightclick on files and clicking \"refresh Covalent\""
            }
        ]
    },
    {
        "title": "Describing insights and plans",
        "subTitle": "Documentation",
        "instructions": [
            {
                "step": "Right click a node or the diagram to add description nodes",
                "details": ""
            },
            {
                "step": "description nodes are: remark, start, finish, to do, info, section",
                "details": ""
            },
            {
                "step": "Try to always have start and end nodes",
                "details": "The chart should start from the left to the right"
            },
            {
                "step": "To do, info and section nodes can have markdown text",
                "details": "Click on them, and edit in the code view"
            },
            {
                "step": "Sections are conceptual parts of the chart",
                "details": "Set their size by draggin the bottom righ circular node appearing in the section"
            }
        ]
    },
    {
        "title": "Side menu",
        "subTitle": "Navigation",
        "instructions": [
            {
                "step": "You can navigate To do, info, conflict and file nodes using the side menu",
                "details": ""
            },
            {
                "step": "clicking on a to do item will toggle done/pending",
                "details": ""
            }
        ]
    },
    {
        "title": "Files in chart",
        "subTitle": "File Management",
        "instructions": [
            {
                "step": "File nodes are hidden by default",
                "details": "show via double click + Advanced"
            },
            {
                "step": "Files are color coded",
                "details": "colors shown in legend"
            }
        ]
    },
    {
        "title": "Sync",
        "subTitle": "File Synchronization",
        "instructions": [
            {
                "step": "Sync diagram with file content",
                "details": ""
            },
            {
                "step": "If conflicts exist (node with lines that completly changed text)",
                "details": "conflict nodes will appear"
            },
            {
                "step": "hover conflicts nodes to see old text",
                "details": ""
            },
            {
                "step": "Use the replace to select proper code line",
                "details": ""
            },
            {
                "step": "Delete the conflict node",
                "details": ""
            },
            {
                "step": "You can navigate conflict nodes using the side menu",
                "details": ""
            }
        ]
    },
    {
        "title": "Save and load",
        "subTitle": "Storage Options",
        "instructions": [
            {
                "step": "Save/load via waffer icon on right of top menu",
                "details": ""
            },
            {
                "step": "You can also save to JSON file",
                "details": ""
            },
            {
                "step": "You can also copy a link to this chart",
                "details": ""
            },
            {
                "step": "Toggle \"Overlay charts\"",
                "details": "so that loaded charts will overlay existing chart"
            }
        ]
    },
    {
        "title": "VScode installation",
        "subTitle": "VSCode Setup",
        "instructions": [
            {
                "step": "Download .vsix file from VS Code Marketplace",
                "details": "(or GitHub/developer site)"
            },
            {
                "step": "Open Command Palette (Ctrl+Shift+P)",
                "details": ""
            },
            {
                "step": "Type \"Install from VSIX\"",
                "details": ""
            },
            {
                "step": "Select downloaded .vsix file",
                "details": ""
            },
            {
                "step": "Restart VS Code if prompted",
                "details": ""
            }
        ]
    },
    {
        "title": "IntelliJ installation",
        "subTitle": "IntelliJ Setup",
        "instructions": [
            {
                "step": "Open Settings/Preferences → Plugins",
                "details": ""
            },
            {
                "step": "Click gear icon → Install Plugin from Disk",
                "details": ""
            },
            {
                "step": "Select downloaded .zip file",
                "details": ""
            },
            {
                "step": "Restart IntelliJ",
                "details": ""
            }
        ]
    },
    {
        "title": "Configuration",
        "subTitle": "System Settings",
        "instructions": [
            {
                "step": "All configs are in the config folder",
                "details": ""
            },
            {
                "step": "config.json: allowed and forbidden files and folders",
                "details": "Git URL for charts repo"
            },
            {
                "step": "config.json: You can also save charts locally",
                "details": "or to a remote Covalent app"
            },
            {
                "step": "paths.json: All project folders",
                "details": ""
            },
            {
                "step": "languages.json: Regex patterns",
                "details": "you can set per different DSLs"
            }
        ]
    }
]; 