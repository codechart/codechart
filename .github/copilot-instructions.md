# General
## We work together as friends, you are really helping me out, i'd be in troubles if you wouldnt help me out. thanks

## general instructions
- I'm working on a Windows system
- take extra care about imports and directions when adding files
- always try to use existing file structure before creating new files


# IMPORTANT: EVERTYHING BELOW RELEVANT ONLY WHEN I ASK FOR A COVALENT DIAGRAM!!!
## Covalent Diagrams

### General Description
Covalent diagrams visually represent code relationships, where each node corresponds to a line of code, and links denote logical relationships between them. The diagram can show various relationships: execution flow, variable usage, inheritance structure, dependencies, or any other code relationships requested.

### Two-Step Process

#### Step 1: Build Main Code Flow (CODE nodes only)
Create the main relationship chain using ONLY CODE nodes:
- CODE → CODE → CODE → CODE...
- Each CODE node connects to the previous CODE node in the logical flow
- First CODE node has `connectedTo: 0`
- This step is always required and forms the core of the diagram

#### Step 2: Add Planning Annotations (TODO nodes - OPTIONAL)
**TODO nodes are optional and only needed when planning work is requested.**
Many diagrams will have NO TODO nodes - they simply show existing code relationships.

When TODO nodes are needed:
- Add them after completing the main code flow
- Each TODO node points to ONE specific CODE node where work is needed
- TODO → CODE connections only
- TODO nodes do NOT connect to other TODO nodes
- TODO nodes are NOT part of the main flow

#### Connection Rules (CRITICAL)
- ✅ **CODE → CODE**: Main flow connections
- ✅ **TODO → CODE**: Planning annotations (when TODO nodes are used)
- ❌ **CODE → TODO**: FORBIDDEN
- ❌ **TODO → TODO**: FORBIDDEN

### Node Types and Field Usage

**CODE nodes** (main relationship flow):
- `id`: single running number sequence, starting from 1
- `label`: **what the existing code currently does** (e.g., "Filter state interface", "Data preparation function")
- `filePath`: **RELATIVE PATH ONLY** to existing file (never full/absolute paths)
- `lineContent`: **EXACT EXISTING LINE** of code content from the file
- `lineNumber`: line number in file
- `connectedTo`: id of previous CODE node in relationship flow (0 for first node)
- `linkLabel`: optional connection description

**TODO nodes** (optional planning annotations):
- `id`: continues the same running number sequence as CODE nodes
- `type`: "todo"
- `label`: **what needs to be done** starting with "TODO:" (e.g., "TODO: Add new field", "TODO: Modify parameters")
- `content`: planning details, suggested code, or work description **formatted with \n for line breaks to prevent overflow**
- `connectedTo`: id of CODE node where this work is needed
- `linkLabel`: optional connection description
- **OMIT**: filePath, lineContent, lineNumber (TODO nodes don't reference existing code)

### Output Format
Only print the JSON array below. Escape special characters for valid JSON.

```json
[{
    "id": number,              // single running sequence for all nodes, starting with 1
    "label": string,           // CODE: what code does; TODO: what needs doing
    "filePath": string,        // CODE nodes only - RELATIVE PATH
    "lineContent": string,     // CODE nodes only - EXISTING LINE
    "lineNumber": number,      // CODE nodes only
    "connectedTo": number,     // 0 for first CODE node, otherwise previous node id
    "linkLabel": string,       // optional
    "type": "todo",           // TODO nodes only
    "content": string         // TODO nodes only - use \n for line breaks
}]
```