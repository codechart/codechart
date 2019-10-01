import { AppComponent } from "../app.component";
import { Node, Edge } from 'vis'
import { ChartWrapper } from "../chart/chart.wrapper";
import { ChartActions } from "../chart/chart.actions";
import { ChartUtils } from "../chart/chart.utils";

import { ChartStyles } from "../chart/chart.consts";
import { CreateUtils } from "../chart/create.utils";
import { MatchInfo, FindInFilesResponse, EndPoints, SearchJson } from "../types.nodejs";
import { SaveLoad } from "../chart/save.load";
import { Utils } from "../chart/Utils";


export class SearchActions {
  private chart: ChartWrapper
  private chartActions: ChartActions
  private saveLoad: SaveLoad

  constructor(private app: AppComponent) { }

  initialize() {
    this.chart = this.app.chart
    this.chartActions = this.app.chartActions
    this.saveLoad = this.app.saveLoad
  }

  public searchSelectedFile() {
    let fileNode = ChartUtils.isFileNode(this.app.selectedNode) ? this.app.selectedNode : this.chart.getItem(ChartUtils.getOfFile(this.app.selectedNode as Node)) as Node
    let path = ChartUtils.getFilePath(fileNode)
    this.doSearch(Object.assign({}, this.app.searchJson, { path: path }))
  }

  public contentSearch() {
    if(this.app.searchJson.pattern==="") return
    this.chartActions.setSelectedAsPath()
    let content = this.chartActions.getNodeContent(this.app.selectedNode)
    let contentText = content.content
    let results: Array<Edge | Node> = []
    let regex = new RegExp(this.app.searchJson.pattern, this.app.searchJson.flags)
    for (let match = regex.exec(contentText); match!=null; match = regex.exec(contentText)) {
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
    this.app.chartActions.addToChartAndPosition(results)

  }

  public totalSearch() {
    // this.chartActions.setSelectedAsPath()
    this.doSearch(this.app.searchJson)
  }

  public doSearch(searchJson: SearchJson) {
    if(!searchJson || searchJson.path==='') {
      this.app.addMessage('no path defined', 'no path defined', 2000)
    }
    console.log('search: ', searchJson)
    // let matchNode = this.createMatchFromSelection()
    // if(matchNode!==null) {
    //   matchNode = Utils.deepMerge(matchNode, ChartStyles.searchNode)
    //   let searchNodeTitle = searchJson.title && searchJson.title.length>0 ? `${searchJson.title}\n${searchJson.originalText}` :  `${searchJson.originalText}`
    //   matchNode.label = searchNodeTitle
    //   this.chart.addNodesAndLinks([matchNode], true)
    // }
    this.app.addMessage('sarching', searchJson.pattern + '...', 2000)
    this.app.http.post('http://localhost:2900' + EndPoints.find, searchJson).subscribe(
      (response: FindInFilesResponse[]) => {
        this.saveLoad.loadDataFromFindInFiles(response, /*matchNode ? matchNode : */ this.app.selectedNode as Node)
        // this.saveLoad.loadDataFromFindInFiles(response, matchNode as Node)
      },
      (error) => this.app.addMessage('ERROR:' + error.message, error.error.message, 4000)
    )
  }



  public createMatchFromSelection(): Node {
    let getLineNumberAndText = (selectionElement: HTMLElement) :{lineNumber, lineText, lineStartIndex} => {
      let parentRow = selectionElement
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
      return {lineNumber: lineCounter, lineText: lineText, lineStartIndex: textLengthTillNow}
    }
    let selectedNode = this.app.selectedNode
    if (selectedNode === null) {
      // this.app.noSelectedNode();
      return null;
    }
    let ofFileNodeId = ChartUtils.isFileNode(selectedNode as Node) ? selectedNode.id : ChartUtils.getOfFile(selectedNode as Node);
    let selection = window.getSelection();
    let start = getLineNumberAndText(window.getSelection().anchorNode as HTMLElement)
    let startLineText = start.lineText
    let startLineCounter = start.lineNumber

    let end = getLineNumberAndText(window.getSelection().focusNode as HTMLElement)
    let endLineNumber = (end.lineNumber !== start.lineNumber) ? end.lineNumber + 1 : null

    let matchId: string = CreateUtils.createId(ofFileNodeId, startLineCounter);
    let endContentLine
    if (startLineText.indexOf('(') !== -1) {
      endContentLine = Utils.getContentOfFunction(ChartUtils.getFileNodeContent(this.chart.getItem(ofFileNodeId) as Node).split('\n'), startLineCounter)
    }
    let match: MatchInfo = {
      line: startLineText,
      value: selection.toString(),
      lineNumber: startLineCounter,
      endLineNumber: endLineNumber,
      lineStartIndex: start.lineStartIndex + selection.focusOffset,
      indexInLine: selection.focusOffset,
      id: matchId,
      isRegex: false,
      flags: 'gi',
      endContentLine: startLineCounter + endContentLine
    };

    let matchItems = CreateUtils.createMatchNode(match, ofFileNodeId, this.chart, selectedNode as Node, 'directional');
    this.chartActions.addToChartAndPosition(matchItems);
    let matchNode = matchItems.filter(i => ChartUtils.isNode(i))[0]
    return matchNode as Node
  }



}
