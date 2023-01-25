import { catchError, map } from "rxjs/operators";
import { AppComponent, Options } from '../app.component'
import { Node, Edge } from 'vis';
import { ChartWrapper } from '../chart/chart.wrapper';
import { ChartActions } from '../chart/chart.actions';
import { ChartUtils } from '../chart/chart.utils';

import { CcItemStyles } from '../chart/chart.consts';
import { CreateUtils } from '../chart/create.utils';
import { MatchInfo, FindInFilesResponse, EndPoints, SearchObject, FileNode } from '../types.nodejs';
import { SaveLoad } from '../chart/save.load';
import { Utils } from '../chart/Utils';
import { Ace } from 'ace-builds';
import { AceSelectionRange } from '../code-viewer/code-viewer.component';
import { Env } from '../utils/Env';

export class SearchActions {
  http: any;
  private chart: ChartWrapper;
  private chartActions: ChartActions;
  private saveLoad: SaveLoad;

  constructor(private app: AppComponent) {
  }

  initialize() {
    this.chart = this.app.chart;
    this.chartActions = this.app.chartActions;
    this.saveLoad = this.app.saveLoad;
    this.http = this.app.http
  }

  public searchSelectedFile() {
    if (!this.app.currentFile) {
      console.log('no file selected')
      return
    }
    let fileNode = this.app.currentFile.node;

    this.app.setPatternRegex()
    this.doSearch(Object.assign({}, this.app.searchObject, { searchPath: ChartUtils.getFilePath(fileNode) }));
  }

  public contentSearch() {
    if (this.app.searchObject.pattern === '') return;
    this.chartActions.setSelectedAsPath();
    let content = this.chartActions.getNodeContent(this.app.selectedNode);
    let contentLines = content.content.split('\n');
    let results: Array<Edge | Node> = [];
    let regex = new RegExp(this.app.searchObject.pattern, this.app.searchObject.flags);
    contentLines.forEach((line, index) => {
      if (!line.match(regex)) return
      let lineNumber = index + content.startIndex
      let matchInfo: MatchInfo = {
        line: line,
        value: line,
        lineNumber: lineNumber,
        indexInLine: 0,
        id: CreateUtils.createId(ChartUtils.getOfFileId(this.app.selectedNode as Node), lineNumber),
        isRegex: this.app.searchObject.isRegex,
        flags: this.app.searchObject.flags,
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
    this.chartActions.addToChartAndPosition(results);

  }

  public totalSearch() {
    // this.chartActions.setSelectedAsPath()
    this.app.setPatternRegex()
    this.doSearch(this.app.searchObject);
  }

  public doSearch(searchJson: SearchObject, callback?) {
    if (!searchJson.folderPath || searchJson.folderPath === {}) {
      this.app.addMessage('no path defined', 'no path defined, try selecting another path then reselect current path ', 5000);
      return
    }
    console.log('search: ', searchJson);
    this.http.post(Env.getApiEndpoint() + EndPoints.find, searchJson).pipe(
        map((i: FindInFilesResponse[])=>
          i.map(i=>Object.assign(i, {gitUrl: this.app.searchObject.folderPath.gitUrl}))
        )
      ).subscribe(
      (response: FindInFilesResponse[]) => {
        if(!response.length) {
          this.app.addMessage("No results found", "no results found in folder " + searchJson.folderPath.folder, -1)
          return

        }

        let areFilesSynched = true
        this.chart.getAllFileNodes().forEach((fileNode: FileNode)=>{
          let correspondingFile = response.find((responseFile)=>{
            const projectFolder = searchJson.folderPath.folder.replace(/[/\\]/g, "")
            const fileNodePath = fileNode.d.path.replace(/[/\\]/g, "")
            const responseFilePath = responseFile.file.replace(/[/\\]/g, "")
            return (responseFilePath == projectFolder + fileNodePath)
          })
          if(correspondingFile && correspondingFile.content !== fileNode.d.fileContent) {
            areFilesSynched = false
            return;
          }
        })

        if(!areFilesSynched) {
          this.app.addMessage("Cannot perform search", "Seems that some of the files on disk are not identical to those in diagram. " +
            "\nPlease synch your diagram.\n Use menu => synch", -1)
          return
        }

        let matchCount = response.reduce((i, j) => {
          return i + j.matches.length;
        }, 0);
        if(matchCount<Options.minResultsCountToShowResults) this.loadResults(response, null, true)
        else this.app.showFindResultsDialog(response, callback)
      },
      (error) => this.app.addMessage('ERROR:' + error.message, error.error.message, 4000)
    );
  }

  public addMatchFromFile(searchObject: SearchObject, filePath, lineNumbers) {
    this.doSearch({
      folderPath: searchObject.folderPath,
      searchPath: filePath,
      filenamePattern: null,
      isFileNameRegex: false,
      isRegex: false,
      flags: 'gi',
      originalText: '',
      pattern: '',
      title: null,
      lineNumbers: lineNumbers
    })
  }

  public openFile(searchObject: SearchObject, filePath, callback?: (any)=>any) {
    this.doSearch({
      folderPath: searchObject.folderPath,
      searchPath: filePath,
      filenamePattern: null,
      isFileNameRegex: false,
      isRegex: false,
      flags: 'gi',
      originalText: '',
      pattern: '',
      title: null,
      lineNumbers: null
    }, callback)

  }




  public displaySearchResults(results: FindInFilesResponse[], callback) {
    Utils.addIfNotExist(this.app.currentDiagramDetails.projectList, this.app.searchObject.folderPath)

    if(!this.app.ideConnect.isInIde()) {
      let selectionNode = this.createMatchFromSelection(false)
      if (selectionNode !== null) {
        selectionNode = Utils.deepMerge(selectionNode, CcItemStyles.searchNode)
        this.chart.addNodesAndLinks([selectionNode], true)
        this.chart.setSelectionNodes([selectionNode.id])
      }
    }
    setTimeout(() => { this.saveLoad.loadDataFromFindInFiles(results) }, 300);
    if (callback) callback();
    // this.saveLoad.loadDataFromFindInFiles(response, matchNode as Node)
  }

  loadResults(findResults: FindInFilesResponse[], loadResultsCallback, loadAll = false) {
    this.displaySearchResults(findResults, loadResultsCallback);
  }


  public createMatchFromSelection(increaseSearchCount, replaceSelected = false): Node {
    let selection: AceSelectionRange = this.app.codeEditor.aceEditor.getSelectionRange()
    let codeEditor = this.app.codeEditor

    if (!selection) return null
    // if (selection.start.row === selection.end.row && selection.start.column === selection.end.column) return null

    let selectedNode = this.app.selectedNode as Node;
    if (selectedNode === null) {
      this.app.addMessage('must select node', 'can`t create selected node without first selecting node', 3000)
      return null;
    }

    let getTextOfLines = (rowNumber) => {
      return this.app.codeEditor.aceEditor.getSession().getLine(rowNumber)
    }
    let ofFileNodeId = codeEditor.fileData.node.id;
    let startLineText = getTextOfLines(selection.start.row);
    let startLineCounter = selection.start.row;

    let endLineNumber = (selection.end.row !== selection.start.row) ? selection.end.row : null;

    let fileFullPath = codeEditor.fileDisplayInfo.folder + '//' + codeEditor.fileDisplayInfo.file
    let matchId: string = !replaceSelected ? CreateUtils.createId(fileFullPath, startLineCounter) : selectedNode.id.toString();
    let endContentLine = Utils.getEndLineOfBlock(codeEditor.fileData.lines, startLineCounter);
    let match: MatchInfo = {
      line: startLineText,
      value: this.app.codeEditor.aceEditor.getSelectedText(),
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
    if (!replaceSelected) {
      let matchItems = CreateUtils.createOrUpdateMatchNode(match, ofFileNodeId, this.chart, selectedNode as Node);
      this.chartActions.addToChartAndPosition(matchItems);
      let matchNode = matchItems.filter(i => ChartUtils.isNode(i))[0];
      return matchNode as Node;
    } else {
      let propsToKeep: { label?, image?, d?: { wasEdited?} } = {}
      if (ChartUtils.isWasEdited(selectedNode)) {
        propsToKeep.label = selectedNode.label
        propsToKeep.d = { wasEdited: true }
      }
      if (selectedNode.image) propsToKeep.image = selectedNode.image
      let matchNode = CreateUtils.createMatchNode(match, ofFileNodeId, this.chart)
      matchNode = Utils.deepMerge(matchNode, propsToKeep)
      this.chart.nodes.update(matchNode)
    }
  }


}
