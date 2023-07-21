var lineNumberElement = document.getElementById("line-number")
var lineContentElement = document.getElementById("line-content")
var lineContentElement = document.getElementById("line-file-path")
var filePathElement = document.getElementById("file-path")
var projectPathElement = document.getElementById("project-path")
var fileContentElement = document.getElementById("file-content")
var eventInfoElement = document.getElementById("event-info")
var goToLineNumber = document.getElementById("go-to-line-number")
var goToFilePath = document.getElementById("go-to-filepath")
var textTextArea = document.getElementById("readme-content")

// call when clicking on line in code-editor, search results
function clickedOnLine(ideEventObject, lineContent, lineNumber, filePath, projectPath, fileContent) {
    lineNumberElement.innerHTML = lineNumber
    lineContentElement.innerHTML = lineContent
    filePathElement.innerHTML = filePath
    projectPathElement.innerHTML = projectPath
    fileContentElement.innerHTML = fileContent
    goToLineNumber.value = lineNumber
    goToFilePath.value = filePath

    eventInfoElement.innerHTML = JSON.stringify(ideEventObject)
}

// call when clicking on file in file navigation pane. remember this could also be a folder
function clickedOnFile(ideEventObject, fileOrFolderPath, projectPath, fileContent, filesInFolder) {
    filePathElement.innerHTML = fileOrFolderPath
    projectPathElement.innerHTML = projectPath
    if(fileContent) fileContentElement.innerHTML = fileContent
    else fileContentElement.innerHTML = filesInFolder

    goToFilePath.value = fileOrFolderPath

    eventInfoElement.innerHTML = JSON.stringify(ideEventObject)
}

// use this function to go to the line
function goToLine() {
    alert("js go to line");
    let filePath = document.getElementById("go-to-filepath").value;
    let lineNumber = document.getElementById("go-to-line-number").value;
    goToLineInIDE(filePath, lineNumber);
}

function displayReadmeInIDE() {
    var htmlReadmeText = textTextArea.value;

    displayReadmeInIdeCallback(htmlReadmeText);
}

function displayInputInReadmeElement(_readmeText) {
    textTextArea.value = JSON.stringify(_readmeText)
}

