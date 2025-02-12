import { AppComponent } from '../app.component'
import { ChartUtils } from "../chart/chart.utils";
import { FileNode, MatchNode, VisiNode } from '../types.nodejs'
import { SearchActions } from '../search/search.actions'
import { SearchManagement } from '../SearchManagement'

declare function goToLineInIDE(projectPath, filePath, lineNumber): any
declare function displayReadmeInIde(text)
declare function isInIntellijCallback(param)
declare function ideJsMessage(param): void;
declare function getProjectPathFromIde(): void;




/*
declare function doSomething: any
export const doSomething = () => {doSomethingJS()}
*/

export class IdeConnect {
  public isInIde = false
  searchManagement: SearchManagement;
  private searchActions: SearchActions
  chart: any;
  static readonly IDE_SYNC_INTERVAL_MS: number = 3 * 1000; // 1 seconds in milliseconds

  constructor(private app: AppComponent) {
    this.isInIde = window.location === window.parent.location ? false : true
  }

  public initialize() {
    this.searchActions = this.app.searchActions
    this.chart = this.app.chart
    this.searchManagement = this.app.searchManagement
    
    if (this.getIsInIde()) {
      getProjectPathFromIde()
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



  public input_setTextOfCurrentGroup(content) {
    if (!(ChartUtils.isGroupNode(this.app.selectedNode as VisiNode))) return
    ChartUtils.setFileContent(this.app.selectedNode, content, this.chart)
  }

  public output_goToLineInIde(lineNumber) {
    let fileNode = this.app.currentFile.node
    goToLineInIDE(this.searchManagement.getSelectedProject().localPath, fileNode.d.fileId.path, lineNumber)
  }

  public output_sendContentToIdeReadme(content) {
    console.log('sending group content to webview')
    displayReadmeInIde(content)
  }

  public ideJsMessage(jsonData) {
    if(!this.getIsInIde()) return
    ideJsMessage(jsonData)
  }
}
