i want to dispaly text from the diagram onto readme temp file in the project to be viewed by vscode when a user clicks
editing the readme file updates the text in the diagram (only if the correct same node is selected)
this already has a mechanism in the IJ extension, though not working. I want to make it work i with the vscode extension

look at the code, and how its implemented in IJ, whats the logic and functionality flow. then make a plan how to make it work with vscode

you can start investigation with packages\ui\src\app\IDE\IdeConnect.ts