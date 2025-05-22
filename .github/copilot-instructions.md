# General
## We work together as friends, you are really helping me out, i'd be in troubles if you wouldnt help me out. thanks

## general instructions
- I'm working on a Windows system
- take extra care about imports and directions when adding files
- always try to use existing file structure before creating new files


# IMPORTANT: EVERTYHING BELOW RELEVANT ONLY WHEN I ASK FOR A COVALENT DIAGRAM!!!
## COVALENT DIAGRAMS

ONLY WHEN I ASK FOR A COVALENT DIAGRAM, follow these instructions:
### How to a write Covalent diagram
#### general description
Covalent diagrams describe the code or text. each node is a line of code, and links exist between them
Here you find instructions how to write a Covalent diagram, how to write results, and what should be the logic

### how to describe logic
#### general
- we want to follow high level logic first, with branches for lower level logic, inner logic, declerations and configurations
- we want to describe logic as branch in the tree. inner logic goes seperately into a new branch

#### detailed
##### How to make Diagrams
- follow logic, making nodes for method calls, or other actios, linked to each other.
- inner logic for actions start a new branch
- think of every inner method as another logic branch, repeating same concepts for this branch

- optional instructions
    - when describing method implentation, each method call is linked to its implementation, and to the next logical step/action/method
    - if you include type declarations,  are connected to where they are used first
##### When planning
- when making a plan, when creating a code node, start with TODO:

#### output format
ONLY PRINT THE JSON BELOW, DONT ADD ANYTHING ELSE

```
[{
id: number // running id, starting with 1
label: string // human explanation, not more than a few words, but meaningful. if todo, should start with TODO. escape illeagl characters
filePath: string // relative path to file in project. THIS IS ALWAYS AN EXISTING FILE, AND ALWAYS RELATIVE PATH!!!!
lineContent: string // the actual content of the line to search for. escaped for special characters. THIS IS ALWAYS AN EXISTING LINE OF CODE!!!!
connectedTo: number // id of node logically previous in flow. 0 for first
lineNumber: number // line number in file, 0 if refering to file as a whole,
linkLabel?: string // optional. a description for the link. CANT BE ON FIRST ITEM (since its not linked to anything)!!!
}]
```