import { AppComponent } from '../app.component'
import { ChartUtils } from "../chart/chart.utils";
import { MatchNode, VisiNode } from '../types.nodejs'
import { SearchActions } from '../search/search.actions'
import { SearchManagement } from '../SearchManagement'

declare function goToLineInIDE(filePath, lineNumber): any
declare function displayReadmeInIdeCallback(text)
declare function isInIntellijCallback(param)



/*
declare function doSomething: any
export const doSomething = () => {doSomethingJS()}
*/

export class IdeConnect {
  // only for debugging
  public isInIde = false
  /////
  searchManagement: SearchManagement;
  private searchActions: SearchActions
  chart: any;
  constructor(private app: AppComponent) {
    this.isInIde = window.location === window.parent.location ? false : true
  }

  public initialize() {
    this.searchActions = this.app.searchActions
    this.chart = this.app.chart
    this.searchManagement = this.app.searchManagement
  }

  public getIsInIde(): boolean {
    return this.isInIde
  }

  public async input_addMatchOnClick(lineNumber, projectPath, filePath) {
    await this.app.setProjectPath(projectPath, -1)
    this.app.searchManagement.searchObject.folderPath
    this.searchActions.addMatchFromFile(this.app.searchManagement.searchObject.folderPath, filePath.substring(projectPath.length), [lineNumber])
  }

  public async input_addFileOnClick(filePath, projectPath) {
    await this.app.setProjectPath(projectPath, -1)
    await this.searchActions.openFile(this.searchManagement.searchObject, filePath)
  }

  public input_setTextOfCurrentGroup(content) {
    if(!(ChartUtils.isGroupNode(this.app.selectedNode as VisiNode))) return
    ChartUtils.setFileContent(this.app.selectedNode, content, this.chart)
  }

  public output_goToLineInIde(lineNumber) {
    console.log('going to line')
    let fileNode = this.app.currentFile.node
    goToLineInIDE(this.searchManagement.getPathByGitUrl(fileNode.d.gitUrl).folder +
      this.searchManagement.splitChar + fileNode.d.path
      , lineNumber)
  }

  public output_sendContentToIdeReadme(content) {
    console.log('sending group content to webview')
    displayReadmeInIdeCallback(content)
  }
}
