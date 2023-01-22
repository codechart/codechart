import { AppComponent } from '../app.component'
import { ChartUtils } from "../chart/chart.utils";

declare function goToLineIDE(filePath, lineNumber): any
declare function displayReadmeInIdeCallback(text)
declare function isInIntellijCallback(param)
export enum IDE {none, intellij, vscode}



/*
declare function doSomething: any
export const doSomething = () => {doSomethingJS()}
*/

export class IdeConnect {
  constructor(private app: AppComponent) {
  }

  public isInIde(): IDE {
    if(isInIntellijCallback(""))
    return IDE.none
  }

  public async input_addMatchOnClick(lineNumber, filePath, projectPath) {
    await this.app.setProjectPathAction(projectPath, -1)
    this.app.searchActions.addMatchFromFile(this.app.searchObject, [lineNumber], filePath)
  }

  public async input_addFileOnClick(filePath, projectPath) {
    await this.app.setProjectPath(projectPath, -1)
    this.app.searchActions.openFile(this.app.searchObject, filePath)
  }

  public input_setTextOfCurrentGroup(content) {
    if(!(ChartUtils.isFileNode(this.app.selectedNode) && ChartUtils.isCustomNode(this.app.selectedNode))) return
    this.app.codeEditor.fileData.content = content
  }

  public output_goToLineInIde(filePath, lineNmber) {
    goToLineIDE(filePath, lineNmber)
  }

  public output_sendContentToIdeReadme(content) {
    displayReadmeInIdeCallback(content)
  }
}
