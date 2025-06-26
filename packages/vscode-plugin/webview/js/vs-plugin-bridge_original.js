const vscode = acquireVsCodeApi();

var lineNumberElement = document.getElementById("line-number");
var lineContentElement = document.getElementById("line-content");
var lineFilePathElement = document.getElementById("line-file-path");
var filePathElement = document.getElementById("file-path");
var projectPathElement = document.getElementById("project-path");
var fileContentElement = document.getElementById("file-content");
var eventInfoElement = document.getElementById("event-info");
var goToLineNumber = document.getElementById("go-to-line-number");
var goToFilePath = document.getElementById("go-to-filepath");
var webviewMdTextArea = document.getElementById("readme-content");
var buttonIsIde = document.getElementById("btn-IsIde");
var buttonDisplayContent = document.getElementById("btn-display-content");
var buttonGoToLine = document.getElementById("btn-go-to-line");
var highlightInIdeButton = document.getElementById("highlight-in-ide-btn");
var filesToHighlightTextarea = document.getElementById("files-to-highlight-textarea");

// call when clicking on line in code-editor, search results
function clickedOnLine(
  ideEventObject,
  lineContent,
  lineNumber,
  filePath,
  projectPath,
  fileContent
) {
  lineNumberElement.innerHTML = lineNumber;
  lineContentElement.innerHTML = lineContent;
  filePathElement.innerHTML = filePath;
  projectPathElement.innerHTML = projectPath;
  fileContentElement.innerHTML = fileContent;
  goToLineNumber.value = lineNumber;
  goToFilePath.value = filePath;

  eventInfoElement.innerHTML = JSON.stringify(ideEventObject);
}

// call when clicking on file in file navigation pane. remember this could also be a folder
function clickedOnFile(
  ideEventObject,
  fileOrFolderPath,
  projectPath,
  fileContent,
  filesInFolder
) {
  filePathElement.innerHTML = fileOrFolderPath;
  projectPathElement.innerHTML = projectPath;
  if (fileContent) {
    fileContentElement.innerHTML = fileContent;
  } else {
    fileContentElement.innerHTML = filesInFolder;
  }
  goToFilePath.value = fileOrFolderPath;

  eventInfoElement.innerHTML = JSON.stringify(ideEventObject);
}

// use this function to go to the line
function goToLine() {
  const filePath = goToFilePath.value;
  const lineNumber = goToLineNumber.value;

  vscode.postMessage({
    action: "goToLineEvent",
    filePath: filePath,
    lineNumber: lineNumber
  });
}

function displayReadmeInIDE() {
  var webviewMdText = webviewMdTextArea.value;

  vscode.postMessage({
    action: "updateWebviewMdEvent",
    text: webviewMdText,
  });
}

function highlightFilesInIde() {
  var fileInfo = filesToHighlightTextarea.value;

  vscode.postMessage({
    action: "highlightFilesInIdeEvent",
    fileInfo: fileInfo
  });
}

function displayInputInReadmeElement(_readmeText) {
  webviewMdTextArea.value = JSON.stringify(_readmeText);
}

function isRunningInIde() {
  try {
    if (vscode) {
      console.log("vscode is defined");
    } else {
      console.log("vscode is not defined");
    }
  } catch (ex) {
    console.log("vscode is not defined");
  }  
}

let frameElement;
window.onload = function () {
  frameElement = document.getElementById("myFrame");
  frameElement.style.width = window.innerWidth + "px";
  frameElement.style.height = window.innerHeight + "px";

  frameElement.contentWindow.postMessage({ action: "runningInIde" }, "*");
};

function clickedOnLine(
  ideEventObject,
  lineContent,
  lineNumber,
  filePath,
  projectPath,
  fileContent
) {
  frameElement.contentWindow.postMessage(
    {
      action: "clickedOnLine_ideEvent",
      data: {
        lineContent: lineContent,
        lineNumber: lineNumber,
        filePath: filePath,
        projectPath: projectPath,
      },
    },
    "*"
  );
}

function clickedOnFile(
  ideEventObject,
  fileOrFolderPath,
  projectPath,
  fileContent,
  filesInFolder
) {
  frameElement.contentWindow.postMessage(
    {
      action: "clickedOnFile_ideEvent",
      data: {
        fileOrFolderPath: fileOrFolderPath,
        projectPath: projectPath,
        fileContent: fileContent,
        filesInFolder: filesInFolder,
      },
    },
    "*"
  );
}

function displayInputInReadmeElement(readmeText) {
  frameElement.contentWindow.postMessage(
    {
      action: "displayContentInReadmeElement",
      data: {
        readmeText: readmeText,
      },
    },
    "*"
  );
}

console.log(buttonIsIde);
buttonIsIde.onclick = isRunningInIde;

buttonDisplayContent.onclick = displayReadmeInIDE;
buttonGoToLine.onclick = goToLine;

highlightInIdeButton.onclick = highlightFilesInIde;

window.addEventListener("message", (event) => {
  const message = event.data;

  switch (message.action) {
    case "Editor_VsCodeEvent":
      eventInfoElement.innerHTML = message.action;
      lineFilePathElement.innerHTML = message.currentFilePath;
      projectPathElement.innerHTML = message.projectPath;
      goToLineNumber.value = message.lineNumber;
      goToFilePath.value = message.currentFilePath;
      lineNumberElement.innerHTML = message.lineNumber;
      lineContentElement.innerHTML = message.currentLineContent;
      fileContentElement.innerHTML = message.fileText;

      break;

    case "LineNumberChanged_ideEvent":
      eventInfoElement.innerHTML = message.action;
      lineFilePathElement.innerHTML = message.currentFilePath;
      goToLineNumber.value = message.lineNumber;
      goToFilePath.value = message.currentFilePath;
      lineNumberElement.innerHTML = message.lineNumber;

      break;
      
    case "updateWebviewMd_ideEvent":
      webviewMdTextArea.value = message.text;
      console.log(message.text);
      break;
  }
});

window.addEventListener(
  "message",
  async (evt) => {
    try {
      alert("getMessageInIdeJs");
      let evtInfo = evt && evt.data ? evt.data : null;
      if (!evtInfo) {
        return;
      }
      let evtData = evtInfo.data;

      let events = {};
      events["goToLineInIde_webviewEvent"] = async () =>
      console.log("goToLineInIde_webviewEvent");
        goToLineInIDE(evtData.filePath, evtData.lineNumber);

      if (!events[evtInfo.action]) {
        alert("no such js function to call: " + evtInfo.action);
        return;
      }

      await events[evtInfo.action]();
    } catch (ex) {
      alert(ex);
    }
  },
  false
);
