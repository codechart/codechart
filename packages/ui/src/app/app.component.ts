///aaaa///
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SearchActions } from './search/search.actions';
import { ChartConsts, ChartStyles, NodeColors, ChartStyle } from './chart/chart.consts';
import { StartSearchJson, TypeMapping, typesMapping } from './chart/jsons';
import { JsonPipe } from '@angular/common';
import { Network, DataSet, Node, Edge, IdType, NetworkEvents } from 'vis';
import { ChartWrapper, EventItem } from './chart/chart.wrapper';
import { ChartUtils, AttributesKey } from './chart/chart.utils';
import { ChartActions } from './chart/chart.actions';


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
import { CreateUtils } from './chart/create.utils';
import { SaveLoad } from './chart/save.load';
import {
  MatchInfo, SaveNode, SaveJson, CreateTypes, FindInFilesResponse, SaveNodesResponse,
  EndPoints, SearchJson, FileNode
} from './types.nodejs';
import { keyframes } from '@angular/core/src/animation/dsl';
import { PreSearchJson, specificSearchJsons, PreSeacrhJsonsUtils } from './search/search.jsons'; import { AreaSelect } from './chart/area.select';
import { Utils } from './chart/Utils';
2

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [JsonPipe]
})
export class AppComponent implements OnInit, AfterViewInit {
  public currentLineElement = null;
  public mySpecificSearchJsons: PreSearchJson[];

  public chart: ChartWrapper = new ChartWrapper();
  public chartActions = new ChartActions(this);
  public searchActions = new SearchActions(this);
  public saveLoad = new SaveLoad(this, this.http);
  public areaSelect = new AreaSelect(this)

  private _searchJson: SearchJson = StartSearchJson;
  public selectedNodeSize = '';

  public shapeTypes = Object.keys(ChartStyles.nodesTypes);
  public linkTypes = Object.keys(ChartStyles.linkTypes);
  public nodesColors = NodeColors;


  public typesMapping: TypeMapping[] = null;

  public currentFile: CurrentFile = null;
  public fileElement: HTMLTextAreaElement = null;
  private fileContainer: HTMLElement;
  private messageBoxElement: HTMLElement;

  public titleElement: HTMLElement = null;

  public previousSelectedNode: Node | Edge = null;
  public previousDblClickedNode: Node | Edge = null;
  public lastDblClickedNode: Node | Edge = null;

  public _markedText: string = null;
  public resultIndex = 0;


  public layout: 'directional' | 'spread' = 'directional'

  changeLayout() {
    this.layout = this.layout == 'directional' ? 'spread' : 'directional'
  }

  constructor(public http: HttpClient, private jsonPipe: JsonPipe) {
    console.log(this.shapeTypes);
    this.searchJson = StartSearchJson;
    this.typesMapping = typesMapping;
    this.mySpecificSearchJsons = specificSearchJsons;

    window['Global_app'] = this;
  }

  ngAfterViewInit(): void {
    this.chartActions.initialize();
    this.chart.initialize();
    this.searchActions.initialize();
    this.saveLoad.initialize();
    this.areaSelect.intialize()

    let inputCollection = document.getElementsByTagName('input');
    for (let i = 0; i < inputCollection.length; i++) {
      inputCollection[i].addEventListener('keyup', (e) => { e.stopPropagation(); });
    }
    window['chart'] = this.chart.chart;
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
    console.log('selected:', element);

    let selectedSize = ChartUtils.getElementSize(element);
    this.selectedNodeSize = selectedSize ? (selectedSize.toString()) : '';

    let selectTextInFile = () => {
      if (ChartUtils.isNode(element)) {
        if (ChartUtils.isOfFile(element)) {
          let attributes = ChartUtils.getAttributes(element) as MatchInfo;
          this.setFileSelection(attributes.lineNumber + 1);
        } else if (ChartUtils.isFileNode(element)) {
          this.setFileSelection(1);
        }
      }
    };

    // set file element
    let elementAtts = this.chart.getAttributes(element);
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
        this.currentFile = null;
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

  public setFileSelection(lineNumber) {
    if (this.currentLineElement !== null) {
      this.currentLineElement.style.border = '';
    }

    this.currentLineElement = document.querySelectorAll('[data-line-number=\"' + lineNumber + '\"]')[0].parentElement.parentElement.lastChild;
    this.currentLineElement.style.border = '1px solid';

    const $container = $('#fileContainer'),
      $scrollTo = $('[data-line-number=\"' + lineNumber + '\"]');

    $container.scrollTop(
      $scrollTo.offset().top - $container.offset().top + $container.scrollTop() - 30
    );
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

    let escapeHtml = (htmlText) => {
      return htmlText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    let fileContent = escapeHtml(fileObject.content);

    this.currentFile = {
      content: fileContent,
      name: fileObject.name,
      node: fileObject.node,
      lines: fileObject.lines
    };
    setTimeout(() => {
      window['hljs'].lineNumbersBlock($('code')[0]);
      window['hljs'].highlightBlock($('code')[0]);
      setTimeout(() => {
        callback();
      }, 0);
    }, 0);

  }

  public clickedChart(event) {
    event.target.parentElement.focus()
  }

  public noSelectedNode() {
    console.log('no node selected');
    this.messageBoxQueue.push({ title: 'no selected node', message: 'no selected node', displayTime: 10000 })
  }

  public createMatchFromSelection() {
    if (this.selectedNode === null) {
      this.noSelectedNode();
      return;
    }
    let ofFileNodeId = ChartUtils.isFileNode(this.selectedNode as Node) ? this.selectedNode.id : ChartUtils.getOfFile(this.selectedNode as Node);
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
      endContentLine = this.getContentOfFunction(ChartUtils.getFileNodeContent(this.chart.getItem(ofFileNodeId) as Node).split('\n'), lineCounter)
    }
    let match2: MatchInfo = {
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

    let nodes = CreateUtils.createMatchNode(match2, ofFileNodeId, this.chart, this.selectedNode as Node, this.layout);
    this.chartActions.addNodesToChart(nodes);
  }

  private getContentOfFunction(lines: string[], lineIndex: number) {
    let currentLine = lines[lineIndex]
    if (currentLine.indexOf('(') === -1) return undefined

    let countBrackets = (open, close, count, line) => {
      let openRegex = line.match(new RegExp(`\\${open}`))
      let openCount = !openRegex ? 0 : openRegex.length
      let closeRegex = line.match(new RegExp(`\\${close}`))
      let closeCount = !closeRegex ? 0 : closeRegex.length
      return count + openCount - closeCount
    }
    let checkLine = (lines: string[], lineIndex, status: 'counting ()' | 'counting {}' | 'after ()' | 'finished', bracketCount, lineCount) => {
      console.log(lineCount)
      if (status === 'finished') return undefined
      let currentLine = lines[lineIndex]
      console.log(lineCount, currentLine)
      let count
      if (status === 'after ()') {
        if (currentLine.match(/^\s*\{/) === null) {
          checkLine(null, null, 'finished', null, lineCount)
        }
        else
          status = 'counting {}'
      }
      if (status === 'counting ()') {
        count = countBrackets('(', ')', bracketCount, currentLine)
        if (count <= 0) {
          if (currentLine.match('{'))
            lineCount = checkLine(lines, lineIndex, 'counting {}', 0, lineCount)
          else
            lineCount = checkLine(lines, lineIndex + 1, 'after ()', 0, lineCount + 1)
        }
        else
          lineCount = checkLine(lines, lineIndex + 1, 'counting ()', 0, lineCount + 1)
      } else if (status === 'counting {}') {
        count = countBrackets('{', '}', bracketCount, currentLine)
        if (count <= 0) {
          return lineCount
        }
        else {
          lineCount = checkLine(lines, lineIndex + 1, 'counting {}', count, lineCount + 1)
        }
      }
      return lineCount
    }

    return checkLine(lines, lineIndex, 'counting ()', 0, 0)
  }


  public connectNodesInsideContent() {
    this.chartActions.connectNodeToMatchesInContent(this.selectedNode as Node);
  }

  set markedText(text) {
    this.searchJson.pattern = text;
    this._markedText = text;
  }

  get markedText() {
    return this._markedText;
  }

  private doubleClickOnNode(node: IdType) {
    this.chartActions.setPathNode(this.chart.getItem(node));
    this.previousDblClickedNode = this.lastDblClickedNode;
    this.lastDblClickedNode = this.chart.getItem(node) as Node;
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
    this.fileElement = document.getElementById('fileContent') as HTMLTextAreaElement;
    this.titleElement = document.getElementById('nodeTitle') as HTMLElement;
    this.fileContainer = document.getElementById('fileContainer') as HTMLElement;
    this.messageBoxElement = document.getElementById('message_box') as HTMLElement;
    this.fileElement.onkeydown = (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();
    };
    this.fileElement.onmouseup = (e) => {
      let markedText = window.getSelection().toString();
      if (markedText === undefined || markedText === null || markedText.length === 0)
        this.searchJson.isRegex = false;
      this.markedText = window.getSelection().toString();
    };

    let chartElement = document.getElementById('vis_element');
    this.chart.setUp(chartElement);
    this.chart.setClickEvent((eventItem: EventItem) => {
      this.selectedNode = eventItem.item;
    });
    this.chart.setDoubleClickEvent((clickedItem, event) => {
      this.doubleClickOnNode(event.nodes[0]);
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
      let draggedIds = this.chart.getSelection().nodes
      let newPositions = this.chart.chart.getPositions(draggedIds)
      let items = this.chart.getItems(draggedIds).nodes
      let itemsWithNewPosition = items.map((i, index) => { return { node: i, pos: newPositions[i.id] } })
      this.chart.setNodesPosition(itemsWithNewPosition, true)
    });
    this.chart.setOnBeforeDrawEvent((ctx) => {
      try {
        let fileNodes = this.chart.nodes.get().filter(node => { return ChartUtils.isFileNode(node) })
        fileNodes.forEach(node => {
          ctx.save()
          let filePosition = this.chart.getPosition(node.id)
          // box
          let boundingRect = this.chart.getNeighboursBoudingBox(node.id, true)
          let rectColor = node.color.border
          let rectX = boundingRect.left - 10
          let rectY = boundingRect.top - 10
          let rectW = boundingRect.right - boundingRect.left + 10
          let rectH = boundingRect.bottom - boundingRect.top + 10

          ctx.lineWidth = 5;
          ctx.setLineDash([5]);
          ctx.strokeStyle = rectColor;
          ctx.strokeRect(rectX, rectY, rectW, rectH);
          // ctx.fillRect(rectX, rectY, rectW, rectH);

          ctx.stroke();
          ctx.font = "70px Arial";
          ctx.fillStyle = "grey";
          for (let i = 0; i < boundingRect.right; i += 3000) {
            ctx.fillText(node.label, filePosition.x + i, filePosition.y);
          }
          ctx.stroke();
          ctx.restore()
        })
      } catch (ex) {

      }
    })
    this.chart.setBlurNodeEvent((event: any) => {
      let hoveredId = event.node
      let nonConnectedIds = this.chart.getNotConnectedNodes(hoveredId)
      let unbluredNodes = nonConnectedIds.nodes.map(nodeId => {
        let node = this.chart.getItem(nodeId) as Node
        if (!node['previousStyle']) return node
        let nodePosition = this.chart.getPosition(nodeId)
        node = Object.assign({}, node['previousStyle'], nodePosition, { font: { color: 'black' } })
        node['previousStyle'] = undefined
        return node
      }) as Node[]
      let unbluredEdges = nonConnectedIds.edges.map(i => {
        let edge = this.chart.getItem(i) as Node
        if (!edge['previousStyle']) return i
        let newEdge = Utils.deepCopy(edge['previousStyle'])
        return edge['previousStyle']
      })
      this.chart.nodes.update(unbluredNodes)
      this.chart.edges.update(unbluredEdges)
    })

    this.chart.setHoverNodeEvent((event: any) => {
      let hoveredId = event.node
      let nonConnectedIds = this.chart.getNotConnectedNodes(hoveredId)
      let bluredNodes: Node[] = nonConnectedIds.nodes.map(nodeId => {
        let node = this.chart.getItem(nodeId) as Node
        let previousStyle = JSON.parse(JSON.stringify(node))
        return Object.assign({ id: nodeId }, ChartStyles.dimmedNode, { previousStyle: previousStyle }) as Node
      })

      let bluredEdges = nonConnectedIds.edges.map(edgeId => {
        let edge = this.chart.getItem(edgeId) as Edge
        let previousStyle = JSON.parse(JSON.stringify(edge))
        return Object.assign({ id: edgeId }, ChartStyles.dimmedLink, { previousStyle: previousStyle })
      })

      this.chart.nodes.update(bluredNodes)
      this.chart.edges.update(bluredEdges)
    })
  }

  public messageBoxQueue: messageBoxItem[] = [];

  public addMessage(title, message, displayTime) {
    this.messageBoxQueue.push({ title: title, message: message, displayTime: displayTime });
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
    this.titleElement.focus();
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

  public linkNodes(linkType) {
    let linkedNodesIds = this.chart.getSelection().nodes;
    // linkedNodesIds.map(id => this.chart.getItem(id)).forEach(node => this.chartActions.setPathNode(node));
    let linkedToNode = linkedNodesIds.pop();
    let newLinks = [];
    linkedNodesIds.forEach(nodeId => {
      newLinks.push(this.chart.createLink(nodeId, linkedToNode, ChartStyles.linkTypes[linkType]));
    });
    this.chartActions.addNodesToChart(newLinks);
  }

  public reload() {
    this.saveLoad.reload();
  }

  public clearVisiIds() {
    this.http.post('http://localhost:2900' + EndPoints.clearVisiIds, {}).subscribe((response) => {
      console.log('clear visi ids response', response);
    });
  }

  public rewriteVisiIds() {
    this.http.post('http://localhost:2900' + EndPoints.rewriteVisiIds, {}).subscribe((response) => {
      console.log('rewrite visi ids response', response);
    });
  }

  public fullSaveToFile() {
    this.saveLoad.fullSaveToFile();
  }

  public jsonSave() {
    this.saveLoad.saveChartToJson();
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

  private regexs = [
    { 'remark': 'add /s as regex option so . catptures new line as well' },
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

}
