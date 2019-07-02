import {AppComponent} from "../app.component";
import {Node, Edge} from 'vis'
import {ChartWrapper} from "../chart/chart.wrapper";
import {ChartActions} from "../chart/chart.actions";
import {ChartUtils} from "../chart/chart.utils";

import {ChartStyles} from "../chart/chart.consts";
import {CreateUtils} from "../chart/create.utils";
import {MatchInfo, FindInFilesResponse, EndPoints, SearchJson} from "../types.nodejs";
import {SaveLoad} from "../chart/save.load";
import { Utils } from "../chart/Utils";


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
    let fileNode = ChartUtils.isFileNode(this.app.selectedNode) ? this.app.selectedNode : this.chart.getItem(ChartUtils.getOfFile(this.app.selectedNode as Node)) as Node
    let path = ChartUtils.getFilePath(fileNode)
    this.doSearch(Object.assign({}, this.app.searchJson, {path: path}))
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
      let matchItems = CreateUtils.createMatchNode(
        matchInfo,
        this.chart.getProperty(this.app.selectedNode, 'ofFile'),
        this.chart,
        this.app.selectedNode as Node,
        this.app.layout
      )
      results = results.concat(matchItems)
    }
    this.app.chartActions.addNodesToChart(results)

  }

  public totalSearch() {
    // this.chartActions.setSelectedAsPath()
    this.doSearch(this.app.searchJson)
  }

  public doSearch(searchJson: SearchJson) {
    console.log('search: ', searchJson)
    this.app.addMessage('sarching', searchJson.pattern + '...', 2000)
    this.app.http.post('http://localhost:2900'+EndPoints.find, searchJson).subscribe(
      (response: FindInFilesResponse[]) => {
        // let matchNode = this.createMatchFromSelection()
        // setTimeout(()=>{
        //   this.saveLoad.loadDataFromFindInFiles(response, matchNode)
        // }, 100)
          this.saveLoad.loadDataFromFindInFiles(response, this.app.selectedNode as Node)
      },
      (error)=> this.app.addMessage('ERROR:' + error.message, error.error.message, 4000)
    )
  }

  

  public createMatchFromSelection(): Node {
    let selectedNode = this.app.selectedNode
    if (selectedNode === null) {
      this.app.noSelectedNode();
      return;
    }
    let ofFileNodeId = ChartUtils.isFileNode(selectedNode as Node) ? selectedNode.id : ChartUtils.getOfFile(selectedNode as Node);
    let selection = window.getSelection();
    let parentRow = window.getSelection().focusNode as HTMLElement;
    while (parentRow.tagName !== 'TR' && parentRow.tagName !== 'tr') {
      parentRow = parentRow.parentElement;
    }
    let lineText = (parentRow.lastChild as HTMLElement).innerText;
    let lineCounter = 0;
    let textLengthTillNow = 0;
    for (let previousRow: HTMLElement = parentRow.previousSibling as HTMLElement;
      previousRow !== null;
      previousRow = previousRow.previousSibling as HTMLElement) {
      textLengthTillNow += (previousRow.lastChild as HTMLElement).innerText.length; //\r\n;
      lineCounter++;
    }

    let existingNode = ChartUtils.getNodeByFileAndLineNumber(ofFileNodeId, lineText, this.chart);
    let matchId: string = existingNode !== null ? existingNode.id as string : CreateUtils.createId(ofFileNodeId, lineCounter);
    let endContentLine
    if (lineText.indexOf('(') !== -1) {
      endContentLine = Utils.getContentOfFunction(ChartUtils.getFileNodeContent(this.chart.getItem(ofFileNodeId) as Node).split('\n'), lineCounter)
    }
    let match: MatchInfo = {
      line: lineText,
      value: selection.toString(),
      lineNumber: lineCounter,
      lineStartIndex: textLengthTillNow + selection.focusOffset,
      indexInLine: selection.focusOffset,
      id: matchId,
      isRegex: false,
      flags: 'gi',
      endContentLine: lineCounter + endContentLine
    };

    let matchItems = CreateUtils.createMatchNode(match, ofFileNodeId, this.chart, selectedNode as Node, 'directional');
    this.chartActions.addNodesToChart(matchItems);
    let matchNode = matchItems.filter(i=>ChartUtils.isNode(i))[0]
    return matchNode as Node
  }



}
