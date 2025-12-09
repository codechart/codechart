import { AppComponent } from '../app.component'
import { ChartUtils } from "../chart/chart.utils";
import { FileNode, MatchNode, VisiNode, EndPoints } from '../types.nodejs'
import { SearchActions } from '../search/search.actions'
import { SearchManagement } from '../SearchManagement'
import { HttpClient } from '@angular/common/http'
import { Env } from '../utils/Env'

declare function goToLineInIDE(projectPath, filePath, lineNumber): any
declare function displayReadmeInIde(text)
declare function isInIntellijCallback(param)
declare function ideJsMessage(param): void;
declare function getProjectPathideEvent(): void;




/*
declare function doSomething: any
export const doSomething = () => {doSomethingJS()}
*/

export class IdeConnect {
  public isInIde = false
  searchManagement: SearchManagement;
  private searchActions: SearchActions
  chart: any;
  private http: HttpClient;
  static readonly IDE_SYNC_INTERVAL_MS: number = 3 * 1000; // 1 seconds in milliseconds

  constructor(private app: AppComponent) {
    // Force IDE mode for testing
    this.isInIde = window.location === window.parent.location ? false : true
  }

  public initialize() {
    this.searchActions = this.app.searchActions
    this.chart = this.app.chart
    this.searchManagement = this.app.searchManagement
    this.http = this.app.http

    if (this.getIsInIde()) {
      // add call to api saying im running in IDE
      window.setTimeout(() => getProjectPathideEvent(), 1000)

      window.setTimeout(() => {
        this.http.post(Env.getApiEndpoint() + EndPoints.auditIdeInit, { isInIde: true })
          .toPromise()
          .catch(err => console.error('Failed to audit IDE init:', err))
      }, 1500)
    } else {
      window.setTimeout(() => {
        this.http.post(Env.getApiEndpoint() + EndPoints.auditIdeInit, { isInIde: false })
          .toPromise()
          .catch(err => console.error('Failed to audit web init:', err))
      }, 1000)
    }
  }

  public getIsInIde(): boolean {
    return this.isInIde
  }

  private async validateProjectIsGit(projectPath: string): Promise<boolean> {
    await this.searchManagement.setProjectPath(projectPath, -1)
    if (this.searchManagement.getSelectedProject().localPath !== this.searchManagement.getSelectedProject().rootPath) {
      return false
    } else return true
  }

  private async handleProjectPath(projectPath: string) {
    const isGitFolder = await this.validateProjectIsGit(projectPath)
    if (!isGitFolder) {
      this.ideJsMessage('Creating diagrams from IDE is only possible when workspace is a git folder')
      return
    }
    await this.searchManagement.setProjectPath(projectPath, -1)
  }

  public async input_setProjectPath(projectPath: string) {
    await this.handleProjectPath(projectPath)
  }

  public async input_addMatchOnClick(lineContent, lineNumber, projectPath, filePath, isReplaceNode) {
    await this.app.synchAction(false)
    const isGitFolder = await this.validateProjectIsGit(projectPath)
    if (!isGitFolder) {
      this.ideJsMessage('Creating diagrams from IDE is only possible when workspace is a git folder')
      return
    }
    let fileNode = this.chart.getAllFileNodes().find((node: FileNode) => {
      const normalizedFilePath = filePath.replace(/\\/g, '/');
      const normalizedNodePath = ChartUtils.getFilePath(node).replace(/\\/g, '/');
      return (normalizedFilePath.endsWith(normalizedNodePath) && node.d.fileId.gitUrl === this.searchManagement.searchObject.projectPath.gitUrl)
    });


    if (fileNode && isReplaceNode) {
      let matchInfo = this.searchActions.createMatchInfo(lineContent, lineNumber, fileNode.d.fileId);
      this.searchActions.createMatchNode(matchInfo, this.app.selectedNode as VisiNode, isReplaceNode);
    } else {
      let normalizedFilePath = filePath.startsWith('file://') ? filePath.substring(('file://' + projectPath).length) : filePath.substring((projectPath).length)
      this.searchActions.addMatchFromFile(this.app.searchManagement.searchObject.projectPath,
        normalizedFilePath,
        [lineNumber])
    }
  }

  public async input_addFileOnClick(filePath, projectPath) {
    await this.app.synchAction(false)
    const isGitFolder = await this.validateProjectIsGit(projectPath)
    if (!isGitFolder) {
      this.ideJsMessage('Creating diagrams from IDE is only possible when workspace is a git folder')
      return
    }
    await this.searchActions.openFile(this.searchManagement.searchObject, filePath.substring(projectPath.length, filePath.length))
  }

  public async input_loadDiagramFromFile(jsonContent: string, filename: string, filePath: string, projectPath: string) {
    await this.app.synchAction(false)
    const isGitFolder = await this.validateProjectIsGit(projectPath)
    if (!isGitFolder) {
      this.ideJsMessage('Loading diagrams from IDE is only possible when workspace is a git folder')
      return
    }
    this.app.handleLlmJsonPaste(jsonContent, filename, filePath)
  }



  public input_setTextOfCurrentGroup(content) {
    console.log('[IdeConnect] input_setTextOfCurrentGroup called')
    const contentLength = content ? content.length : 0
    console.log('  - Content length:', contentLength)
    console.log('  - Current selected node:', this.app.selectedNode ? (this.app.selectedNode as any).id : 'null')

    if (!(ChartUtils.isGroupNode(this.app.selectedNode as VisiNode))) {
      console.error('[IdeConnect] ✗ Selected node is not a group node, returning')
      return
    }

    console.log('[IdeConnect] → Updating file content on group node')
    ChartUtils.setFileContent(this.app.selectedNode, content, this.chart)
    console.log('[IdeConnect] ✓ File content updated successfully')
  }

  public output_goToLineInIde(lineNumber) {
    console.log('[IdeConnect] output_goToLineInIde called')
    console.log('  - Line number:', lineNumber)

    let fileNode = this.app.currentFile.node
    const projectPath = this.searchManagement.getSelectedProject().localPath
    const filePath = fileNode.d.fileId.path

    console.log('[IdeConnect] → Sending goToLine to IDE')
    console.log('  - Project path:', projectPath)
    console.log('  - File path:', filePath)
    console.log('  - Line:', lineNumber)

    goToLineInIDE(projectPath, filePath, lineNumber)
    console.log('[IdeConnect] ✓ goToLineInIde message sent')
  }

  public output_sendContentToIdeReadme(content) {
    displayReadmeInIde(content)
  }

  public output_saveDiagramToFile(diagramJson: string, filePath: string) {
    console.log('[IdeConnect] output_saveDiagramToFile called')
    console.log('  - File path:', filePath)
    this.ideJsMessage({
      action: 'saveDiagramToFile_ideEvent',
      filePath: filePath,
      jsonContent: diagramJson
    })
  }

  public ideJsMessage(jsonData) {
    if (!this.getIsInIde()) return
    ideJsMessage(jsonData)
  }
}
