///aaaa///
import {AutoComplete, CodeHighlighterModule} from 'primeng/primeng';
import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SearchActions} from './search/search.actions';
import {ChartConsts, ChartStyles, NodeColors, ChartStyle} from './chart/chart.consts';
import {StartSearchJson, TypeMapping, typesMapping} from './chart/jsons';
import {JsonPipe} from '@angular/common';
import {Network, DataSet, Node, Edge, IdType, NetworkEvents} from 'vis';
import {ChartWrapper, EventItem} from './chart/chart.wrapper';
import {ChartUtils, AttributesKey} from './chart/chart.utils';
import {ChartActions} from './chart/chart.actions';
import {Ace} from 'ace-builds';

const pathStorageKey = 'selectedPath';

export interface CurrentFile {
  content: string,
  name: string,
  lines: string[],
  node: Node | Edge
}

export interface messageBoxItem {
  title: string,
  message: string,
  displayTime: number
}

import * as $ from 'jquery';
import {CreateUtils} from './chart/create.utils';
import {SaveLoad} from './chart/save.load';
import {
  MatchInfo, SaveNode, SaveJson, CreateTypes, FindInFilesResponse, SaveNodesResponse,
  EndPoints, SearchJson, FileNode
} from './types.nodejs';
import {keyframes} from '@angular/core/src/animation/dsl';
import {PreSearchJson, specificSearchJsons, PreSeacrhJsonsUtils} from './search/search.jsons';
import {AreaSelect} from './chart/area.select';
import {Utils} from './chart/Utils';
import {CodeViewerComponent} from './code-viewer/code-viewer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [JsonPipe]
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('openfileInput') private openfileInput: AutoComplete;
  @ViewChild('aceEditor') public codeEditor: CodeViewerComponent;
  public currentLineElement = null;
  public lineEndElement = null;
  public mySpecificSearchJsons: PreSearchJson[];

  public chart: ChartWrapper = new ChartWrapper();
  public chartActions = new ChartActions(this);
  public searchActions = new SearchActions(this);
  public saveLoad = new SaveLoad(this, this.http);
  public areaSelect = new AreaSelect(this);
  public paths = [];
  public openFileVisible = false;
  public saveJsonVisible = false;
  public saveJsonFileName: string = '';
  public saveFullVisible = false;
  public showFindResults = false;
  public findResults: {
    findResults: FindInFilesResponse[], totalMatchCount: number
  } = {findResults: [], totalMatchCount: 0};

  private _searchJson: SearchJson = StartSearchJson;
  public selectedNodeSize = '';

  public shapeTypes = Object.keys(ChartStyles.nodesTypes);
  public linkTypes = Object.keys(ChartStyles.linkTypes);
  public nodesColors = NodeColors;


  public typesMapping: TypeMapping[] = null;
  public showNodeEditBox = false;

  public currentFile: CurrentFile = null;
  private messageBoxElement: HTMLElement;

  public titleElement: HTMLElement = null;

  public previousSelectedNode: Node | Edge = null;
  public previousDblClickedNode: Node | Edge = null;
  public lastDblClickedNode: Node | Edge = null;

  public _markedText: string = null;


  public layout: 'directional' | 'spread' = 'directional';
  public availableFiles: string[] = [];
  public openFileSuggestions: string[] = [];
  private loadResultsCallback: any;

  changeLayout() {
    this.layout = this.layout == 'directional' ? 'spread' : 'directional';
  }

  constructor(public http: HttpClient, private jsonPipe: JsonPipe) {
    console.log(this.shapeTypes);
    this.searchJson = StartSearchJson;
    this.typesMapping = typesMapping;
    this.mySpecificSearchJsons = specificSearchJsons;
    this._searchJson.isRegex = false;

    window['Global_app'] = this;
  }

  ngAfterViewInit(): void {
    this.chartActions.initialize();
    this.chart.initialize();
    this.searchActions.initialize();
    this.saveLoad.initialize();
    this.areaSelect.intialize();

    let resizeWindow = () => {
      document.getElementById('filer').style.height = ($(window).height() - document.getElementById('topbox').clientHeight - 40) + 'px';
    };
    resizeWindow();
    window.addEventListener('resize', () => {
      resizeWindow();
    });

    let inputCollection = document.getElementsByTagName('input');
    for (let i = 0; i < inputCollection.length; i++) {
      inputCollection[i].addEventListener('keyup', (e) => {
        e.stopPropagation();
      });
    }

    this.http.get('http://localhost:2900' + EndPoints.getPaths).subscribe((res: { paths: string[] }) => {
      let paths = res.paths;
      let storedPath: string = localStorage.getItem(pathStorageKey);
      paths.sort((i, j) => {
        if (i === storedPath) return -1; else return 0;
      });
      this.paths = paths.map(i => {
        return {label: i, value: i};
      });
      this.setSelectedPath(this.paths[0].value);
    });
  }

  public set searchJson(value: SearchJson) {
    this._searchJson = value;
  }

  public get searchJson(): SearchJson {
    return this._searchJson;
  }

  set selectedNode(element: Node | Edge) {
    this.previousSelectedNode = this.selectedNode;
    if (element == null || element === undefined) {
      this.currentFile = null;
      return;
    }

    let selectedSize = ChartUtils.getElementSize(element);
    this.selectedNodeSize = selectedSize ? (selectedSize.toString()) : '';

    let selectTextInFile = () => {
      if (ChartUtils.isNode(element)) {
        if (ChartUtils.isOfFile(element)) {
          let attributes = ChartUtils.getMatchAttributes(element) as MatchInfo;
          if (attributes.lineNumber) this.setFileSelection(attributes.lineNumber, attributes.endLineNumber ? attributes.endLineNumber : null);
        } else if (ChartUtils.isFileNode(element)) {
          this.setFileSelection(1, null);
        }
      }
    };

    // set file element
    let elementAtts = this.chart.getAttributes(element);
    if (!ChartUtils.isNode(element)) {
      return;
    }
    if (ChartUtils.isFileNode(element)) {
      this.setCurrentFile({
        content: elementAtts.fileContent,
        name: ChartUtils.getFilePath(element as FileNode),
        node: element,
        lines: elementAtts.fileContent.split('\n')
      }, selectTextInFile);
    } else {
      if (ChartUtils.isOfFile(element)) {
        let connectedToFileNode = this.chart.getNode(elementAtts.ofFile);
        let fileContent = this.chart.getAttributes(connectedToFileNode).fileContent;
        this.setCurrentFile({
          content: fileContent,
          name: ChartUtils.getFilePath(connectedToFileNode as FileNode),
          node: connectedToFileNode as Node,
          lines: fileContent.split('\n')
        }, selectTextInFile);
      } else {
        this.setCurrentFile({
          content: this.chart.getTitle(element),
          name: '',
          node: element,
          lines: this.chart.getTitle(element).split('\n')
        }, () => {
        });
      }
    }
  }

  setSelectedNodesSize(size) {
    if (parseInt('size') === NaN) return;
    this.chart.setSize(this.chart.getSelection(), parseInt(size));
  }

  setEdgePoint(left: boolean, right: boolean) {
    this.chart.setArrows(this.chart.getSelection(), left, right);
  }

  public setFileSelection(startLineNumber, endLineNumber) {
    this.codeEditor.scrollToLine(startLineNumber)
    this.codeEditor.markLines(startLineNumber, endLineNumber)
  }

  public performSearch(inputKeyEvent: any) {
    if (inputKeyEvent.code === 'Enter') {
      if (inputKeyEvent.ctrlKey) this.searchActions.searchSelectedFile();
      else if (inputKeyEvent.shiftKey) this.searchActions.contentSearch();
      else {
        this.searchActions.totalSearch();
      }
    }
  }

  public getLinesNumbersText(file: CurrentFile): string {
    if (!file) return '';
    return file.lines.map((line, index) => index).join('\r\n');
  }


  public setCurrentFile(fileObject: CurrentFile, callback: () => void) {
    if (this.currentFile !== null && this.currentFile.name === fileObject.name) {
      callback();
      return;
    }

    this.currentFile = {
      content: fileObject.content,
      name: fileObject.name,
      node: fileObject.node,
      lines: fileObject.lines
    };
    setTimeout(() => {
      callback();
    }, 0);

  }

  public clickedChart(event) {
    event.target.parentElement.focus();
  }

  public noSelectedNode() {
    console.log('no node selected');
    this.messageBoxQueue.push({title: 'no selected node', message: 'no selected node', displayTime: 10000});
  }

  public createMatchFromSelection() {
    let createdNode = this.searchActions.createMatchFromSelection(true);
    setTimeout(() => {
      this.chart.setSelectionNodes([createdNode.id]);
    }, 100);
  }

  public createFileNode() {
    let fileNode = CreateUtils.createFileNode({file: 'User Created File', matches: [], content: 'created by\r\nuser'}, this.chart);
    this.chart.addNodesAndLinks([fileNode]);
    setTimeout(() => {
      this.selectedNode = fileNode;
    }, 100);
  }

  set markedText(text) {
    text = text.trim();
    this.searchJson.pattern = text;
    this.searchJson.originalText = text;
    this._markedText = text;
  }

  get markedText() {
    return this._markedText;
  }

  private doubleClickOnNode(node: IdType, event) {
    // this.chartActions.setPathNode(this.chart.getItem(node));
    this.previousDblClickedNode = this.lastDblClickedNode;
    this.lastDblClickedNode = this.chart.getItem(node) as Node;
    this.showNodeEditBox = true;
    setTimeout(() => {
      let textInput = document.getElementById('nodeTitle') as HTMLInputElement;
      textInput.style.left = event.event.center.x + 'px';
      textInput.style.top = event.event.center.y + 'px';
      textInput.focus();
      textInput.select();
    }, 50);
  }

  get selectedNode(): Node | Edge {
    if (!this.chart) return null;
    let selectedIds = this.chart.getSelection();
    let selectedNodes = selectedIds.nodes;
    let selectedEdges = selectedIds.edges;
    if (selectedNodes.length === 1) return this.chart.nodes.get(selectedNodes[0]) as Node;
    else {
      if (selectedEdges.length === 1) return this.chart.edges.get(selectedEdges[0]) as Edge;
      else return null;
    }
  }

  ngOnInit(): void {
    this.titleElement = document.getElementById('nodeTitle') as HTMLElement;
    this.messageBoxElement = document.getElementById('message_box') as HTMLElement;
    let chartElement = document.getElementById('vis_element');

    this.chart.setUp(chartElement);
    this.chart.setClickEvent((eventItem: EventItem) => {
      this.selectedNode = eventItem.item;

      if (!this.selectedNode) this.showNodeEditBox = false;
    });
    this.chart.setDoubleClickEvent((clickedItem, event) => {
      this.doubleClickOnNode(event.nodes[0], event);
      console.log('dblclick on vla. clicked Id:', event);
      return true;
    });
    this.chart.setKeyboardDeleteEvent((e) => {
      if (e.keyCode === 46) { // delete button pressed
        this.chartActions.deleteSelected();
      }
    });
    this.chart.setDragStartEvent((eventItem: EventItem) => {
      if (eventItem.item === null) return;
      if (ChartUtils.isFileNode(eventItem.item)) {
        this.chart.setSelectionNodes(this.chart.getNeighbours(eventItem.id).nodes.concat(eventItem.id));
      }
    });
    this.chart.setDragEndEvent((eventItem: EventItem) => {
      if (eventItem.item === null) return;
      if (ChartUtils.isFileNode(eventItem.item)) {
        this.chart.setSelectionNodes([eventItem.id]);
      }
      let draggedIds = this.chart.getSelection().nodes;
      let newPositions = this.chart.chart.getPositions(draggedIds);
      let items = this.chart.getItems(draggedIds).nodes;
      let itemsWithNewPosition = items.map((i, index) => {
        return {node: i, pos: newPositions[i.id]};
      });
      this.chart.setNodesPosition(itemsWithNewPosition, true);
    });
    this.chart.setOnBeforeDrawEvent((ctx) => {

      try {
        let fileNodes = this.chart.nodes.get().filter(node => {
          return ChartUtils.isFileNode(node);
        });
        fileNodes.forEach(node => {
          ctx.save();
          let filePosition = this.chart.getPosition(node.id);
          // box
          let boundingRect = this.chart.getNeighboursBoudingBox(node.id, true);
          let rectColor = '#a9a9a9';
          let rectX = boundingRect.left - 10;
          let rectY = boundingRect.top - 10;
          let rectW = boundingRect.right - boundingRect.left + 20;
          let rectH = boundingRect.bottom - boundingRect.top + 20;

          ctx.lineWidth = 5;
          ctx.setLineDash([5]);
          ctx.strokeStyle = rectColor;
          ctx.strokeRect(rectX, rectY, rectW, rectH);
          // ctx.fillRect(rectX, rectY, rectW, rectH);

          ctx.stroke();
          let fontSize = 70;
          ctx.font = `${70}px Arial`;
          ctx.fillStyle = 'grey';
          let labelLength = node.label.length * fontSize;
          for (let i = 0; i < boundingRect.right - labelLength - 50; i += ChartConsts.FileNameDistance) {
            ctx.fillText(node.label, filePosition.x + i, filePosition.y);
          }
          ctx.stroke();
          ctx.restore();
        });
      } catch (ex) {

      }
    });
    this.chart.setBlurNodeEvent((event: any) => {
      if (1 === 1) return;
      let hoveredId = event.node;
      let nonConnectedIds = this.chart.getNotConnectedNodes(hoveredId);
      let unbluredNodes = nonConnectedIds.nodes.map(nodeId => {
        let node = this.chart.getItem(nodeId) as Node;
        if (!node['previousStyle']) return node;
        let nodePosition = this.chart.getPosition(nodeId);
        node = Object.assign({}, node['previousStyle'], nodePosition, {font: {color: 'black'}});
        node['previousStyle'] = undefined;
        return node;
      }) as Node[];
      let unbluredEdges = nonConnectedIds.edges.map(i => {
        let edge = this.chart.getItem(i) as Node;
        if (!edge['previousStyle']) return i;
        let newEdge = Utils.deepCopy(edge['previousStyle']);
        return edge['previousStyle'];
      });
      this.chart.nodes.update(unbluredNodes);
      this.chart.edges.update(unbluredEdges);
    });

    this.chart.setHoverNodeEvent((event: any) => {
      if (1 === 1) return;

      let hoveredId = event.node;
      let nonConnectedIds = this.chart.getNotConnectedNodes(hoveredId);
      let bluredNodes: Node[] = nonConnectedIds.nodes.map(nodeId => {
        let node = this.chart.getItem(nodeId) as Node;
        let previousStyle = JSON.parse(JSON.stringify(node));
        return Object.assign({id: nodeId}, ChartStyles.dimmedNode, {previousStyle: previousStyle}) as Node;
      });

      let bluredEdges = nonConnectedIds.edges.map(edgeId => {
        let edge = this.chart.getItem(edgeId) as Edge;
        let previousStyle = JSON.parse(JSON.stringify(edge));
        return Object.assign({id: edgeId}, ChartStyles.dimmedLink, {previousStyle: previousStyle});
      });

      this.chart.nodes.update(bluredNodes);
      this.chart.edges.update(bluredEdges);
    });
  }

  public codeSelectionChange(event: Ace.Selection) {
    let markedText = this.codeEditor.aceEditor.getSelectedText();
    if (markedText === undefined || markedText === null || markedText.length === 0)
      this.searchJson.isRegex = false;
  }

  public messageBoxQueue: messageBoxItem[] = [];

  public addMessage(title, message, displayTime) {
    this.messageBoxQueue.push({title: title, message: message, displayTime: displayTime});
    this.messageBoxElement.style.visibility = 'visible';
    setTimeout(() => {
      this.displayNextMessage();
    }, displayTime);
  }

  public displayNextMessage() {
    this.messageBoxQueue.shift();
    if (this.messageBoxQueue.length === 0) {
      this.messageBoxElement.style.visibility = 'hidden';
    } else {
      console.log(this.messageBoxQueue[0].displayTime);
      setTimeout(() => {
        this.displayNextMessage();
      }, this.messageBoxQueue[0].displayTime);
    }
  }

  public clearChart() {
    this.currentFile = null;
    this.chartActions.clearChart();
  }

  public createShape(shapeType: string) {
    this.selectedNode = this.chartActions.createShape(this.selectedNode, shapeType);
  }

  public setTitle(event: Event) {
    event.stopPropagation();
    if (!this.selectedNode) return;
    this.chartActions.setNodeTitle(this.selectedNode as Node, (event.target as HTMLTextAreaElement).value);
  }

  public setSelecteionColor(color) {
    this.chart.setColor(this.chartActions.getSelectedLinksOrNodesOnly(), color);
  }

  public undo() {
    this.chartActions.undo();
  }

  public linkNodes(linkStyle) {
    let linkedNodesIds = this.chart.getSelection().nodes;
    // linkedNodesIds.map(id => this.chart.getItem(id)).forEach(node => this.chartActions.setPathNode(node));
    let linkedToNode = linkedNodesIds.pop();
    let newLinks = [];
    linkedNodesIds.forEach(nodeId => {
      newLinks.push(this.chart.createLink(nodeId, linkedToNode, Object.assign(linkStyle, {arrows: {to: true}}), {idPrefix: 'userLink'}));
    });
    this.chartActions.addToChartAndPosition(newLinks);
  }

  public reload() {
    this.chart.setSelectionNodes([]);
    this.saveLoad.reload();
  }

  public clearVisiIds() {
    this.http.post('http://localhost:2900' + EndPoints.clearVisiIds, {path: this.searchJson.dirPath}).subscribe((response) => {
      console.log('clear visi ids response', response);
    });
  }

  public rewriteVisiIds() {
    this.http.post('http://localhost:2900' + EndPoints.rewriteVisiIds, {}).subscribe((response) => {
      console.log('rewrite visi ids response', response);
    });
  }

  public fullSaveToFile() {
    this.saveLoad.fullSaveToFile(this.saveJsonFileName);
  }

  public jsonSave() {
    this.saveLoad.saveChartToJson(this.saveJsonFileName);
  }

  public loadFromFile(event) {
    let file = event.srcElement.files[0];
    if (file) {
      let reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (evt) => {
        let loaded: { nodes: Node[], edges: Edge[] } = (JSON.parse(evt.target['result']));
        this.saveLoad.load(loaded);
      };
      reader.onerror = (evt) => {
        console.log('error reading file');
      };
      (document.getElementById('fileLoadInput') as HTMLInputElement).value = '';
    }
  }

  public performSavedSearch(search: PreSearchJson) {
    this.searchJson.pattern = PreSeacrhJsonsUtils.getSearchStringFromText(this.searchJson.pattern, search.regex);
    this.searchJson.isRegex = true;
    console.log(search);
  }

  pathDropdownClick(event: Event) {
    event.stopPropagation();
  }

  setSelectedPath(pathValue: string) {
    this.searchJson.dirPath = pathValue;
    localStorage.setItem(pathStorageKey, pathValue);
    this.http.post('http://localhost:2900' + EndPoints.getAllFilesInPath, {folder: pathValue}).subscribe((res: { files: string[] }) => {
      this.availableFiles = res.files;
    });
  }

  private regexs = [
    {'remark': 'add /s as regex option so . catptures new line as well'},
    {
      'title': 'get all functions location',
      'regex': '(public|private) (.+)\(.+\).*{'
    },
    {
      'title': 'get specific function location',
      'regex': '(public|private)\s*(__functionName___)\(.+\).*{',
      'example': '(public|private)\s*(isIdNode)\(.+\).*{'
    },
    {
      'title': 'get specific function content',
      'regex': '(public|private)\s*(__functionName___)\(.+\).*{',
      'example': '(public|private)\s*(isIdNode)\(.+\).*{'
    }

  ];
  allMatchesSelected: boolean = false;

  public filterAvailableFiles(value) {
    this.openFileSuggestions = this.availableFiles
      .filter(i => i.toLowerCase().indexOf(value.toLowerCase()) !== -1)
      .sort((a, b) => {
        const split = value.split('.');
        if (split.length > 1) {
          const filename = split[split.length - 1];
          if (filename.startsWith(value)) return 1;
          else return -1;
        } else return 0;
      });
  }

  openFile(fullPath: any) {
    let selection = Utils.deepCopy(this.chart.getSelection());
    this.chart.chart.setSelection({nodes: [], edges: []});
    this.searchActions.doSearch({
      dirPath: this.searchJson.dirPath,
      searchPath: fullPath.substring(this.searchJson.dirPath.length),
      filenamePattern: null,
      isFileNameRegex: false,
      isRegex: false,
      flags: 'gi',
      originalText: '',
      pattern: '',
      title: null
    }, () => {
      this.chart.setSelection(selection);
    });

  }

  focusOnFileOpenInput() {
    setTimeout(() => {
      this.openfileInput.focusInput();
    }, 0);
  }

  setCustomPath(event: KeyboardEvent) {
    if (event.keyCode == 13) {
      this.setSelectedPath((event.srcElement as HTMLInputElement).value);
    }
  }

  selectfileMatches(value, fileResults: FindInFilesResponse) {
    fileResults.selectedByUser = value;
    fileResults.matches = fileResults.matches.map(i => {
      i.selectedByUser = value;
      return i;
    });
  }

  selectMatch(value, match: MatchInfo, fileResults: FindInFilesResponse) {
    match.selectedByUser = value;
    if (fileResults.matches.filter(i => i.selectedByUser).length === 0) fileResults.selectedByUser = false;
    else fileResults.selectedByUser = true;
  }

  loadFindResults() {
    this.findResults.findResults = this.findResults.findResults.map((file) => {
      if (!file.selectedByUser) return null;
      file.matches = file.matches.filter(j => j.selectedByUser);
      return file;
    }).filter(file => file);

    this.searchActions.displaySearchResults(this.findResults.findResults, this.loadResultsCallback);
  }

  showFindResultsDialog(response: FindInFilesResponse[], callback) {
    this.loadResultsCallback = callback;
    this.findResults.findResults = response;
    this.setAllMatchesSelected(true);
    this.findResults.totalMatchCount = response.reduce((i, j) => {
      return i + j.matches.length;
    }, 0);
    this.allMatchesSelected = true;
    this.showFindResults = true;
  }

  setAllMatchesSelected(isSelected) {
    this.findResults.findResults = this.findResults.findResults.map(i => {
      i.selectedByUser = isSelected;
      i.matches = i.matches.map(j => {
        j.selectedByUser = isSelected;
        return j;
      });
      return i;
    });
    this.allMatchesSelected = isSelected;

  }

  toggleSelectAllMatches() {
    let newValue = !this.allMatchesSelected;
    this.allMatchesSelected = newValue;
    this.setAllMatchesSelected(newValue);
  }
}

