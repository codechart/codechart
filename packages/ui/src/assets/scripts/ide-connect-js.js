async function clickedOnLine_fromIDE(lineNumber, projectPath, filePath) {
  await Global_app.ideConnect.input_addMatchOnClick(
    lineNumber,
    projectPath,
    filePath
  )
}

async function clickedOnFile_fromIDE(fileOrFolderPath, projectPath) {
  await Global_app.ideConnect.input_addFileOnClick(
    fileOrFolderPath,
    projectPath
  )
}

async function displayInputInReadmeElement_fromIDE(content) {
  Global_app.ideConnect.input_setTextOfCurrentGroup(content)
}

function goToLineInIDE(filePath, lineNumber) {
  window.parent.postMessage(
    {
      action: 'goToLineInIde',
      data: {
        filePath: filePath,
        lineNumber: lineNumber,
      },
    },
    '*'
  )
}

function displayReadmeInIde(content) {
  window.parent.postMessage(
    {
      action: 'displayReadmeInIde',
      data: {
        content: content,
      },
    },
    '*'
  )
}

window.addEventListener(
  'message',
  async (evt) => {
    //alert("Got message in Webview \nevt")
    let evtInfo = evt && evt.data ? evt.data : null
    if (!evtInfo) return
    let evtData = evtInfo.data

    let events = {}
    events['clickedOnLine'] = async () =>
      clickedOnLine_fromIDE(
        evtData.lineNumber,
        evtData.projectPath,
        evtData.filePath
      )
    events['clickedOnFile'] = async () =>
      clickedOnFile_fromIDE(evtData.fileOrFolderPath, evtData.projectPath)
    events['displayContentInReadmeElement'] = async () =>
      displayInputInReadmeElement_fromIDE(evtData.readmeText)
    events['runningInIde'] = async () => {}

    if (!events[evtInfo.action]) {
      //alert('no such js function to call: ' + evtInfo.action)
      return
    }

    try {
      await events[evtInfo.action]()
    } catch (ex) {
      // alert(ex)
    }
  },
  false
)

window.onError = (ex) => {
  alert(ex)
}
