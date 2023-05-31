import { map } from 'rxjs/operators'
import { AppComponent, ProjectPath, Options } from '../app.component'
import { Edge, Node } from 'vis'
import { ChartWrapper } from '../chart/chart.wrapper'
import { ChartActions } from '../chart/chart.actions'
import { ChartUtils } from '../chart/chart.utils'

import { CcItemStyles } from '../chart/chart.consts'
import { CreateUtils } from '../chart/create.utils'
import { EndPoints, FileNode, FindInFilesResponse, MatchInfo, SearchEnum, SearchObject } from '../types.nodejs'
import { SaveLoad } from '../chart/save.load'
import { Utils } from '../chart/Utils'
import { AceSelectionRange } from '../code-viewer/code-viewer.component'
import { Env } from '../utils/Env'
import { SearchManagement } from '../SearchManagement'
import { HttpClient } from '@angular/common/http'

export class SearchActions {
  searchManagement: SearchManagement;
  http: HttpClient;
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
    this.searchManagement = this.app.searchManagement
  }

  public searchSelectedFile() {
    if (!this.app.currentFile) {
      console.log('no file selected')
      return
    }
    let fileNode = this.app.currentFile.node;

    this.app.setPatternRegex()
    this.doSearch(Object.assign({}, this.searchManagement.searchObject, { searchPath: ChartUtils.getFilePath(fileNode) }), SearchEnum.searchInFile);
  }

  public contentSearch() {
    if (this.searchManagement.searchObject.pattern === '') return;
    this.chartActions.setSelectedAsPath();
    let content = this.chartActions.getNodeContent(this.app.selectedNode);
    let contentLines = content.content.split('\n');
    let results: Array<Edge | Node> = [];
    let regex = new RegExp(this.searchManagement.searchObject.pattern, this.searchManagement.searchObject.flags);
    contentLines.forEach((line, index) => {
      if (!line.match(regex)) return
      let lineNumber = index + content.startIndex
      let matchInfo: MatchInfo = {
        line: line,
        value: line,
        lineNumber: lineNumber,
        indexInLine: 0,
        id: CreateUtils.createId(ChartUtils.getOfFileId(this.app.selectedNode as Node), lineNumber),
        isRegex: this.searchManagement.searchObject.isRegex,
        flags: this.searchManagement.searchObject.flags,
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
    this.doSearch(this.searchManagement.searchObject, SearchEnum.searchInFolder);
  }

  public async doSearch(searchJson: SearchObject, searchType: SearchEnum, callback?) {
    if (!searchJson.folderPath || searchJson.folderPath === {}) {
      this.app.addMessage('no path defined', 'no path defined, try selecting another path then reselect current path ', 5000);
      return
    }
    let searchRequest = Object.assign({}, searchJson, {searchType: searchType})
    await this.http.post(Env.getApiEndpoint() + EndPoints.find, searchRequest).pipe(
        map((i: FindInFilesResponse[])=>
          i.map(i=>Object.assign(i, {gitUrl: this.searchManagement.searchObject.folderPath.gitUrl}))
        )
      ).toPromise()
      .then((response: FindInFilesResponse[]) => {
        console.log('search respnose: ', response);
        if(!response.length) {
          this.app.addMessage("No results found", "no results found in folder " + searchJson.folderPath.projectPath, -1)
          return

        }

        let areFilesSynched = true
        this.chart.getAllFileNodes().forEach((fileNode: FileNode)=>{
          let correspondingFile = response.find((responseFile)=>{
            const projectFolder = searchJson.folderPath.projectPath.replace(/[/\\]/g, "")
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
      })
      .catch((error) => {
        if(!error.error) this.app.addMessage('ERROR:' + error, error, 4000)
        else this.app.addMessage('ERROR:' + error.message, error.error.message, 4000)
      });
  }

  public addMatchFromFile(folderPath: ProjectPath, filePath, lineNumbers) {
    this.doSearch({
      folderPath: folderPath,
      searchPath: filePath,
      filenamePattern: null,
      isFileNameRegex: false,
      isRegex: false,
      flags: 'gi',
      originalText: '',
      pattern: '',
      title: null,
      lineNumbers: lineNumbers
    }, SearchEnum.getLinesFromFile)
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
    }, SearchEnum.openFile, callback)

  }




  public displaySearchResults(results: FindInFilesResponse[], callback) {
    Utils.addIfNotExist(this.app.currentDiagramDetails.projectList, this.searchManagement.searchObject.folderPath)

    if(!this.app.ideConnect.getIsInIde()) {
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
    // TODO: this is an ugly bug fix. when you make a search from search top bar, you get a fake "match result" of position 0, 0
    if(selection.start.row===0 && selection.start.column===0 &&
      selection.end.row===0 && selection.end.column===0) return null
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
