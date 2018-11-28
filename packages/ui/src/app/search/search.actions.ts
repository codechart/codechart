import {AppComponent, FindInFilesResponse, MatchInfo} from "../app.component";
import {Node, Edge} from 'vis'
import {ChartWrapper} from "../chart/chart.wrapper";
import {ChartActions} from "../chart/chart.actions";
import {ChartUtils} from "../chart/chart.utils";

import * as md5 from 'md5';
import {ChartStyles} from "../chart/chart.styles";
const VISI_PREFIX = "Visi id: "

export class SearchActions {
  private app:AppComponent;
  private chart:ChartWrapper
  private chartActions:ChartActions

  constructor(app:AppComponent) {
    this.app = app
    this.chart = app.chart
    this.chartActions = app.chartActions
  }

  public searchSelectedFile() {
    this.chartActions.setSelectedAsPath()
    let path = this.chart.getNodeType(this.app.selectedNode as Node) === 'file' ? this.app.selectedNode.id : this.chart.getProperty(this.app.selectedNode, 'ofFile')
    this.doSearch(Object.assign(this.app.searchJson, {path: path}))
  }

  public contentSearch() {
    this.chartActions.setSelectedAsPath()
    let content = this.chartActions.getNodeContent(this.app.selectedNode)
    let contentText = content.content
    let results:Array<Edge| Node> = []
    let regex = new RegExp(this.app.searchJson.pattern, this.app.searchJson.flags)
    for (let match = regex.exec(contentText); match != null; match = regex.exec(contentText)) {
      let line = contentText.substring(contentText.lastIndexOf('\n', match.index) + 1, contentText.indexOf('\n', match.index))
      let indexInFileContent = match.index + content.startIndex
      let lineNumber = this.app.currentFile.content.substring(0, indexInFileContent).split('\n').length
      results = results.concat(this.app.chartActions.createMatchNode({
          value: match[0],
          index: indexInFileContent,
          line: line,
          lineNumber: lineNumber,
          id: this.createId(ChartUtils.getOfFile(this.app.selectedNode as Node), lineNumber)
        },
        this.chart.getProperty(this.app.selectedNode, 'ofFile')
      ))
    }
    this.app.chartActions.addNodesToChart(results)

  }

  private createId(filePath, lineNumber):string {
    return md5(filePath + lineNumber + new Date().getMilliseconds)
  }


  public totalSearch() {
    this.chartActions.setSelectedAsPath()
    this.doSearch(Object.assign(this.app.searchJson, {path: ''}))
  }

  public doSearch(searchJson) {
    console.log('search: ', searchJson)
    this.app.http.post('http://localhost:2900/find', searchJson).subscribe((response:FindInFilesResponse[]) => this.loadDataFromFindInFiles(response))
  }

  public loadDataFromFindInFiles(response:FindInFilesResponse[]) {
    console.log('find in files response', response)
    let addedNodesAndLinks = []
    response.forEach(file => {
      let fileNodeId = file.file
      let fileValue = file.file
      let fileNode = this.chart.createNode(fileNodeId, fileValue, ChartStyles.fileNode)
      fileNode = ChartUtils.setElementAttributesAndGet(fileNode, {fileContent: file.content, level: 0})
      addedNodesAndLinks.push(fileNode)

      file.matches.forEach((match:any) => {
        let matchNodes = this.chartActions.createMatchNode(match, fileNodeId)
        matchNodes = matchNodes.map(item=> {
          return JSON.parse(JSON.stringify(item))
        })
        addedNodesAndLinks = addedNodesAndLinks.concat(matchNodes)
      })
    })

    let nodesAndLinks = this.chartActions.addNodesToChart(addedNodesAndLinks)
    setTimeout(() => {
      this.chartActions.dimNodes(nodesAndLinks)
    }, 100)


  }

  public createMatchFromSelection(filePath, fileText, selectedText, selectionStart): MatchInfo {
    let textUpToSelection = fileText.substring(0, selectionStart)
    let lines = textUpToSelection.split('\n')
    let lineStartIndex = textUpToSelection.lastIndexOf('\n')
    let lineEndIndex = selectionStart
    while(fileText.charAt(lineEndIndex) != '\n' && lineEndIndex<2000){ lineEndIndex++ }
    return {
      line: fileText.substring(lineStartIndex, lineEndIndex),
      value: selectedText,
      lineNumber: lines.length - 1,
      index: selectionStart,
      id: this.createId(filePath, lines.length - 1)
    }
  }


}
