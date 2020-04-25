import { AppComponent } from '../app.component';
import { Node, Edge } from 'vis';
import { ChartWrapper } from '../chart/chart.wrapper';
import { ChartActions } from '../chart/chart.actions';
import { ChartUtils } from '../chart/chart.utils';

import { ChartStyles } from '../chart/chart.consts';
import { CreateUtils } from '../chart/create.utils';
import { MatchInfo, FindInFilesResponse, EndPoints, SearchJson } from '../types.nodejs';
import { SaveLoad } from '../chart/save.load';
import { Utils } from '../chart/Utils';
import { Ace } from 'ace-builds';
import { AceSelectionRange } from '../code-viewer/code-viewer.component';

export class SearchActions {
  private chart: ChartWrapper;
  private chartActions: ChartActions;
  private saveLoad: SaveLoad;

  constructor(private app: AppComponent) {
  }

  initialize() {
    this.chart = this.app.chart;
    this.chartActions = this.app.chartActions;
    this.saveLoad = this.app.saveLoad;
  }

  public searchSelectedFile() {
    if (!this.app.currentFile) {
      console.log('no file selected')
      return
    }
    let fileNode = this.app.currentFile.node;

    this.doSearch(Object.assign({}, this.app.searchJson, { searchPath: ChartUtils.getFilePath(fileNode) }));
  }

  public contentSearch() {
    if (this.app.searchJson.pattern === '') return;
    this.chartActions.setSelectedAsPath();
    let content = this.chartActions.getNodeContent(this.app.selectedNode);
    let contentLines = content.content.split('\n');
    let results: Array<Edge | Node> = [];
    let regex = new RegExp(this.app.searchJson.pattern, this.app.searchJson.flags);
    contentLines.forEach((line, index) => {
      if (!line.match(regex)) return
      let lineNumber = index + content.startIndex
      let matchInfo: MatchInfo = {
        line: line,
        value: line,
        lineNumber: lineNumber,
        indexInLine: 0,
        id: CreateUtils.createId(ChartUtils.getOfFileId(this.app.selectedNode as Node), lineNumber),
        isRegex: this.app.searchJson.isRegex,
        flags: this.app.searchJson.flags,
        ofFile: ChartUtils.getOfFileId(this.app.selectedNode as Node)
      };
      let matchItems = CreateUtils.createOrUpdateMatchNode(
        matchInfo,
        this.chart.getProperty(this.app.selectedNode, 'ofFile'),
        this.chart,
        this.app.selectedNode as Node
      );
      results = results.concat(matchItems);
    });
    this.chart.addToHistory(true)
    this.app.chartActions.addToChartAndPosition(results);

  }

  public totalSearch() {
    // this.chartActions.setSelectedAsPath()
    this.doSearch(this.app.searchJson);
  }

  public doSearch(searchJson: SearchJson, callback?) {
    if (!searchJson || searchJson.dirPath === '') {
      this.app.addMessage('no path defined', 'no path defined', 2000);
    }
    console.log('search: ', searchJson);
    this.app.addMessage('searching', searchJson.pattern + '...', 2000);
    this.app.http.post('http://localhost:2900' + EndPoints.find, searchJson).subscribe(
      (response: FindInFilesResponse[]) => {
        this.app.showFindResultsDialog(response, callback)
      },
      (error) => this.app.addMessage('ERROR:' + error.message, error.error.message, 4000)
    );
  }

  public displaySearchResults(results: FindInFilesResponse[], callback) {
    let selectionNode = this.createMatchFromSelection(false)
    if (selectionNode !== null) {
      selectionNode = Utils.deepMerge(selectionNode, ChartStyles.searchNode)
      selectionNode = Utils.deepMerge(selectionNode, ChartStyles.gotoNode)
      let searchNodeTitle = CreateUtils.getMatchNodeLabel(ChartUtils.getLineNumber(selectionNode), null, selectionNode.label)
      selectionNode.label = searchNodeTitle
      this.chart.addNodesAndLinks([selectionNode], true)
      this.chart.setSelectionNodes([selectionNode.id])
    }
    setTimeout(() => { this.saveLoad.loadDataFromFindInFiles(results) }, 300);
    if (callback) callback();
    // this.saveLoad.loadDataFromFindInFiles(response, matchNode as Node)
  }

  public createMatchFromSelection(increaseSearchCount): Node {
    let selection: AceSelectionRange = this.app.codeEditor.aceEditor.getSelectionRange()
    if (!selection) return null
    if (selection.start.row === selection.end.row && selection.start.column == selection.end.column) return null

    let selectedNode = this.app.selectedNode;
    if (selectedNode === null) {
      this.app.addMessage('must select node', 'can`t create selected node without first selecting node', 3000)
      return null;
    }

    let getTextOfLines = (rowNumber) => {
      return this.app.codeEditor.aceEditor.getSession().getLine(rowNumber)
    }
    let ofFileNodeId = ChartUtils.isFileNode(selectedNode as Node) ? selectedNode.id : ChartUtils.getOfFileId(selectedNode as Node);
    let startLineText = getTextOfLines(selection.start.row);
    let startLineCounter = selection.start.row;

    let endLineNumber = (selection.end.row !== selection.start.row) ? selection.end.row : null;

    let matchId: string = CreateUtils.createId(ofFileNodeId, startLineCounter);
    let endContentLine;
    if (startLineText.indexOf('(') !== -1 || startLineText.indexOf('{') !== -1) {
      endContentLine = Utils.getEndLineOfBlock(ChartUtils.getFileNodeContent(this.chart.getItem(ofFileNodeId) as Node).split('\n'), startLineCounter);
    }
    let match: MatchInfo = {
      line: startLineText,
      value: selection.toString(),
      lineNumber: startLineCounter,
      endLineNumber: endLineNumber,
      indexInLine: selection.start.column,
      id: matchId,
      isRegex: false,
      flags: 'gi',
      endContentLine: startLineCounter + endContentLine,
      ofFile: ofFileNodeId
    };

    this.chart.addToHistory(increaseSearchCount)
    let matchItems = CreateUtils.createOrUpdateMatchNode(match, ofFileNodeId, this.chart, selectedNode as Node);
    this.chartActions.addToChartAndPosition(matchItems);
    let matchNode = matchItems.filter(i => ChartUtils.isNode(i))[0];
    return matchNode as Node;
  }


}
