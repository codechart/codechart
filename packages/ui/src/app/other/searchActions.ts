import {AppComponent, FindInFilesResponse} from "../app.component";
import { Network, DataSet, Node, Edge, IdType } from 'vis'
import {ChartWrapper} from "./vla.styles";

export class SearchActions {
  private app: AppComponent;
  private chart: ChartWrapper
  constructor(app: AppComponent) {
    this.app = app
    this.chart = app.chart
  }

  public searchSelectedFile() {
    let path = this.chart.getNodeType(this.app.selectedNode as Node) === 'file' ? this.app.selectedNode.id : this.chart.getProperty(this.app.selectedNode, 'ofFile')
    this.doSearch(Object.assign(this.app.searchJson, {path: path}))
  }

  public contentSearch() {
    let content = this.app.getNodeContent(this.app.selectedNode)
    let contentText = content.content
    let results: Array<Edge| Node> = []
    let regex = new RegExp(this.app.searchJson.pattern, this.app.searchJson.flags)
    for (let match = regex.exec(contentText); match != null; match = regex.exec(contentText)) {
      let line = contentText.substring(contentText.lastIndexOf('\n', match.index) + 1, contentText.indexOf('\n', match.index))
      let indexInFileContent = match.index + content.startIndex
      let lineNumber = this.app.currentFile.content.substring(0, indexInFileContent).split('\n').length
      results = results.concat(this.app.vlaActions.createMatchNode({
          value: match[0],
          index: indexInFileContent,
          line: line,
          lineNumber: lineNumber
        },
        this.chart.getProperty(this.app.selectedNode, 'ofFile')
      ))
    }
    this.app.vlaActions.addNodesToChart(results)

  }

  public totalSearch() {
    this.doSearch(Object.assign(this.app.searchJson, {path: ''}))
  }

  public doSearch(searchJson) {
    console.log('search: ', searchJson)
    this.app.http.post('http://localhost:2900/find', searchJson).subscribe((response: FindInFilesResponse[]) => this.app.loadDataFromFindInFiles(response))
  }

}
