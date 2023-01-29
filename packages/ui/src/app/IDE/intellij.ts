import { AppComponent } from '../app.component'
import { ChartUtils } from "../chart/chart.utils";
import { MatchNode, VisiNode } from '../types.nodejs'
import { SearchActions } from '../search/search.actions'
import { SearchManagement } from '../SearchManagement'

declare function goToLineIDE(filePath, lineNumber): any
declare function displayReadmeInIdeCallback(text)
declare function isInIntellijCallback(param)
export enum IDE {none, intellij, vscode}



/*
declare function doSomething: any
export const doSomething = () => {doSomethingJS()}
*/

export class IdeConnect {
  // only for debugging
  public debugIsInIDE
  /////
  searchManagement: SearchManagement;
  private searchActions: SearchActions
  chart: any;
  constructor(private app: AppComponent) {
  }

  public initialize() {
    this.searchActions = this.app.searchActions
    this.chart = this.app.chart
    this.searchManagement = this.app.searchManagement
  }

  public isInIde(): IDE {
    if(this.debugIsInIDE!==undefined) return this.debugIsInIDE
    try {isInIntellijCallback('')} catch(ex) {return IDE.none}
    return IDE.intellij
  }

  public async input_addMatchOnClick(lineNumber, filePath, projectPath) {
    await this.app.setProjectPathAction(projectPath, -1)
    this.searchActions.addMatchFromFile(this.searchManagement.searchObject, filePath, [lineNumber])
  }

  public async input_addFileOnClick(filePath, projectPath) {
    await this.app.setProjectPath(projectPath, -1)
    this.searchActions.openFile(this.searchManagement.searchObject, filePath)
  }

  public input_setTextOfCurrentGroup(content) {
    if(!(ChartUtils.isGroupNode(this.app.selectedNode as VisiNode))) return
    ChartUtils.setFileContent(this.app.selectedNode, content, this.chart)
  }

  public output_goToLineInIde(lineNumber) {
    console.log('going to line')
    let fileNode = this.app.currentFile.node
    goToLineIDE(this.searchManagement.getPathByGitUrl(fileNode.d.gitUrl).folder +
      this.searchManagement.splitChar + fileNode.d.path
      , lineNumber)
  }

  public output_sendContentToIdeReadme(content) {
    console.log('sending group content to webview')
    displayReadmeInIdeCallback(content)
  }
}
