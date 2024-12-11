import { map } from 'rxjs/operators'
import { AppComponent, ProjectPath, Options } from '../app.component'
import { Edge, Node } from 'vis'
import { ChartWrapper } from '../chart/chart.wrapper'
import { ChartActions } from '../chart/chart.actions'
import { ChartUtils } from '../chart/chart.utils'

import { CcItemStyles } from '../chart/chart.consts'
import { CreateUtils } from '../chart/create.utils'
import {
  EndPoints, FileId,
  FileNode,
  FindInFilesResponse, FindInFilesResponseUI,
  MatchInfo, MatchInfoResponse,
  SearchEnum,
  SearchObject,
  SearchRequest,
} from '../types.nodejs'
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
        id: CreateUtils.createMatchId(ChartUtils.getOfFileId(this.app.selectedNode as Node), lineNumber, null),
        isRegex: this.searchManagement.searchObject.isRegex,
        flags: this.searchManagement.searchObject.flags,
        ofFile: ChartUtils.getOfFileId(this.app.selectedNode as Node)
      };
      let matchItems = CreateUtils.createOrUpdateMatchNode(
        matchInfo,
        this.chart.getProperty(this.app.selectedNode, 'ofFile'),
        this.chart,
        this.app.selectedNode as Node,
        this.app.searchManagement.getSelectedProject()
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

  private processSearchResponse(response: FindInFilesResponse[], gitUrl): FindInFilesResponseUI[] {
    return response.map((fileResponse): FindInFilesResponseUI => {
      const projectPath: ProjectPath = this.searchManagement.getSelectedProject()
      let relativePath = fileResponse.fullLocalPath.substring(projectPath.rootPath.length)
      let fileId: FileId = CreateUtils.createFileId(relativePath, projectPath.gitUrl)

    const fileResponseUI: FindInFilesResponseUI = Utils.deepMerge(fileResponse, {
        matches: fileResponse.matches.map((match: MatchInfoResponse): MatchInfo => Object.assign(match, {
          selectedByUser: false,
          id: CreateUtils.createMatchId(fileId, match.lineNumber, match.endLineNumber),
          ofFile: Utils.deepCopy(fileId)
        })),
        selectedByUser: false,
        fileId: fileId
      })
      return fileResponseUI
    })
  }

  public async doSearch(searchObject: SearchObject, searchType: SearchEnum, callback?) {
    if (!searchObject.projectPath || searchObject.projectPath === {}) {
      this.app.addMessage('no path defined', 'no path defined, try selecting another path then reselect current path ', 5000);
      return
    }
    let searchRequest: SearchRequest = {
      searchObject: searchObject,
      searchType: searchType
    }
    await this.http.post(Env.getApiEndpoint() + EndPoints.find, searchRequest).pipe(
        map((i: FindInFilesResponse[]): FindInFilesResponseUI[] => {
          return this.processSearchResponse(i, this.searchManagement.searchObject.projectPath.gitUrl)
        })
      ).toPromise()
      .then((response: FindInFilesResponseUI[]) => {
        console.log('search respnose: ', response);
        if(!response.length) {
          this.app.addMessage("No results found", "no results found in folder " + searchObject.projectPath.localPath, -1)
          return

        }
        if(!this.checkChartSynchedWithResponse(response, searchObject)) {
            this.app.addMessage('Cannot perform search', 'Seems that some of the files on disk are not identical to those in diagram. ' +
              '\nPlease synch your diagram.\n Use menu => synch', -1)
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

  private checkChartSynchedWithResponse(response: FindInFilesResponseUI[], searchJson: SearchObject): Boolean {
    let areFilesSynched = true
    this.chart.getAllFileNodes().forEach((fileNode: FileNode) => {
      let correspondingFile = response.find((responseFile) => {
        return ChartUtils.isSameFileId(responseFile.fileId, fileNode.d.fileId)
      })
      if (correspondingFile && correspondingFile.content !== fileNode.d.fileContent) {
        areFilesSynched = false
        return
      }
    })

    return areFilesSynched
  }

  public addMatchFromFile(folderPath: ProjectPath, filePath, lineNumbers) {
    this.doSearch({
      projectPath: folderPath,
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
      projectPath: searchObject.projectPath,
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

  public createMatchInfo(line: string, lineNumber: number, ofFile: FileId): MatchInfo {
    return {
      line: line,
      value: line,
      lineNumber: lineNumber,
      indexInLine: 0,
      id: CreateUtils.createMatchId(ofFile, lineNumber, null),
      isRegex: this.searchManagement.searchObject.isRegex,
      flags: this.searchManagement.searchObject.flags,
      ofFile: ofFile
    };
  }

  public displaySearchResults(results: FindInFilesResponseUI[], callback) {
    Utils.addIfNotExist(this.app.currentDiagramDetails.projectList, this.searchManagement.searchObject.projectPath)

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

  loadResults(findResults: FindInFilesResponseUI[], loadResultsCallback, loadAll = false) {
    this.displaySearchResults(findResults, loadResultsCallback);
  }

  private extractMatchInfoFromSelection(selection: AceSelectionRange, codeEditor, selectedNode: Node): MatchInfo {
    let getTextOfLines = (rowNumber) => {
      return codeEditor.aceEditor.getSession().getLine(rowNumber);
    }
    let ofFileNodeId = codeEditor.fileData.node.d.fileId;
    let startLineText = getTextOfLines(selection.start.row);
    let startLineCounter = selection.start.row;
    let endLineNumber = (selection.end.row !== selection.start.row) ? selection.end.row : null;
    let endContentLine = Utils.getEndLineOfBlock(codeEditor.fileData.lines, startLineCounter);

    return {
      line: startLineText,
      value: codeEditor.aceEditor.getSelectedText(),
      lineNumber: startLineCounter,
      endLineNumber: endLineNumber,
      indexInLine: selection.start.column,
      id: CreateUtils.createMatchId(ofFileNodeId, startLineCounter, endLineNumber),
      isRegex: false,
      flags: 'gi',
      endContentLine: startLineCounter + endContentLine,
      ofFile: ofFileNodeId
    };
  }

  public createMatchNode(match: MatchInfo, selectedNode: Node, replaceSelected: boolean): Node {
    this.chart.addToHistory(true);
    if (!replaceSelected) {
      let matchItems = CreateUtils.createOrUpdateMatchNode(match, match.ofFile, this.chart, selectedNode, this.app.searchManagement.getSelectedProject());
      this.chartActions.addToChartAndPosition(matchItems);
      return matchItems.filter(i => ChartUtils.isNode(i))[0] as Node;
    } else {
      let propsToKeep: { label?, image?, d?: { wasEdited?} } = {};
      if (ChartUtils.isWasEdited(selectedNode)) {
        propsToKeep.label = selectedNode.label;
        propsToKeep.d = { wasEdited: true };
      }
      if (selectedNode.image) propsToKeep.image = selectedNode.image;
      let matchNode = CreateUtils.createMatchNode(match, match.ofFile, this.chart);
      matchNode = Utils.deepMerge(matchNode, propsToKeep);
      matchNode.id = selectedNode.id;
      this.chart.nodes.update(matchNode);
      return matchNode;
    }
  }

  public createMatchFromSelection(increaseSearchCount, replaceSelected = false): Node {
    let selection: AceSelectionRange = this.app.codeEditor.aceEditor.getSelectionRange();
    if (selection.start.row === 0 && selection.start.column === 0 &&
      selection.end.row === 0 && selection.end.column === 0) return null;
    let codeEditor = this.app.codeEditor;
    if (!selection) return null;
    let selectedNode = this.app.selectedNode as Node;
    if (selectedNode === null) {
      this.app.addMessage('must select node', 'can`t create selected node without first selecting node', 3000);
      return null;
    }
    let matchInfo = this.extractMatchInfoFromSelection(selection, codeEditor, selectedNode);
    return this.createMatchNode(matchInfo, selectedNode, replaceSelected);
  }

}
