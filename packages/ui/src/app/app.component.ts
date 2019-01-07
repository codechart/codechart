///aaaa///
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { SearchActions } from "./search/search.actions";
import { ChartStyles, NodeColors } from "./chart/chart.consts";
import { StartSearchJson, TypeMapping, typesMapping } from "./chart/jsons";
import { JsonPipe } from "@angular/common";
import { Network, DataSet, Node, Edge, IdType } from 'vis'
import { ChartWrapper } from "./chart/chart.wrapper";
import { ChartUtils, AttributesKey } from "./chart/chart.utils";
import { ChartActions } from "./chart/chart.actions";


export interface CurrentFile { content: string, name: string, lines: string[], node: Node | Edge }

import * as $ from 'jquery'
import { CreateUtils } from "./chart/create.utils";
import { SaveLoad } from "./chart/save.load";
import {
  MatchInfo, SaveNode, SaveJson, CreateTypes, FindInFilesResponse, SaveNodesResponse,
  EndPoints, SearchJson
} from "./types.nodejs";
import { keyframes } from '@angular/core/src/animation/dsl';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [JsonPipe]
})
export class AppComponent implements OnInit, AfterViewInit {
  public chart: ChartWrapper = new ChartWrapper()
  public chartActions = new ChartActions(this)
  public searchActions = new SearchActions(this)
  public saveLoad = new SaveLoad(this, this.http)

  private _searchJson: SearchJson = StartSearchJson
  public selectedNodeSize: string = ""

  public shapeTypes = Object.keys(ChartStyles.nodesTypes)
  public linkTypes = Object.keys(ChartStyles.linkTypes)
  public nodesColors = NodeColors


  public typesMapping: TypeMapping[] = null

  public currentFile: CurrentFile = null
  public fileElement: HTMLTextAreaElement = null
  private fileContainer: HTMLElement;

  public titleElement: HTMLElement = null

  public previousSelectedNode: Node | Edge = null;
  public previousDblClickedNode: Node | Edge = null;
  public lastDblClickedNode: Node | Edge = null;

  public _markedText: string = null
  public resultIndex = 0;

  constructor(public http: HttpClient, private jsonPipe: JsonPipe) {
    console.log(this.shapeTypes)
    this.searchJson = StartSearchJson
    this.typesMapping = typesMapping
  }

  ngAfterViewInit(): void {
    this.chartActions.initialize()
    this.chart.initialize()
    this.searchActions.initialize()
    this.saveLoad.initialize()

    window['chart'] = this.chart.chart
  }

  public set searchJson(value: SearchJson) {
    this._searchJson = value
  }

  public get searchJson(): SearchJson {
    return this._searchJson
  }

  set selectedNode(element: Node | Edge) {
    this.previousSelectedNode = this.selectedNode
    if (element == null || element === undefined) {
      this.currentFile = null
      return
    }
    console.log('selected:', element)


    let selectedSize = ChartUtils.getElementSize(element)
    this.selectedNodeSize = selectedSize ? (selectedSize.toString()) : ""

    let selectTextInFile = () => {
      if (ChartUtils.isNode(element)) {
        if (ChartUtils.isOfFile(element)) {
          let attributes = ChartUtils.getAttributes(element) as MatchInfo
          this.setFileSelection(attributes.lineNumber + 1)
        } else if (ChartUtils.isFileNode(element)) {
          this.setFileSelection(1)
        }
      }
    }

    // set file element
    let elementAtts = this.chart.getAttributes(element)
    if (ChartUtils.isFileNode(element)) {
      this.setCurrentFile({
        content: elementAtts.fileContent,
        name: this.chart.getTitle(element),
        node: element,
        lines: elementAtts.fileContent.split('\n')
      }, selectTextInFile)
    } else {
      if (ChartUtils.isOfFile(element)) {
        let elementAtts = this.chart.getAttributes(element)
        let connectedToFileNode = this.chart.getNode(elementAtts.ofFile)
        let fileContent = this.chart.getAttributes(connectedToFileNode).fileContent
        this.setCurrentFile({
          content: fileContent,
          name: this.chart.getTitle(connectedToFileNode),
          node: connectedToFileNode as Node,
          lines: fileContent.split('\n')
        }, selectTextInFile)
      } else {
        this.currentFile = null
      }
    }
  }

  setSelectedNodesSize(size) {
    if (parseInt('size') === NaN) return
    this.chart.setSize(this.chart.getSelection(), parseInt(size))
  }

  setEdgePoint(left: boolean, right: boolean) {
    this.chart.setArrows(this.chart.getSelection(), left, right)
  }

  public currentLineElement = null

  public setFileSelection(lineNumber) {
    if (this.currentLineElement !== null) {
      this.currentLineElement.style.border = ""
    }

    this.currentLineElement = document.querySelectorAll('[data-line-number=\"' + lineNumber + '\"]')[0].parentElement.parentElement.lastChild
    this.currentLineElement.style.border = "1px solid"

    var $container = $('#fileContainer'),
      $scrollTo = $('[data-line-number=\"' + lineNumber + '\"]');

    $container.scrollTop(
      $scrollTo.offset().top - $container.offset().top + $container.scrollTop() - 30
    );
  }

  public performSearch(inputKeyEvent: any) {
    console.log(inputKeyEvent)
    if(inputKeyEvent.code=="Enter") {
      if(inputKeyEvent.ctrlKey) this.searchActions.searchSelectedFile()
      else if(inputKeyEvent.shiftKey) this.searchActions.contentSearch()
      else {
        this.searchActions.totalSearch()
      }
    }
  }

  public getLinesNumbersText(file: CurrentFile): string {
    if (!file) return ""
    return file.lines.map((line, index) => { return index }).join('\r\n')
  }

  public setCurrentFile(fileObject: CurrentFile, callback: () => void) {
    if (this.currentFile !== null && this.currentFile.name === fileObject.name) {
      callback()
      return
    }

    this.currentFile = {
      content: fileObject.content,
      name: fileObject.name,
      node: fileObject.node,
      lines: fileObject.lines
    }
    setTimeout(() => {
      window['hljs'].lineNumbersBlock($('code')[0])
      window['hljs'].highlightBlock($('code')[0])
      setTimeout(() => { callback() }, 0)
    }, 0)

  }

  public noSelectedNode() {
    console.log('no node selected')
  }

  public createMatchFromSelection() {
    if(this.selectedNode===null) {
      this.noSelectedNode()
      return
    }
    let ofFileNodeId = ChartUtils.isFileNode(this.selectedNode as Node) ? this.selectedNode.id : ChartUtils.getOfFile(this.selectedNode as Node)
    let selection = window.getSelection()
    let parentRow = window.getSelection().focusNode.parentElement.parentElement.parentElement
    let textLengthTillNow = 0
    for (let previousRow: HTMLElement = parentRow.previousSibling as HTMLElement;
      previousRow !== null;
      previousRow = previousRow.previousSibling as HTMLElement) {
      textLengthTillNow += (previousRow.lastChild as HTMLElement).innerText.length
    }

    let match: MatchInfo = CreateUtils.createMatchFromSelection(
      ofFileNodeId,
      this.fileElement.innerText,
      selection.toString(),
      textLengthTillNow + selection.focusOffset,
      this.chart
    )
    let nodes = CreateUtils.createMatchNode(match, ofFileNodeId, this.chart, this.selectedNode as Node)
    this.chartActions.addNodesToChart(nodes)
  }

  public connectNodesInsideContent() {
    this.chartActions.connectNodeToMatchesInContent(this.selectedNode as Node)
  }

  set markedText(text) {
    this.searchJson.pattern = text
    this._markedText = text
  }

  get markedText() {
    return this._markedText
  }

  private doubleClickOnNode(node: IdType) {
    this.chartActions.setPathNode(this.chart.getItem(node))
    this.previousDblClickedNode = this.lastDblClickedNode
    this.lastDblClickedNode = this.chart.getItem(node) as Node
  }

  get selectedNode(): Node | Edge {
    if (!this.chart) return null
    let selectedIds = this.chart.getSelection()
    let selectedNodes = selectedIds.nodes
    let selectedEdges = selectedIds.edges
    if (selectedNodes.length === 1) return this.chart.nodes.get(selectedNodes[0]) as Node
    else {
      if (selectedEdges.length === 1) return this.chart.edges.get(selectedEdges[0]) as Edge
      else return null
    }
  }

  ngOnInit(): void {
    this.fileElement = document.getElementById('fileContent') as HTMLTextAreaElement
    this.titleElement = document.getElementById('nodeTitle') as HTMLElement
    this.fileContainer = document.getElementById('fileContainer') as HTMLElement
    this.fileElement.onkeydown = (e) => {
      if (e.ctrlKey) return
      e.preventDefault()
    }
    this.fileElement.onmouseup = (e) => {
      let markedText = window.getSelection().toString()
      if (markedText === undefined || markedText === null || markedText.length === 0)
        this.searchJson.isRegex = false
      this.markedText = window.getSelection().toString()
    }

    let chartElement = document.getElementById('vis_element')
    this.chart.setUp(chartElement)
    this.chart.setClickEvent((clickedItem, clickedId) => {
      this.selectedNode = clickedItem
    })
    this.chart.setDoubleClickEvent((clickedItem, event) => {
      this.doubleClickOnNode(event.nodes[0])
      console.log('dblclick on vla. clicked Id:', event)
      return true
    })
    this.chart.setKeyboardDeleteEvent((e) => {
      if (e.keyCode == 46) { // delete button pressed
        this.chartActions.deleteSelected()
      }
    })

  }

  public clearChart() {
    this.currentFile = null
    this.chartActions.clearChart()
  }

  public createShape(shapeType: string) {
    this.selectedNode = this.chartActions.createShape(this.selectedNode, shapeType)
    this.titleElement.focus()
  }

  public setTitle(event) {
    if (!this.selectedNode) return
    this.chart.setTitle(this.selectedNode, event.target.value)
  }

  public setSelecteionColor(color) {
    this.chart.setColor(this.chart.getSelection(), color)
  }

  public undo() {
    this.chartActions.undo()
  }

  public linkNodes(linkType) {
    let linkedNodesIds = this.chart.getSelection().nodes
    linkedNodesIds.map(id => this.chart.getItem(id)).forEach(node => this.chartActions.setPathNode(node))
    let linkedToNode = linkedNodesIds.pop()
    let newLinks = []
    linkedNodesIds.forEach(nodeId => {
      newLinks.push(this.chart.createLink(nodeId, linkedToNode, ChartStyles.linkTypes[linkType]))
    })
    this.chartActions.addNodesToChart(newLinks)
  }

  public reload() { this.saveLoad.reload() }

  public clearVisiIds() {
    this.http.post('http://localhost:2900' + EndPoints.clearVisiIds, {}).subscribe((response) => {
      console.log('clear visi ids response', response)
    })
  }

  public rewriteVisiIds() {
    this.http.post('http://localhost:2900' + EndPoints.rewriteVisiIds, {}).subscribe((response) => {
      console.log('rewrite visi ids response', response)
    })
  }

  public saveToFile() { this.saveLoad.saveToFile() }

  public loadFromFile(event) {
    var file = event.srcElement.files[0];
    if (file) {
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (evt) => {
        let loaded: { nodes: Node[], edges: Edge[] } = (JSON.parse(evt.target['result']))
        this.saveLoad.load(loaded)
      }
      reader.onerror = (evt) => {
        console.log('error reading file');
      }
      (document.getElementById('fileLoadInput') as HTMLInputElement).value = ''
    }
  }

  public clearDimmed() {
    this.chartActions.clearDimmed();
  }

  regexs = [
    { "remark": "add /s as regex option so . catptures new line as well" },
    {
      "title": "get all functions location",
      "regex": "(public|private) (.+)\(.+\).*{"
    },
    {
      "title": "get specific function location",
      "regex": "(public|private)\s*(__functionName___)\(.+\).*{",
      "example": "(public|private)\s*(isIdNode)\(.+\).*{"
    },
    {
      "title": "get specific function content",
      "regex": "(public|private)\s*(__functionName___)\(.+\).*{",
      "example": "(public|private)\s*(isIdNode)\(.+\).*{"
    }

  ]

}
