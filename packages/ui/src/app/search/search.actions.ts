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
  VisiNode,
} from '../types.nodejs'
import { SaveLoad } from '../chart/save.load'
import { Utils } from '../chart/Utils'
import { AceSelectionRange } from '../code-viewer/code-viewer.component'
import { Env } from '../utils/Env'
import { SearchManagement } from '../SearchManagement'
import { HttpClient } from '@angular/common/http'
import { getEndLineOfBlock } from '../utils/codeblock.utils';



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
    this.searchFile(ChartUtils.getFilePath(fileNode), this.searchManagement.searchObject.pattern);
  }

  public searchFile(filePath: string, searchPattern: string, callback?, skipNoResultsMessage: boolean = false): Promise<Node[]> {
    this.app.setPatternRegex();
    return this.doSearch(Object.assign({}, this.searchManagement.searchObject, { searchPath: filePath, pattern: searchPattern }), SearchEnum.searchInFile, callback, skipNoResultsMessage);
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

  public async doSearch(searchObject: SearchObject, searchType: SearchEnum, callback?, skipNoResultsMessage: boolean = false): Promise<Node[]> {
    if (!searchObject.projectPath || searchObject.projectPath === {}) {
      this.app.addMessage('no path defined', 'no path defined, try selecting another path then reselect current path ', 5000);
      return Promise.resolve([]);
    }

    let searchRequest: SearchRequest = {
      searchObject: searchObject,
      searchType: searchType
    }

    try {
      const response: FindInFilesResponseUI[] = await this.http.post(Env.getApiEndpoint() + EndPoints.find, searchRequest)
        .pipe(
          map((i: FindInFilesResponse[]): FindInFilesResponseUI[] => {
            return this.processSearchResponse(i, this.searchManagement.searchObject.projectPath.gitUrl)
          })
        ).toPromise();

      console.log('search response: ', response);
      if (!response.length) {
        // Only show the message if we're not skipping it
        if (!skipNoResultsMessage) {
          this.app.addMessage("No results found", `no results found for ${searchObject.pattern} in folder ${searchObject.projectPath.localPath}`, 3000)
        }
        return Promise.resolve([]);
      }

      if (!this.checkChartSynchedWithResponse(response, searchObject)) {
        this.app.addMessage('Cannot perform search', 'Seems that some of the files on disk are not identical to those in diagram. ' +
          '\nPlease synch your diagram.\n Use menu => synch', -1)
        return Promise.resolve([]);
    }

      let matchCount = response.reduce((i, j) => i + j.matches.length, 0);
      if (matchCount < Options.minResultsCountToShowResults) {
        return this.loadResults(response, null, true);
      } else {
        this.app.showFindResultsDialog(response, callback);
        return Promise.resolve([]); // No nodes created yet since showing dialog
      }
    } catch (error) {
      if (!error.error) this.app.addMessage('ERROR:' + error, error, 4000)
      else this.app.addMessage('ERROR:' + error.message, error.error.message, 4000)
      return Promise.resolve([]);
    }
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

  public searchLineInFile(filePath: string, lineNumber: number, callback?, skipNoResultsMessage: boolean = false): Promise<Node[]> {
    return this.addMatchFromFile(this.searchManagement.searchObject.projectPath, filePath, [lineNumber], callback, skipNoResultsMessage)
  }

  public addMatchFromFile(projectPath: ProjectPath, filePath, lineNumbers, callback?, skipNoResultsMessage: boolean = false) {
    return this.doSearch({
      projectPath: projectPath,
      searchPath: filePath,
      filenamePattern: null,
      isFileNameRegex: false,
      isRegex: false,
      flags: 'gi',
      originalText: '',
      pattern: '',
      title: null,
      lineNumbers: lineNumbers
    }, SearchEnum.getLinesFromFile, callback, skipNoResultsMessage)
  }

  public openFile(searchObject: SearchObject, filePath, callback?: (any) => any) {
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
    let selectionNode: VisiNode = null

    if (!this.app.ideConnect.getIsInIde()) {
      selectionNode = this.createMatchFromSelection(false) as VisiNode
      if (selectionNode !== null) {
        selectionNode = Utils.deepMerge(selectionNode, CcItemStyles.searchNode)
        this.chart.addNodesAndLinks([selectionNode], true)
        this.chart.setSelectionNodes([selectionNode.id])
      }
    }
    return new Promise<Node[]>((resolve) => {
      setTimeout(() => {
        const nodes = this.saveLoad.loadDataFromFindInFiles(results);
        if (callback) callback();
        resolve(selectionNode ? [selectionNode, ...nodes] : nodes);
      }, 300);
    })
  }

  loadResults(findResults: FindInFilesResponseUI[], loadResultsCallback, loadAll = false) {
    return this.displaySearchResults(findResults, loadResultsCallback);
  }

  private extractMatchInfoFromSelection(selection: AceSelectionRange, codeEditor, selectedNode: Node): MatchInfo {
    let getTextOfLines = (rowNumber) => {
      return codeEditor.aceEditor.getSession().getLine(rowNumber);
    }
    let ofFileNodeId = codeEditor.fileData.node.d.fileId;
    let startLineText = getTextOfLines(selection.start.row);
    let startLineCounter = selection.start.row;
    let endLineNumber = (selection.end.row !== selection.start.row) ? selection.end.row : null;
    let endContentLine = getEndLineOfBlock(codeEditor.fileData.lines, startLineCounter);

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

  public createMatchNode(match: MatchInfo, selectedNode: VisiNode, replaceSelected: boolean): VisiNode {
    this.chart.addToHistory(true);
    if (!replaceSelected) {
      let matchItems = CreateUtils.createOrUpdateMatchNode(match, match.ofFile, this.chart, selectedNode, this.app.searchManagement.getSelectedProject());
      this.chartActions.addToChartAndPosition(matchItems);
      return matchItems.filter(i => ChartUtils.isNode(i))[0] as VisiNode;
    } else {
      let propsToKeep: { label?, image?, d?: { wasEdited?} } = {};
      if (selectedNode.d.isWasEdited) {
        propsToKeep.label = selectedNode.label;
        propsToKeep.d = { wasEdited: true };
      }
      if (selectedNode.image) propsToKeep.image = selectedNode.image;
      let matchNode = CreateUtils.createMatchNode(match, match.ofFile, this.chart);
      matchNode = Utils.deepMerge(matchNode, propsToKeep);
      matchNode.id = selectedNode.id;
      this.chart.nodes.update(matchNode);
      return matchNode as VisiNode;
    }
  }

  public createMatchFromSelection(increaseSearchCount, replaceSelected = false): VisiNode {
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
    return this.createMatchNode(matchInfo, selectedNode as VisiNode, replaceSelected);
  }

  public createMatchFromLlmJson(json: string) {
    try {
      const items = this.app.llmJsonActions.parseLlmJson(json)
      // When processing LLM JSON, we want to skip showing "no results" messages
      this.app.llmJsonActions.processAllItems(items, this.searchManagement.searchObject.projectPath)
    } catch (e) {
      this.app.addMessage('Invalid LLM JSON',
        'If you`ve tried inserting LLM JSON, there is a problem:\n' + e.message, 4000);
      return null;
    }


  }
}
