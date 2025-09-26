async function clickedOnLine_ideEvent(lineContent, lineNumber, projectPath, filePath, isReplaceNode) {
  await Global_app.ideConnect.input_addMatchOnClick(lineContent, lineNumber, projectPath, filePath, isReplaceNode)
}

async function clickedOnFile_ideEvent(fileOrFolderPath, projectPath) {
  await Global_app.ideConnect.input_addFileOnClick(fileOrFolderPath, projectPath)
}

async function displayInputInReadmeElement_ideEvent(content) {
  Global_app.ideConnect.input_setTextOfCurrentGroup(content)
}

function goToLineInIDE(projectPath, filePath, lineNumber) {
  window.parent.postMessage({action: "goToLineInIde_webviewEvent", data: {
      projectPath: projectPath,
      filePath: filePath,
      lineNumber: lineNumber
    }
  }, '*')
}

function getProjectPathideEvent() {
  console.log('getProjectPathideEvent')
  window.parent.postMessage({
    action: "getProjectPath_webviewEvent"
  }, '*')
}

function displayReadmeInIde(content) {
  window.parent.postMessage({action: 'displayReadmeInIde',data: {
    content: content
  }}, '*')
}

async function setProjectPath_ideEvent(projectPath) {
  window.setTimeout(async ()=>{await Global_app.ideConnect.input_setProjectPath(projectPath)}, 1000)
}

window.addEventListener("message", async (evt) => {
  // alert("Got message in Webview \nevt")
  let evtInfo = evt && evt.data ? evt.data : null
  if(!evtInfo) return
  let evtData = evtInfo.data

  let events = {}
  
  events["clickedOnLine_ideEvent"] = async () => clickedOnLine_ideEvent(evtData.lineContent, evtData.lineNumber, evtData.projectPath, evtData.filePath, evtData.isReplaceNode)
  events["clickedOnFile_ideEvent"] = async () => clickedOnFile_ideEvent(evtData.fileOrFolderPath, evtData.projectPath)
  events['displayContentInReadmeElement'] = async () => displayInputInReadmeElement_ideEvent(evtData.readmeText)
  events['runningInIde'] = async () => {}
  events['setProjectPath_ideEvent'] = async () => setProjectPath_ideEvent(evtData.projectPath)

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
function ideJsMessage(evtData) {
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
