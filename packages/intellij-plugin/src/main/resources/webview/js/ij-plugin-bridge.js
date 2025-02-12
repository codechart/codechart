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
    Promise.allSettled(urls.map(i => checkUrl(i)))
        .then((results) => {
                const successIndex = results.findIndex(result => result.status === 'fulfilled');
                if (successIndex === -1) {
                    alertUser('Covalent agent is not running!\nstart the agent and refresh', true);
                } else {
                    frameElement.src = urls[successIndex];
                }
            }
        );
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

async function handleGetProjectPath() {
    const projectPath = await getProjectPathFromIdeCallback();
    frameElement.contentWindow.postMessage({
        action: 'setProjectPath',
        data: {
            projectPath: projectPath
        }
    }, '*');
}

window.addEventListener('message', async (evt) => {
    try {
        // alert('getMessageInIdeJs')
        let evtInfo = evt && evt.data ? evt.data : null
        if (!evtInfo) return
        let evtData = evtInfo.data

        let events = {}
        
        events['goToLineInIde'] = async () => goToLineInIDE(evtData.projectPath, evtData.filePath, evtData.lineNumber)
        events['displayReadmeInIde'] = async () => displayReadmeInIde(evtData.content)
        events['getProjectPath_fromIDE'] = async () => handleGetProjectPath()

        if (!events[evtInfo.action]) {
            // alert('no such js function to call: ' + evtInfo.action)
            return
        }

        await events[evtInfo.action]()
    } catch (ex) {
        // alert(ex)
    }
}, false)

function alertUser(text, coverScreen = false) {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: ${coverScreen ? 'fixed' : 'absolute'};
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 25px 35px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1000;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-width: 280px;
        max-width: 80%;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'x';
    closeBtn.style.cssText = `
        position: absolute;
        right: 12px;
        top: 12px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 24px;
        color: #666;
        transition: color 0.2s;
        padding: 5px;
        line-height: 0.6;
    `;
    closeBtn.onmouseover = () => closeBtn.style.color = '#000';
    closeBtn.onmouseout = () => closeBtn.style.color = '#666';
    closeBtn.onclick = () => alertDiv.remove();

    const message = document.createElement('p');
    message.textContent = text;
    message.style.cssText = `
        margin: 0;
        color: #333;
        line-height: 1.5;
        font-size: 16px;
    `;
    
    if (coverScreen) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 999;
            animation: fadeIn 0.2s ease-out;
        `;
        alertDiv.appendChild(closeBtn);
        alertDiv.appendChild(message);
        overlay.appendChild(alertDiv);
        document.body.appendChild(overlay);
    } else {
        alertDiv.appendChild(closeBtn);
        alertDiv.appendChild(message);
        document.body.appendChild(alertDiv);
    }
}



