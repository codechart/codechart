import { AppComponent } from '../app.component'
import { ChartUtils } from "../chart/chart.utils";
import { VisiNode } from "../types.nodejs";
import { SearchActions } from '../search/search.actions'

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
  public searchActions: SearchActions
  constructor(private app: AppComponent) {
    this.searchActions = app.searchActions
  }

  public isInIde(): IDE {
    if(this.debugIsInIDE!==undefined) return this.debugIsInIDE
    try {isInIntellijCallback('')} catch(ex) {return IDE.none}
    return IDE.intellij
  }

  public async input_addMatchOnClick(lineNumber, filePath, projectPath) {
    await this.app.setProjectPathAction(projectPath, -1)
    this.searchActions.addMatchFromFile(this.app.searchObject, filePath, [lineNumber])
  }

  public async input_addFileOnClick(filePath, projectPath) {
    await this.app.setProjectPath(projectPath, -1)
    this.searchActions.openFile(this.app.searchObject, filePath)
  }

  public input_setTextOfCurrentGroup(content) {
    if(!(ChartUtils.isGroupNode(this.app.selectedNode as VisiNode))) return
  }

  public output_goToLineInIde(filePath, lineNmber) {
    goToLineIDE(filePath, lineNmber)
  }

  public output_sendContentToIdeReadme(content) {
    displayReadmeInIdeCallback(content)
  }
}
