Only when I request a Covalent Diagram, follow these instructions:

## Covalent Diagrams

### General Description
Covalent diagrams visually represent code relationships, where each node corresponds to a line of code, and links denote logical relationships between them. The diagram can show various relationships: execution flow, variable usage, inheritance structure, dependencies, or any other code relationships requested.

### Two-Step Process
#### Step 1: Build Main Code Flow (CODE nodes only)
Create the main relationship chain using ONLY CODE nodes:
- CODE → CODE → CODE → CODE...
- Each CODE node connects to the previous CODE node in the logical flow
- There could be different logical flows branching from same code node. 
- First CODE node has \`connectedTo: 0\`
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
- `id` - REQUIRED: single running number sequence, starting from 1
- `label` - REQUIRED: **what the existing code currently does** (e.g., "Filter state interface", "Data preparation function")
- `filePath` - REQUIRED: **RELATIVE PATH ONLY** to existing file (never full/absolute paths)
- `lineContent` - REQUIRED: **EXACT EXISTING LINE** of code content from the file
- `lineNumber` - REQUIRED: line number in file
- `connectedTo` - REQUIRED: id of previous CODE node in relationship flow (0 for first node)
- `linkLabel` - optional: connection description

**TODO nodes REQUIRED properties:**
- `id` - REQUIRED: continues the same running number sequence as CODE nodes
- `type` - REQUIRED: "todo" (only value allowed for TODO nodes)
- `label` - REQUIRED: **what needs to be done, or description of something**. IF its a todo, start with "TODO:" (e.g., "TODO: Add new field", "TODO: Modify parameters"). if not just put the label (e.g "Github Action runner")
- `content` - REQUIRED: planning details, suggested code, or work description **formatted with \n for line breaks to prevent overflow**
- `connectedTo` - REQUIRED: id of CODE node where this work is needed
- `linkLabel` - optional: connection description
- **OMIT ALWAYS**: filePath, lineContent, lineNumber (TODO nodes don't reference existing code)

**VALIDATION RULE:**
- Every CODE node must have ALL 6 required properties (id, label, filePath, lineContent, lineNumber, connectedTo)
- Every TODO node must have ALL 5 required properties (id, type, label, content, connectedTo)
- Missing any required property = invalid node
- Do NOT create nodes with other custom types

### Output Format
file format should be <short-description>.cochart.json
user might asks to write in a different file, but keep the .cochart.json suffix
do not print on screen, only in file

\`\`\`json
[{
    "id": number,              // single running sequence for all nodes, starting with 1
    "label": string,           // CODE: what code does; TODO: what needs doing
    "filePath": string,        // CODE nodes only - RELATIVE PATH
    "lineContent": string,     // CODE nodes only - EXISTING LINE
    "lineNumber": number,      // CODE nodes only
    "connectedTo": number,     // 0 for first CODE node, otherwise previous node id
    "linkLabel": string,       // optional
    "type": "todo",           // TODO nodes only - NO OTHER TYPES AVAILALE!!
    "content": string         // TODO nodes only - use \n for line breaks
}]
\`\`\``

### Verification (CRITICAL)
After creating/updating diagram:
1. **You MUST verify ALL CODE nodes** 
filepath, line number, line content metch the content on the disk. use shell script.
THIS IS CRUCIAL!!!
2. **Fix any mismatches immediately** before presenting diagram to user.
   1. read the label and line number of that node
   2. find the aproprtaite line number and line content and update the node
3. **You MUST ensure correctnes of nodes properties**
- all code nodes have `id`, `filepath`, 
`label`, `lineContent`, `lineNumber`. They DONT have `type`
- all todo nodes have type "todo"
- no nodes have other types different than "todo"

## user descrption
the user will tell you what to do, and what he wants to see: user wrote: $ARGUMENT
try to follow his request, shile adhearing to the guidelined above

