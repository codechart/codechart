const ccUrls = ['http://localhost:4300', 'http://localhost:2800', 'http://localhost:2900']
let frameElement
window.onload = function() {
    frameElement = document.getElementById('myFrame')
    frameElement.style.width = window.innerWidth + 'px'
    frameElement.style.height = window.innerHeight + 'px'
    frameElement.onLoad = () => {
        frameElement.contentWindow.postMessage({ action: 'runningInIde' }, '*')
    }

}

function checkUrl(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', url)
        xhr.onload = () => {
            if (xhr.status === 200) {
                console.log('connected to ' + url)
                resolve(xhr.response)
            } else {
                console.log('failed connecting to ' + url)
                reject(xhr.statusText)
            }
        }
        xhr.onerror = () => {
            console.log('failed connecting to ' + url)
            reject('Network Error')
        }
        xhr.send()
    })
}

function tryConnections(urls) {
    Promise.all(urls.map(i => checkUrl(i)
        .catch(i => console.log('failed connecting'))))
        .then((i) => {
                let urlIndex = i.findIndex(i => i)
                if(urlIndex===-1) alert('CodeChart agent is not running!\nstart the agent and refresh')
                else frameElement.src = urls[urlIndex]
            },
        )
}

tryConnections(ccUrls)

function clickedOnLine(ideEventObject, lineContent, lineNumber, filePath, projectPath, fileContent, isReplaceNode) {
    frameElement.contentWindow.postMessage({
        action: 'clickedOnLine', data: {
            lineContent: lineContent,
            lineNumber: lineNumber,
            filePath: filePath,
            projectPath: projectPath,
            isReplaceNode: isReplaceNode,
        },
    }, '*')
}

function clickedOnFile(ideEventObject, isReplaceNode, fileOrFolderPath, projectPath, fileContent, filesInFolder) {
    frameElement.contentWindow.postMessage({
        action: 'clickedOnFile', data: {
            isReplaceNode: isReplaceNode,
            fileOrFolderPath: fileOrFolderPath,
            projectPath: projectPath,
            fileContent: fileContent,
            filesInFolder: filesInFolder,
        },
    }, '*')
}

function displayInputInReadmeElement(readmeText) {
    frameElement.contentWindow.postMessage({
        action: 'displayContentInReadmeElement', data: {
            readmeText: readmeText,
        },
    }, '*')
}

window.addEventListener('message', async (evt) => {
    try {
        // alert('getMessageInIdeJs')
        let evtInfo = evt && evt.data ? evt.data : null
        if (!evtInfo) return
        let evtData = evtInfo.data

        let events = {}
        events['goToLineInIde'] = async () => goToLineInIDE(evtData.filePath, evtData.lineNumber)
        events['displayReadmeInIde'] = async () => displayReadmeInIde(evtData.content)

        if (!events[evtInfo.action]) {
            // alert('no such js function to call: ' + evtInfo.action)
            return
        }

        await events[evtInfo.action]()
    } catch (ex) {
        // alert(ex)
    }
}, false)



