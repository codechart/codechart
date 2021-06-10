///aaaa///
import {AutoComplete, DataTableModule} from 'primeng/primeng';
import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SearchActions} from './search/search.actions';
import {
  ChartConsts,
  ChartStyles,
} from './chart/chart.consts';
import {StartSearchJson, TypeMapping, typesMapping} from './chart/jsons';
import {JsonPipe} from '@angular/common';
import {Network, DataSet, Node, Edge, IdType, NetworkEvents, Color} from 'vis';
import {ChartUtils, AttributesKey} from './chart/chart.utils';
import {ChartActions, PositioningOptions} from './chart/chart.actions';
import {Ace} from 'ace-builds';

export interface CcShape {
  name: string,
  details: { tooltip, node, link, class }
}

const pathStorageKey = 'selectedPath';

export interface CurrentFile {
  content: string,
  name: string,
  lines: string[],
  node: Node
}

export interface messageBoxItem {
  title: string,
  message: string,
  displayTime: number
}

export interface fileLegendItem {
  color,
  fileNodeId,
  fileLabel
}

import * as $ from 'jquery';
import {CreateUtils} from './chart/create.utils';
import {SaveLoad} from './chart/save.load';
import {
  MatchInfo, SaveNode, SaveJson, CreateTypes, FindInFilesResponse, SaveNodesResponse,
  EndPoints, SearchObject, FileNode
} from './types.nodejs';
import {keyframes} from '@angular/core/src/animation/dsl';
import {SearchOptions, PreSeacrhJsonsUtils, Languages} from './search/search.jsons';
import {AreaSelect} from './chart/area.select';
import {Utils} from './chart/Utils';
import {CodeViewerComponent} from './code-viewer/code-viewer.component';
import {ChartStylingUtils} from './chart/chart.styling';
import {AppInterceptorsService} from './services/AppInterceptorService';
import {CreateDiagramDto, QueryDto, ResultDiagramUI, SaveLoadService} from './services/SaveLoadService';
import {ChartWrapper, EventItem} from './chart/chart.wrapper';
import {Env} from './utils/Env';
import {PrettifyPipe} from './pipes/prettify';

export const Options = {
  printFileNames: false,
  fillFileRect: false,
  drawFileRect: true,
  positioning: PositioningOptions.DOWN,
  showFileLegend: true,
  showCodeLabels: false,
  replaceClickedWithSelection: false,
  keepChartOnLoadFromJson: false,
  showInContentLines: false
};

export interface SelectedDiagramInfo extends QueryDto {
  id: number
  projectList: string[]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [JsonPipe, PrettifyPipe]
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('openfileInput') private openfileInput: AutoComplete;
  @ViewChild('aceEditor') public codeEditor: CodeViewerComponent;
  @ViewChild('searchResultsCodeEditor') public searchResultsCodeEditor: CodeViewerComponent;
  public PositioningOptions = PositioningOptions;

  public filerFullscreen = false;
  public chartFullscreen = false;
  public chart: ChartWrapper = new ChartWrapper(this);
  public chartActions = new ChartActions(this);
  public chartStyling = new ChartStylingUtils(this);
  public searchActions = new SearchActions(this);
  public saveLoad = new SaveLoad(this, this.http);
  public areaSelect = new AreaSelect(this);
  public paths = [];
  public openFileVisible = false;
  public saveJsonVisible = false;
  public showDiagramsLoadTable = false;
  public currentDiagramDetails: SelectedDiagramInfo = {id: -1, projectList: []};
  public saveFullVisible = false;
  public showFindResults = false;
  public findResults: {
    findResults: FindInFilesResponse[], totalMatchCount: number
  } = {findResults: [], totalMatchCount: 0};
  public diagramsList: ResultDiagramUI[] = [];

  private _searchJson: SearchObject = StartSearchJson;
  public selectedNodeSize = '';

  public ccShapes: CcShape[] = ChartStyles.nodesTypes;
  public linkTypes = Object.keys(ChartStyles.linkTypes);
  public filesInLegend: fileLegendItem[] = [];

  public typesMapping: TypeMapping[] = null;
  public showNodeEditBox = false;
  public currentFile: CurrentFile = null;
  private messageBoxElement: HTMLElement;

  public titleElement: HTMLElement = null;

  public previousSelectedNode: Node | Edge = null;
  public previousDblClickedNode: Node | Edge = null;
  public lastDblClickedNode: Node | Edge = null;

  public _markedText: string = null;


  public availableFiles: {fullPath, fromSource}[] = [];
  public fileTreeNodes: any[] = [];
  public selectedFileTreeFullPath: string
  public selectedFileTreeNodeLabel: string

  public openFileSuggestions: string[] = [];
  private loadResultsCallback: any;
  // for debugging
  public ChartUtils = ChartUtils;
  public Utils = Utils;
  public Options = Options;

  public selectedLanguageRegexes: SearchOptions[];
  public dropdownLanguageSelection: { label, value }[] = [];
  public dropdownRegexes: { label, value: SearchOptions }[] = [];
  private languageRegexes: Languages[] = [];
  public loadedDiagrams: string[] = [];


  public lastDiagramLoaded: string = '';
  private splitChar: string = null;

  constructor(public http: HttpClient, private jsonPipe: JsonPipe, private prettifyPipe: PrettifyPipe, private httpInterceptService: AppInterceptorsService, public saveLoadService: SaveLoadService) {
    this.searchObject = StartSearchJson;
    this.typesMapping = typesMapping;
    this._searchJson.isRegex = false;


    this.httpInterceptService.setAppComponent(this);
    window['Global_app'] = this;
  }

  amILicensed = async () => {
    const res = await fetch(Env.getApiEndpoint() + '/approveLicense', {method: 'POST'});
    if (!res.ok) {
      this.iAmNotLicensed('Make sure you have an internet connection.');
    }
    const body = await res.json();
    if (body.ok) return;
    this.iAmNotLicensed(body.reason);
  };

  iAmNotLicensed(reason: string) {
    document.getElementsByTagName('body')[0].innerHTML = `
      <h1>Couldn't verify a legitimate license.</h1>
      <h2>${reason}</h2>
      `;
  }

  async ngAfterViewInit(): Promise<void> {
    // await this.amILicensed()
    this.chartActions.initialize();
    this.chartStyling.initialize();
    this.chart.initialize();
    this.searchActions.initialize();
    this.saveLoad.initialize();
    this.areaSelect.intialize();

    //ctrl + s should be moved to own class UserActionsUi / UserActionsDiagrams
    var isCtrl = false;
    document.onkeyup = (e) => {
      if (e.keyCode == 17) isCtrl = false;
    };

    document.onkeydown = (e) => {
      if (e.keyCode == 17) isCtrl = true;
      if (e.keyCode == 83 && isCtrl == true) {
        this.saveJsonVisible = true;
        //run code for CTRL+S -- ie, save!
        return false;
      }
      // addded this because sometimes pressing  's' started save dialog
      setTimeout(() => {
        isCtrl = false;
      }, 200);
    };

    let resizeWindow = () => {
      document.getElementById('filer').style.height = ($(window).height() - document.getElementById('topbox').clientHeight) + 'px';
      // document.getElementById('filer').style.height = $(window).height() + 'px';
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

    this.initializeData();
  }

  async initializeData() {
    this.http.get(Env.getApiEndpoint() + EndPoints.getPaths).subscribe((res: { paths: string[] }) => {
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

    this.http.get(Env.getApiEndpoint() + EndPoints.getLanguages).subscribe((res: Languages[]) => {
      this.languageRegexes = res;
      this.selectedLanguageRegexes = this.languageRegexes[0].searchOptions;
      this.dropdownLanguageSelection = this.languageRegexes.map(i => {
        return {value: i.language, label: this.prettifyPipe.transform(i.language)};
      });
      this.dropdownRegexes = this.selectedLanguageRegexes.map(i => {
        return {label: i.name, value: i};
      });
    });

  }


  public loadDiagramsTable() {
    this.saveLoadService.getResults({}).then(res => {
      this.diagramsList = res;
      this.showDiagramsLoadTable = true;
    });
  }

  public setSelectedLanguage(language: string) {
    this.selectedLanguageRegexes = this.languageRegexes.find(i => i.language === language).searchOptions;
  }


  public toggleMatchNodesLabel() {
    this.Options.showCodeLabels = !this.Options.showCodeLabels;
    this.chart.refresh();
  }

  public toggleInContentLines() {
    this.Options.showInContentLines = !this.Options.showInContentLines;
    this.chart.refresh();
  }


  public toggleReplaceChartWhenLoading() {
    this.Options.keepChartOnLoadFromJson = !this.Options.keepChartOnLoadFromJson;
  }

  public toggleFileLegend() {
    this.Options.showFileLegend = !this.Options.showFileLegend;
  }

  public set searchObject(value: SearchObject) {
    this._searchJson = value;
  }

  public get searchObject(): SearchObject {
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
          let attributes = ChartUtils.getMatchAttributes(element as Node) as MatchInfo;
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
        node: element as Node,
        lines: elementAtts.fileContent.split('\n')
      }, selectTextInFile);
    } else {
      let connectedToFileNode = ChartUtils.getOfFileNode(element as Node, this.chart);
      if (connectedToFileNode) {
        let fileContent = this.chart.getAttributes(connectedToFileNode).fileContent;
        this.setCurrentFile({
          content: fileContent,
          name: ChartUtils.getFilePath(connectedToFileNode as FileNode),
          node: connectedToFileNode as Node,
          lines: fileContent.split('\n')
        }, selectTextInFile);
      }
    }
  }

  zoomOnSelected() {
    this.chart.fitToNodes(this.chart.getSelection().nodes, true);
  }

  public setFilerWidth() {
    if (!this.filerFullscreen && !this.chartFullscreen) return '50%';
    if (this.filerFullscreen) return '100%';
    if (this.chartFullscreen) return '0%';
  }

  public setChartWidth() {
    if (!this.filerFullscreen && !this.chartFullscreen) return '50%';
    if (this.chartFullscreen) return '100%';
    if (this.filerFullscreen) return '0%';
  }

  public addFilesToLegend(fileNodes: Node[]) {
    let tempFilesInLegend: fileLegendItem[] = [];
    fileNodes.forEach((fileNode) => {
      if (!this.filesInLegend.find(i => i.fileNodeId === fileNode.id)) {
        this.filesInLegend.push({
          fileNodeId: fileNode.id,
          color: (fileNode.color as Color).border,
          fileLabel: fileNode.label
        });
      }
    });
    this.filesInLegend = this.filesInLegend.concat(tempFilesInLegend);
  }

  public removeFilesFromLegend(fileNodes: Node[]) {
    fileNodes.forEach(fileNode => {
      let index = this.filesInLegend.findIndex(i => i.fileNodeId === fileNode.id);
      if (index !== -1) this.filesInLegend.splice(index, 1);
    });
  }

  public clearFilesInLegend() {
    this.filesInLegend = [];
  }

  public getLegendColors(): string[] {
    return this.filesInLegend.map(i => i.color);
  }

  public setFileSelection(startLineNumber, endLineNumber) {
    this.codeEditor.scrollToLine(startLineNumber);
    this.codeEditor.markLinesSelected(startLineNumber, endLineNumber);
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
      this.codeEditor.markMatchesInFile(this.chartActions.getSeletedFileMatchesRows());
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

  public createMatchFromSelection(replace = false) {
    let createdNode = this.searchActions.createMatchFromSelection(true, replace);
    if (!createdNode) return;
    setTimeout(() => {
      this.chart.setSelectionNodes([createdNode.id]);
    }, 100);
  }


  public createTasksNode() {
    let tasksNode = CreateUtils.createFileNode({
      file: 'User Created Tasks_' + new Date().getTime(),
      matches: [],
      content: 'my tasks'
    }, this.chart, this.getLegendColors(), this.chart.getViewPos().x);
    ChartUtils.setIsCustom(tasksNode);
    Utils.deepMerge(tasksNode, ChartStyles.tasksNode);
    this.chart.setLabel(tasksNode, 'My Tasks');
    this.chart.addNodesAndLinks([tasksNode]);
  }

  public createFileNode() {
    let fileNode = CreateUtils.createFileNode({
      file: 'User Created File_' + new Date().getTime(),
      matches: [],
      content: 'my text'
    }, this.chart, this.getLegendColors(), this.chart.getViewPos().x);

    ChartUtils.setIsCustom(fileNode);
    this.chart.setLabel(fileNode, 'My File');

    this.chart.addNodesAndLinks([fileNode]);
    // set file borders node
    let matchInfo: MatchInfo = {
      line: '',
      value: '',
      lineNumber: 0,
      endLineNumber: 0,
      indexInLine: 0,
      id: CreateUtils.createId(fileNode.id, 0),
      isRegex: false,
      flags: 'gi',
      endContentLine: 0,
      ofFile: fileNode.id
    };
    setTimeout(() => {
      let fileNodePos = this.chart.getPosition(fileNode.id);
      let matchNode = CreateUtils.createMatchNode(matchInfo, fileNode.id, this.chart);
      matchNode = Object.assign(matchNode, {size: 2, shape: 'circle'});
      this.chart.setNodePosition(matchNode, fileNodePos, false);
      let fileEdge = CreateUtils.createFileEdge(this.chart, fileNode.id, matchNode.id);
      this.chart.addNodesAndLinks([matchNode, fileEdge]);
      this.selectedNode = fileNode;
    }, 100);
  }

  set markedText(text) {
    text = text.trim();
    this.searchObject.pattern = text;
    this.searchObject.originalText = text;
    this._markedText = text;
  }

  get markedText() {
    return this._markedText;
  }

  private doubleClickOnNode(node: IdType, event) {
    // this.chartActions.setPathNode(this.chart.getItem(node));
    this.previousDblClickedNode = this.lastDblClickedNode;
    this.lastDblClickedNode = this.chart.getItem(node) as Node;
    this.showStylingElement(event.event.center.x, event.event.center.y);
  }

  public showStylingElement(x, y, show = true) {
    if (!show) return;
    this.showNodeEditBox = true;
    setTimeout(() => {
      let stylePopup = document.getElementById('nodeStylePopup') as HTMLInputElement;

      stylePopup.style.left = x - stylePopup.clientWidth + 'px';
      stylePopup.style.top = y + 'px';
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


  public recalulateRectangles = true;
  public selectionPreDrag: { nodes: IdType[], edges: IdType[] } = {nodes: [], edges: []};

  public setChartEvents() {
    this.chart.setClickEvent((eventItem: EventItem) => {
      this.selectedNode = eventItem.item;

      if (!this.selectedNode) this.showNodeEditBox = false;
      if (Options.replaceClickedWithSelection) {
        this.createMatchFromSelection(true);
        Options.replaceClickedWithSelection = false;
      }
    });
    this.chart.setContextEvent((eventItem: { event: MouseEvent, nodeId: string, pointer }) => {
      console.log('right click', eventItem);
      // this.selectedNode = this.chart.getItem(eventItem.nodeId);
    });
    this.chart.setDoubleClickEvent((clickedItem, event) => {
      if (event.nodes.length === 0 && event.edges.length === 0) return;
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
      this.selectionPreDrag = Utils.deepCopy(this.chart.getSelection());
      let extenedSelection = this.chartActions.extendSelection(this.chart.getSelection());
      this.chart.setSelectionNodes(extenedSelection.nodes);
    });
    this.chart.setDragEndEvent((eventItem: EventItem) => {
      if (eventItem.item === null) return;
      if (ChartUtils.isFileNode(eventItem.item)) {
        this.chart.setSelectionNodes([eventItem.id]);
      }
      // we need to save the positions on to the nodes, the pos property doesnt get updated. maybe since we`re using 'fixed' option?
      let draggedIds = this.chart.getSelection().nodes;
      let newPositions = this.chart.chart.getPositions(draggedIds);
      let items = this.chart.getItems(draggedIds).nodes;
      let itemsWithNewPosition = items.map((i, index) => {
        return {node: i, pos: newPositions[i.id]};
      });
      this.chart.setNodesPosition(itemsWithNewPosition, true);

      this.recalulateRectangles = true;
      this.chart.setSelection(this.selectionPreDrag);
    });
    this.chart.setOnBeforeDrawEvent((ctx) => {
      /*
            const image = document.getElementById('source');

            image.addEventListener('load', e => {
              ctx.drawImage(image, 33, 71, 104, 124, 21, 20, 87, 104);
            });
      */
      let zoom;
      try {
        zoom = this.chart.chart.getScale();
      } catch (e) {
        console.log(e);
      }

      try {
        if (!Options.drawFileRect) return;
        let fileNodes = this.chart.nodes.get().filter(node => {
          return ChartUtils.isFileNode(node);
        });
        fileNodes.forEach(node => {
          if (node.hidden) return;
          ctx.save();
          let filePosition = this.chart.getPosition(node.id);

          let rect: { rectColor, rectX, rectY, rectW, rectH, boundingRect };
          // box
          try {
            rect = this.chartStyling.getFileRectangle(node, this.chart);
          } catch (ex) {
            console.log(ex);
            return;
          }

          ctx.lineWidth = zoom ? 5 / (Math.pow(zoom * 3, 2)) : 5;
          // ctx.setLineDash([5]);
          ctx.strokeStyle = rect.rectColor;
          ctx.strokeRect(rect.rectX, rect.rectY, rect.rectW, rect.rectH);
          if (Options.fillFileRect) {
            var gradient = ctx.createLinearGradient(rect.rectX, rect.rectY, rect.rectX + rect.rectW, rect.rectY + rect.rectH);

            gradient.addColorStop(0, 'white');
            gradient.addColorStop(1, (node.color as Color).border);

            ctx.fillStyle = gradient;
            ctx.fillRect(rect.rectX, rect.rectY, rect.rectW, rect.rectH);
          }

          ctx.stroke();

          if (Options.printFileNames) {
            let fontSize = 70;
            ctx.font = `${70}px Arial`;
            ctx.fillStyle = 'grey';
            let labelLength = node.label.length * fontSize;
            for (let i = 0; i < rect.boundingRect.right - labelLength - 50; i += ChartConsts.FileNameDistance) {
              ctx.fillText(node.label, filePosition.x + i, filePosition.y);
            }
            ctx.stroke();
          }
          ctx.restore();
        });
      } catch (ex) {

      }
    });

    this.chart.setBlurNodeEvent((event: any) => {
      let node = this.chart.getItem(event.node) as Node;
      if (!node) return;
      if (ChartUtils.isMatchNode(node as Node) && !ChartUtils.isWasEdited(node) && !this.Options.showCodeLabels) {
        node.label = '';
        this.chart.nodes.simpleUpdate(node as Node);
      }
    });

    this.chart.setHoverNodeEvent((event: any) => {
      console.log('hover', event);
      let node = this.chart.getItem(event.node) as Node;
      if (!node) return;
      if (ChartUtils.isMatchNode(node as Node) && !ChartUtils.isWasEdited(node) && !this.chart.getTitle) {
        node.label = ChartUtils.getMatchCodeLineLabel(node);
        this.chart.nodes.simpleUpdate(node as Node);
      }
    });

    // this.chart.setBlurEdgeEvent((event: any) => {
    //   let edge = this.chart.getItem(event.edge) as Edge
    //   let nodes = this.chart.getItems([edge.to, edge.from]).nodes
    //   let shouldUpdate = false
    //   nodes.forEach(((node: Node) => {
    //     if (ChartStylingUtils.isShowLabelOnHover(node)) {
    //       shouldUpdate = true
    //       node = ChartUtils.setForceShowLabel(node as Node, false)
    //     }
    //   }))
    //   if (shouldUpdate) this.chart.nodes.update(nodes as Node)
    // });

    // this.chart.setHoverEdgeEvent((event: any) => {
    //   let edge = this.chart.getItem(event.edge) as Edge
    //   let nodes = this.chart.getItems([edge.to, edge.from]).nodes
    //   let shouldUpdate = false
    //   nodes.forEach(((node: Node) => {
    //     if (ChartStylingUtils.isShowLabelOnHover(node)) {
    //       shouldUpdate = true
    //       node = ChartUtils.setForceShowLabel(node as Node, true)
    //     }
    //   }))
    //   if (shouldUpdate) this.chart.nodes.update(nodes as Node)
    // });

  }


  ngOnInit(): void {
    this.titleElement = document.getElementById('nodeTitle') as HTMLElement;
    this.messageBoxElement = document.getElementById('message_box') as HTMLElement;
    let chartElement = document.getElementById('vis_element');

    this.chart.setUp(chartElement);
    this.setChartEvents();
  }

  public codeSelectionChange(event: Ace.Selection) {
    if (!this.currentFile) {
      console.log('no file selecetd - for clicking on code');
      return;
    }
    let text = this.codeEditor.aceEditor.getSelectedText();
    if (text === undefined || text === null || text.length === 0) {
      this.searchObject.isRegex = false;
      this.chartActions.selectMatchesOfLine(event.getAnchor().row, this.currentFile.node as Node);
      return;
    }

    // console.log(this.codeEditor.aceEditor.getSelectedText())
    if (event.getAnchor().row === event.getCursor().row) this.markedText = text;
    else this.markedText = '';
  }

  public messageBoxQueue: messageBoxItem[] = [];

  public addMessage(title: string, message, displayTime) {
    this.messageBoxQueue.push({title: title, message: message, displayTime: displayTime});
    setTimeout(() => {
      this.messageBoxElement.style.visibility = 'visible';
    }, 0);
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

  public createShape(shape: any) {
    this.chartActions.createShape(this.chart.getSelection().nodes, shape.name);
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
    this.saveLoad._reload();
  }

  public clearVisiIds() {
    this.http.post(Env.getApiEndpoint() + EndPoints.clearVisiIds, {path: this.searchObject.dirPath}).subscribe((response) => {
      console.log('clear visi ids response', response);
    });
  }

  public rewriteVisiIds() {
    this.http.post(Env.getApiEndpoint() + EndPoints.rewriteVisiIds, {}).subscribe((response) => {
      console.log('rewrite visi ids response', response);
    });
  }

  public fullSaveToFile() {
    this.saveLoad.fullSaveToFile(this.currentDiagramDetails);
  }

  public jsonSave() {
    this.saveLoad.saveChartToJson(this.currentDiagramDetails);
  }

  public async dbSave(isNew: boolean = true) {
    let items = this.saveLoad.prepareNodesAndEdgesForSave();
    let nodeLabels = items.nodes.map(i => i.label).filter(i => i);
    let edgeLabels = items.edges.map(i => i.label).filter(i => i);


    let saveInfo = {
      savedDiagramDetails: Utils.deepCopy(this.currentDiagramDetails),
      nodes: items.nodes,
      edges: items.edges,
      filenames: this.filesInLegend.map(i => i.fileLabel),
      labels: nodeLabels.concat(edgeLabels)
    };

    if (!isNew) {
      this.saveLoadService.save(saveInfo, false).subscribe(res => {
        this.addMessage('updated diagram', this.currentDiagramDetails.story, 1000);
        console.log(res);
      }, err => {
        console.log(err);
      });
    } else {
      this.saveLoadService.save(saveInfo).subscribe(res => {
        this.addMessage('saved diagram', this.currentDiagramDetails.story, 1000);
        this.currentDiagramDetails.id = res['id'];
      });
    }
  }

  public clear() {
    this.chartActions.clearChart();
    this.resetDiagramDetails();
  }

  public resetDiagramDetails() {
    let dirPath = this.currentDiagramDetails.projects;
    this.currentDiagramDetails = {id: -1, projectList: []};
  }

  onSelectLoadTable(event) {
    this.saveLoadService.getById(event.data.id).subscribe((diagram: ResultDiagramUI) => {
      if (diagram.data.edges) console.log('load start', diagram.data.edges.length);
      else console.log('wtf');
      this.saveLoad.loadFromDb(diagram, event.data.id);
      this.showDiagramsLoadTable = false;
    });
    console.log(event.data);
  }

  onLoadTableFilter(event) {
    console.log(event);
  }

  public performSavedSearch(search: SearchOptions) {
    this.searchObject.pattern = PreSeacrhJsonsUtils.getSearchStringFromText(this.searchObject.pattern, search.regex);
    this.searchObject.isRegex = true;
    console.log(search);
  }

  pathDropdownClick(event: Event) {
    event.stopPropagation();
  }

  setSelectedPath(pathValue: string) {
    this.searchObject.dirPath = pathValue;
    localStorage.setItem(pathStorageKey, pathValue);

    let convertPathToObject = (items: string[], index, currentLeaf: { id, label, data, children }[], id) => {
      let myName = items[index]
      let childIndex = currentLeaf.findIndex(i=>i.label===myName)
      const finalItem = index===items.length-1
      let myChildren
      if(childIndex===-1) {
        if(finalItem) {
          myChildren = Object.assign({id: id, label: myName, data: myName}, {icon: "fa-file-code-o"})
          currentLeaf.push(myChildren)
          return id
        } else {
          myChildren = Object.assign({id: id, label: myName, data: myName, children: []}, {"expandedIcon": "fa-folder-open-o", "collapsedIcon": "fa-folder-o",})
          currentLeaf.push(myChildren)
        }
      } else {
        if(finalItem) {
          return id
        } else {
          myChildren = currentLeaf[childIndex]
        }
      }
      convertPathToObject(items, index+1, myChildren.children, id+1)
      myChildren.children.sort((i, j)=> !i.children ? 1 : -1)
    }

    let convertPathArrayToObject = (paths: string[], object) => {
      this.splitChar = this.searchObject.dirPath.indexOf('/')==-1 ? '\\' : '/';
      for(const path of paths) {
        let lastId = 0
        lastId = convertPathToObject(path.split(this.splitChar), 0, object, lastId)
      }
    }

    this.http.post(Env.getApiEndpoint() + EndPoints.getAllFilesInPath, {folder: pathValue}).subscribe((res: { files: string[] }) => {
      this.availableFiles = res.files.map((i)=>{return {fullPath: i, fromSource: i.substring(this.searchObject.dirPath.length, i.length)}});
      try {
        convertPathArrayToObject(this.availableFiles.map(i=>i.fromSource), this.fileTreeNodes)
        this.fileTreeNodes = this.fileTreeNodes.sort((i, j)=> !i.children ? 1 : -1)
      } catch (ex) {
        console.error("failed to convert file paths to tree object", ex)
      }
      console.log(this.fileTreeNodes)

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

  public set codeFontSize(fontSize) {
    localStorage.setItem('codeFontSize', fontSize);
  };

  public get fontSize() {
    return localStorage.getItem('codeFontSize');
  }

  public filterAvailableFiles(value) {
    this.openFileSuggestions = this.availableFiles.map(i=>i.fromSource)
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
      dirPath: this.searchObject.dirPath,
      searchPath: fullPath.substring(this.searchObject.dirPath.length),
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

  public loadFromFile(event) {
    let file = event.srcElement.files[0];
    let filename = file.name.replace(/\.[^/.]+$/, '');
    this.loadedDiagrams.push(filename);
    this.lastDiagramLoaded = filename;
    if (file) {
      let reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (evt) => {
        this.saveLoad.loadFromJson(evt);
      };
      reader.onerror = (evt) => {
        console.log('error reading file');
      };
      (document.getElementById('fileLoadInput') as HTMLInputElement).value = '';
    }
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

  selectSearchResultForDisplay(fileResult: FindInFilesResponse, match: MatchInfo) {
    this.searchResultsCodeEditor.fileData = {name: '', content: fileResult.content, lines: [], node: null};
    setTimeout(() => {
      this.searchResultsCodeEditor.scrollToLine(match.lineNumber);
      this.searchResultsCodeEditor.markLinesSelected(match.lineNumber, null);
    }, 100);
  }

  fitAllNodesOnScreen() {
    this.chart.fitToNodes(this.chart.getAllItemIds().nodes, false);
  }

  reloadFromCode() {
    this.saveLoad.reloadFiles(this.chart.getAllFileNodes() as FileNode[]);
  }

  clearFailedReloaded() {
    this.chartActions.clearFailedReloadNodesIndicators();
  }

  openFileSelectDialog() {
    (document.getElementById('fileLoadInput') as HTMLInputElement).click();
  }

  selectedFile($event: any) {
    let pathFromSource = $event.label
    this.selectedFileTreeNodeLabel = pathFromSource
    let parent = $event.parent
    while(parent) {
      pathFromSource = parent.label + this.splitChar + pathFromSource
      parent = parent.parent
    }
    this.selectedFileTreeFullPath = this.searchObject.dirPath + this.splitChar + pathFromSource
  }
}

