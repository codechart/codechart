import {AppComponent} from "../app.component";
import {Node, Edge} from 'vis'
import {ChartWrapper} from "../chart/chart.wrapper";
import {ChartActions} from "../chart/chart.actions";
import {ChartUtils} from "../chart/chart.utils";

import {ChartStyles} from "../chart/chart.consts";
import {CreateUtils} from "../chart/create.utils";
import {MatchInfo, FindInFilesResponse, EndPoints, SearchJson} from "../types.nodejs";
import {SaveLoad} from "../chart/save.load";


export class SearchActions {
  private chart: ChartWrapper
  private chartActions: ChartActions
  private saveLoad: SaveLoad

  constructor(private app: AppComponent) {}

  initialize() {
    this.chart = this.app.chart
    this.chartActions = this.app.chartActions
    this.saveLoad = this.app.saveLoad
  }

  public searchSelectedFile() {
    this.chartActions.setSelectedAsPath()
    let fileNode = ChartUtils.isFileNode(this.app.selectedNode) ? this.app.selectedNode : this.chart.getItem(ChartUtils.getOfFile(this.app.selectedNode as Node)) as Node
    let path = ChartUtils.getFilePath(fileNode)
    this.doSearch(Object.assign(this.app.searchJson, {path: path}))
  }

  public contentSearch() {
    this.chartActions.setSelectedAsPath()
    let content = this.chartActions.getNodeContent(this.app.selectedNode)
    let contentText = content.content
    let results: Array<Edge| Node> = []
    let regex = new RegExp(this.app.searchJson.pattern, this.app.searchJson.flags)
    for (let match = regex.exec(contentText); match != null; match = regex.exec(contentText)) {
      let line = contentText.substring(contentText.lastIndexOf('\n', match.index) + 1, contentText.indexOf('\n', match.index))
      let indexInFileContent = match.index + content.startIndex
      let lineNumber = this.app.currentFile.content.substring(0, indexInFileContent).split('\n').length
      let matchInfo: MatchInfo = {
        line: line,
        value: match[0],
        lineNumber: lineNumber,
        lineStartIndex: content.startIndex,
        indexInLine: indexInFileContent - content.startIndex,
        id: CreateUtils.createId(ChartUtils.getOfFile(this.app.selectedNode as Node), lineNumber),
        isRegex: this.app.searchJson.isRegex,
        flags: this.app.searchJson.flags
      }
      let addedNode = CreateUtils.createMatchNode(
        matchInfo,
        this.chart.getProperty(this.app.selectedNode, 'ofFile'),
        this.chart,
        this.app.selectedNode as Node
      )
      results = results.concat(addedNode)
    }
    this.app.chartActions.addNodesToChart(results)

  }

  public totalSearch() {
    this.chartActions.setSelectedAsPath()
    this.doSearch(Object.assign(this.app.searchJson, {path: ''}))
  }

  public doSearch(searchJson: SearchJson) {
    console.log('search: ', searchJson)
    this.app.setMessage('searching ' + searchJson.pattern + '...', 2000)
    this.app.http.post('http://localhost:2900'+EndPoints.find, searchJson).subscribe(
      (response: FindInFilesResponse[]) => this.saveLoad.loadDataFromFindInFiles(response),
      (error)=> this.app.setMessage('ERROR: ' + error.message, 2000)
    )
  }

}
