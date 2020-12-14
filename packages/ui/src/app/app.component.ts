///aaaa///
import {AutoComplete, CodeHighlighterModule} from 'primeng/primeng';
import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SearchActions} from './search/search.actions';
import {ChartConsts, ChartStyles, NodeStyles, ChartStyle, allNodeIcons, allNodeIconImages, NodeShapes} from './chart/chart.consts';
import {StartSearchJson, TypeMapping, typesMapping} from './chart/jsons';
import {JsonPipe} from '@angular/common';
import {Network, DataSet, Node, Edge, IdType, NetworkEvents} from 'vis';
import {ChartWrapper, EventItem} from './chart/chart.wrapper';
import {ChartUtils, AttributesKey} from './chart/chart.utils';
import {ChartActions, PositioningOptions} from './chart/chart.actions';
import {Ace} from 'ace-builds';

export interface Shape {name: string, details: {tooltip, node, link, class}}

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
  EndPoints, SearchJson, FileNode
} from './types.nodejs';
import {keyframes} from '@angular/core/src/animation/dsl';
import {SearchOptions, PreSeacrhJsonsUtils, Languages} from './search/search.jsons';
import {AreaSelect} from './chart/area.select';
import {Utils} from './chart/Utils';
import {CodeViewerComponent} from './code-viewer/code-viewer.component';
import { ChartStyling } from './chart/chart.styling';
import {AppInterceptorsService} from './services/AppInterceptorService';

export const Options = {
  printFileNames: false,
  fillFileRect: false,
  drawFileRect: true,
  positioning: PositioningOptions.DOWN,
  showFileLegend: true,
  showCodeLabels: true,
  replaceClickedWithSelection: false,
  keepChartOnLoadFromJson: false
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [JsonPipe]
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('openfileInput') private openfileInput: AutoComplete;
  @ViewChild('aceEditor') public codeEditor: CodeViewerComponent;
  @ViewChild('searchResultsCodeEditor') public searchResultsCodeEditor: CodeViewerComponent;
  public PositioningOptions = PositioningOptions

  public filerFullscreen = false
  public chartFullscreen = false
  public chart: ChartWrapper = new ChartWrapper(this);
  public chartActions = new ChartActions(this);
  public chartStyling = new ChartStyling(this);
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

  public shapes: Shape[] = ChartStyles.nodesTypes;
  public linkTypes = Object.keys(ChartStyles.linkTypes);
  public nodeStyles = NodeStyles;
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


  public availableFiles: string[] = [];
  public openFileSuggestions: string[] = [];
  private loadResultsCallback: any;
  // for debugging
  public ChartUtils = ChartUtils;
  public Utils = Utils
  public Options = Options;

  public selectedLanguageRegexes: SearchOptions[];
  public dropdownLanguageSelection: {label, value}[] = []
  private languageRegexes:  Languages[] = [];


  public demo_image = new Image
  public IS_DEMO_NILI = false

  constructor(public http: HttpClient, private jsonPipe: JsonPipe, private httpInterceptService: AppInterceptorsService) {
    this.demo_image.src = "/assets/demo/all.png"
    this.searchJson = StartSearchJson;
    this.typesMapping = typesMapping;
    this._searchJson.isRegex = false;


    this.httpInterceptService.setAppComponent(this)
    console.log('17.05.2020')
    window['Global_app'] = this;
  }

  ngAfterViewInit(): void {
    this.chartActions.initialize();
    this.chartStyling.initialize()
    this.chart.initialize();
    this.searchActions.initialize();
    this.saveLoad.initialize();
    this.areaSelect.intialize();

    let resizeWindow = () => {
      // document.getElementById('filer').style.height = ($(window).height() - document.getElementById('topbox').clientHeight - 40) + 'px';
      document.getElementById('filer').style.height = $(window).height() + 'px';
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

    this.http.get('http://localhost:2900' + EndPoints.getLanguages).subscribe((res: Languages[]) => {
      this.languageRegexes = res
      this.selectedLanguageRegexes = this.languageRegexes[0].searchOptions
      this.dropdownLanguageSelection = this.languageRegexes.map(i=>{return {value: i.language, label: i.language}})
    });
  }

  public setSelectedLanguage(language: string) {
    this.selectedLanguageRegexes = this.languageRegexes.find(i=>i.language===language).searchOptions
  }


  public toggleMatchNodesLabel() {
    this.Options.showCodeLabels = !this.Options.showCodeLabels
    this.chartStyling.setMatchNodesLabel(this.Options.showCodeLabels)
  }


  public toggleReplaceChartWhenLoading() {
    this.Options.keepChartOnLoadFromJson = !this.Options.keepChartOnLoadFromJson
  }

  public toggleFileLegend() {
    this.Options.showFileLegend = !this.Options.showFileLegend
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
        node: element,
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

  public setFilerWidth() {
    if(!this.filerFullscreen && !this.chartFullscreen) return '50%'
    if(this.filerFullscreen) return '100%'
    if(this.chartFullscreen) return '0%'
  }

  public setChartWidth() {
    if(!this.filerFullscreen && !this.chartFullscreen) return '50%'
    if(this.chartFullscreen) return '100%'
    if(this.filerFullscreen) return '0%'
  }

  public addFilesToLegend(fileNodes: Node[]) {
    let tempFilesInLegend: fileLegendItem[] = [];
    fileNodes.forEach((fileNode) => {
      if (!this.filesInLegend.find(i => i.fileNodeId === fileNode)) {
        this.filesInLegend.push({
          fileNodeId: fileNode.id,
          color: fileNode.color.border,
          fileLabel: fileNode.label
        });
      }
    });
    this.filesInLegend = this.filesInLegend.concat(tempFilesInLegend);
  }

  public removeFilesFromLegend(fileNodes: Node[]) {
    fileNodes.forEach(fileNode => {
      let index = this.filesInLegend.findIndex(i => i.fileNodeId === fileNode);
      if (index) this.filesInLegend.splice(index, 1);
    });
  }

  public clearFilesInLegend() {
    this.filesInLegend = [];
  }

  public getLegendColors() {
    return this.filesInLegend.map(i=>i.color)
  }

  public showHideFile() {
    this.chartActions.groupUngroupFile(this.selectedNode as Node)
  }

  setSelectedNodesSize(size) {
    if (parseInt(size) === NaN) return;
    this.chart.setNodesSize(this.chart.getSelection().nodes, parseInt(size));
  }


  setSelectedNodesFontSize(size) {
    if (parseInt(size) === NaN) return;
    this.chart.setNodesFontSize(this.chart.getSelection().nodes, parseInt(size));
  }

  setSelectedEdgesDash(isDashed) {
    this.chart.setEdgeDash(this.chart.getSelection().edges, isDashed);
  }


  setSelectedEdgesSize(size) {
    if (parseInt(size) === NaN) return;
    this.chart.setEdgesSize(this.chart.getSelection().edges, parseInt(size));
  }

  setSelectedEdgesFontSize(size) {
    if (parseInt(size) === NaN) return;
    this.chart.setEdgesFontSize(this.chart.getSelection().edges, parseInt(size));
  }

  setEdgePoint(left: boolean, right: boolean) {
    this.chart.setArrows(this.chart.getSelection(), left, right);
  }

  public setSelectedEdgesLength(length) {
    this.chart.setEdgesLength(this.chart.getSelection().edges, parseInt(length))
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

  public createFileNode() {
    let fileNode = CreateUtils.createFileNode({file: 'User Created File_' +new Date().getTime(), matches: [], content: 'point 1\r\npoint 2\r\npoint3'}, this.chart, this.getLegendColors(), this.chart.getViewPos().x);
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
    this.showStylingElement(event.event.center.x, event.event.center.y)
  }

  public showStylingElement(x, y, show = true) {
    if(!show) return
    this.showNodeEditBox = true;
    setTimeout(()=>{
      let stylePopup = document.getElementById('nodeStylePopup') as HTMLInputElement;

      stylePopup.style.left = x - stylePopup.clientWidth + 'px';
      stylePopup.style.top = y + 'px';
      let textInput = document.getElementById('nodeTitleInput') as HTMLInputElement;
      if(textInput) {
        textInput.focus();
        textInput.select();
      }
    }, 50)
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

  public recalulateRectangles = true
  public selectionPreDrag: {nodes: IdType[], edges: IdType[]} = {nodes: [], edges: []}
  public setChartEvents() {
    this.chart.setClickEvent((eventItem: EventItem) => {
      this.selectedNode = eventItem.item;

      if (!this.selectedNode) this.showNodeEditBox = false;
      if(Options.replaceClickedWithSelection) {
        this.createMatchFromSelection(true)
        Options.replaceClickedWithSelection = false
      }
    });
    this.chart.setDoubleClickEvent((clickedItem, event) => {
      if(event.nodes.length===0 && event.edges.length===0) return
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
      this.selectionPreDrag = Utils.deepCopy(this.chart.getSelection())
      let extenedSelection = this.chartActions.extendSelection(this.chart.getSelection(), {matchToFile: false})
      this.chart.setSelectionNodes(extenedSelection.nodes);
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
      this.recalulateRectangles = true
      this.chart.setSelection(this.selectionPreDrag)
    });
    this.chart.setOnBeforeDrawEvent((ctx) => {
      if(this.IS_DEMO_NILI) ctx.drawImage(this.demo_image, 0, 0)
      try {
        if (!Options.drawFileRect) return;
        let fileNodes = this.chart.nodes.get().filter(node => {
          return ChartUtils.isFileNode(node);
        });
        fileNodes.forEach(node => {
          if(node.hidden) return
          ctx.save();
          let filePosition = this.chart.getPosition(node.id);
          // box
          let boundingRect = this.chart.getFileNodeNeighboursBoudingBox(node.id, true);
          let rectColor = node.color.border;
          let rectX = boundingRect.left - 10;
          let rectY = boundingRect.top - 10;
          let rectW = boundingRect.right - boundingRect.left + 20;
          let rectH = boundingRect.bottom - boundingRect.top + 20;

          ctx.lineWidth = 5;
          // ctx.setLineDash([5]);
          ctx.strokeStyle = rectColor;
          ctx.strokeRect(rectX, rectY, rectW, rectH);
          if (Options.fillFileRect) {
            var gradient = ctx.createLinearGradient(rectX, rectY, rectX + rectW, rectY + rectH);

            gradient.addColorStop(0, 'white');
            gradient.addColorStop(1, node.color.border);

            ctx.fillStyle = gradient;
            ctx.fillRect(rectX, rectY, rectW, rectH);
          }

          ctx.stroke();

          if (Options.printFileNames) {
            let fontSize = 70;
            ctx.font = `${70}px Arial`;
            ctx.fillStyle = 'grey';
            let labelLength = node.label.length * fontSize;
            for (let i = 0; i < boundingRect.right - labelLength - 50; i += ChartConsts.FileNameDistance) {
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
      this.showTooltip = false
    });

    this.chart.setHoverNodeEvent((event: any) => {
      let node = this.chart.getItem(event.node)
      if(!ChartUtils.isMatchNode(node as Node)) return
      this.tooltipText = ChartUtils.getLine(node)
      this.showTooltip = true
      setTimeout(()=>{
        let tooltipElement = document.getElementById('tooltip');
        if(!tooltipElement) return
        tooltipElement.style.top = (event.event.y + 20) + 'px';
        tooltipElement.style.left = (event.event.x + 20) + 'px';
      }, 1000)
    });
  }

  public drawnRectangles: {rectX, rectY, rectH, rectW, color}[] = []
  public setRectangleAroundFile_new() {
    this.chart.setOnBeforeDrawEvent((ctx) => {
      ctx.save();
      // draw rectangles
      this.drawnRectangles.forEach(i=>{
        ctx.lineWidth = 5;
        // ctx.setLineDash([5]);
        ctx.strokeStyle = i.color;
        ctx.strokeRect(i.rectX, i.rectY, i.rectW, i.rectH);
        if (Options.fillFileRect) {
          var gradient = ctx.createLinearGradient(i.rectX, i.rectY, i.rectX + i.rectW, i.rectY + i.rectH);

          gradient.addColorStop(0, 'white');
          gradient.addColorStop(1, i.color);

          ctx.fillStyle = gradient;
          ctx.fillRect(i.rectX, i.rectY, i.rectW, i.rectH);
        }

        ctx.stroke();
      })
      ctx.restore();


      // calculate new rectangles
      if(!this.recalulateRectangles) return
      this.recalulateRectangles = false
      try {
        if (!Options.drawFileRect) return;
        let fileNodes = this.chart.nodes.get().filter(node => {
          return ChartUtils.isFileNode(node);
        });
        this.drawnRectangles = fileNodes.map(node => {
          if(node.hidden) return null
          let boundingRect = this.chart.getFileNodeNeighboursBoudingBox(node.id, true);
          return {
            color: node.color.border,
            rectX: boundingRect.left - 10,
            rectY: boundingRect.top - 10,
            rectW: boundingRect.right - boundingRect.left + 20,
            rectH: boundingRect.bottom - boundingRect.top + 20
          }
        }).filter(i=>i);
      } catch (ex) {
      }
    });
  }


  ngOnInit(): void {
    this.titleElement = document.getElementById('nodeTitle') as HTMLElement;
    this.messageBoxElement = document.getElementById('message_box') as HTMLElement;
    let chartElement = document.getElementById('vis_element');

    this.chart.setUp(chartElement);
    this.setChartEvents();
  }

  public codeSelectionChange(event: Ace.Selection) {
    if(!this.currentFile) {
      console.log('no file selecetd - for clicking on code')
      return
    }
    let text = this.codeEditor.aceEditor.getSelectedText();
    if (text === undefined || text === null || text.length === 0) {
      this.searchJson.isRegex = false;
      this.chartActions.selectMatchesOfLine(event.getAnchor().row, this.currentFile.node as Node)
      return;
    }

    // console.log(this.codeEditor.aceEditor.getSelectedText())
    if(event.getAnchor().row === event.getCursor().row) this.markedText = text
    else this.markedText = ''
  }

  public messageBoxQueue: messageBoxItem[] = [];

  public addMessage(title: string, message, displayTime) {
    if(title.toLowerCase().indexOf('error')!==-1) displayTime = displayTime*2
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

  public createShape(shape: any) {
    this.chartActions.createShape(this.chart.getSelection().nodes, shape.name);
  }

  public setTitle(event: Event) {
    event.stopPropagation();
    if (!this.selectedNode) return;
    this.chartActions.setNodeTitle(this.selectedNode as Node, (event.target as HTMLTextAreaElement).value);
  }

  public _setSelecteionColor(color) {
    this.chart.setColor(this.chartActions.getSelectedLinksOrNodesOnly(), color);
  }

  public  setSelectionNodeStyle(style: {background, border}) {
    this.chart.setColor(this.chartActions.getSelectedLinksOrNodesOnly(), style.background);
    this.chart.setBorderColor(this.chartActions.getSelectedLinksOrNodesOnly(), style.border);
  }

  public setSelectionEdgeStyle(style: {background, border}) {
    this.chart.setColor(this.chartActions.getSelectedLinksOrNodesOnly(), style.border);
  }

  public _setSelecteionBorderColor(color) {
    this.chart.setBorderColor(this.chartActions.getSelectedLinksOrNodesOnly(), color);
  }

  public setSelectionIcon(icon) {
    this.chart.setNodeIcon(this.chartActions.getSelectedLinksOrNodesOnly().nodes, icon);
  }

  public setSelectionImage(imagePath) {
    this.chart.setNodeImage(this.chartActions.getSelectedLinksOrNodesOnly().nodes, imagePath);
  }

  public setSelectionShape(shape) {
    this.chart.setNodeShape(this.chartActions.getSelectedLinksOrNodesOnly().nodes, shape);
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
        this.saveLoad.loadFromJson(evt)
      };
      reader.onerror = (evt) => {
        console.log('error reading file');
      };
      (document.getElementById('fileLoadInput') as HTMLInputElement).value = '';
    }
  }

  public performSavedSearch(search: SearchOptions) {
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
  allNodeImages: { path, name }[] = allNodeIconImages;
  nodeShapes: {faClass, visShape}[] = NodeShapes
  showTooltip: boolean = true;
  tooltipText: string = '';

  public set codeFontSize(fontSize) {
    localStorage.setItem('codeFontSize', fontSize);
  };

  public get fontSize() {
    return localStorage.getItem('codeFontSize');
  }

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
    this.saveLoad.reloadFiles(this.chart.getAllFileNodes() as FileNode[])
  }

  clearFailedReloaded() {
    this.chartActions.clearFailedReloadNodesIndicators()
  }
}

