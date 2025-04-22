## General
- I'm working on a Windows system
covalent-llm-instructions folder
- take extra care about imports and directions when adding files
- alwasy try to use existing file structire before creating new files


## COVALENT DIAGRAMS
- when I ask for a Covalent diagram, follow these instructions:
### How to a write Covalent diagram
#### general description
Here you find instructions how to write Covalent diagram
how to write results, and what should be the logic

### how to describe logic
#### general
- we want to follow high level logic first, with branches for lower level logic, inner logic, declerations and configurations
- we want to describe logic as branch in the tree. inner logic goes seperately into a new branch
- we want a reasonable amount of nodes, not too many, not too few
- dont go too much into details

#### detailed
- follow logic, making nodes for method calls, or other actios, linked to each other.
- inner logic for actions start a new branch
- each method call is  linked to its implementation, and to the next logical step/action/method
- method implementations start a new branch of the tree
- type declarations are connected to where they are used first
- think of every inner method as another logic branch, repeating same concepts for this branch

#### output format

[{
id: number // running id,
label: string // human explanation,
filePath: string // relative path to file in project,
lineContent: string // the actual content of the line to search for
connectedTo: number // id of node logically previous in flow. 0 for first
lineNumber: number // line number in file, 0 if refering to file as a whole
}]
