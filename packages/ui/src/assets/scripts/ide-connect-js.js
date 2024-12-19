async function clickedOnLine_fromIDE(lineContent, lineNumber, projectPath, filePath, isReplaceNode) {
  await Global_app.ideConnect.input_addMatchOnClick(lineContent, lineNumber, projectPath, filePath, isReplaceNode)
}

async function clickedOnFile_fromIDE(fileOrFolderPath, projectPath) {
  await Global_app.ideConnect.input_addFileOnClick(fileOrFolderPath, projectPath)
}

async function displayInputInReadmeElement_fromIDE(content) {
  Global_app.ideConnect.input_setTextOfCurrentGroup(content)
}

function goToLineInIDE(projectPath, filePath, lineNumber) {
  window.parent.postMessage({action: 'goToLineInIde', data: {
      projectPath: projectPath,
      filePath: filePath,
      lineNumber: lineNumber
    }
  }, '*')
}

function displayReadmeInIde(content) {
  window.parent.postMessage({action: 'displayReadmeInIde',data: {
    content: content
  }}, '*')

}


window.addEventListener("message", async (evt) => {
  // alert("Got message in Webview \nevt")
  let evtInfo = evt && evt.data ? evt.data : null
  if(!evtInfo) return
  let evtData = evtInfo.data

  let events = {}
  
  events['clickedOnLine'] = async () => clickedOnLine_fromIDE(evtData.lineContent, evtData.lineNumber, evtData.projectPath, evtData.filePath, evtData.isReplaceNode)
  events['clickedOnFile'] = async () => clickedOnFile_fromIDE(evtData.fileOrFolderPath, evtData.projectPath)
  events['displayContentInReadmeElement'] = async () => displayInputInReadmeElement_fromIDE(evtData.readmeText)
  events['runningInIde'] = async () => {}

  if(!events[evtInfo.action]) {
    //alert('no such js function to call: ' + evtInfo.action)
    return
  }

  try {
    await events[evtInfo.action]()
  } catch (ex) {
    // alert(ex)
  }
}, false);


window.onError = (ex) =>{
  alert(ex)
}

// Function to create and display the evtData element
function displayLogElement(evtData) {
  const evtDataDisplay = document.createElement('div');
  evtDataDisplay.style.position = 'fixed';
  evtDataDisplay.style.top = '0';
  evtDataDisplay.style.left = '0';
  evtDataDisplay.style.width = '100%';
  evtDataDisplay.style.backgroundColor = 'white'; // Changed background color to white
  evtDataDisplay.style.color = 'black'; // Adjusted text color for better contrast
  evtDataDisplay.style.zIndex = '1000';
  evtDataDisplay.style.padding = '10px';

  const closeButton = document.createElement('button');
  closeButton.innerText = 'Close';
  closeButton.style.float = 'left'; // Changed button position to left
  closeButton.onclick = () => {
    document.body.removeChild(evtDataDisplay);
  };

  evtDataDisplay.appendChild(closeButton);
  evtDataDisplay.appendChild(document.createElement('pre')).innerText = JSON.stringify(evtData, null, 2);
  document.body.appendChild(evtDataDisplay);
}
