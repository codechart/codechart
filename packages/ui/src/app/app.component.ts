///aaaa///
import {Component, OnInit, AfterViewInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SearchActions} from "./search/search.actions";
import {ChartStyles, NodeColors} from "./chart/chart.styles";
import {StartSearchJson, TypeMapping, typesMapping} from "./chart/jsons";
import {JsonPipe} from "@angular/common";
import {Network, DataSet, Node, Edge, IdType} from 'vis'
import {ChartWrapper} from "./chart/chart.wrapper";
import {ChartUtils, AttributesKey} from "./chart/chart.utils";
import {ChartActions} from "./chart/chart.actions";


export interface CurrentFile {content:string, name:string, lines:string[], node:Node | Edge}

import * as $ from 'jquery'
import {CreateUtils} from "./chart/create.utils";
import {SaveLoad} from "./chart/save.load";
import {
  MatchInfo, SaveNode, SaveJson, CreateTypes, FindInFilesResponse, SaveNodesResponse,
  EndPoints, SearchJson
} from "./types.nodejs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [JsonPipe]
})
export class AppComponent implements OnInit, AfterViewInit {
  public chart:ChartWrapper = new ChartWrapper()
  public chartActions = new ChartActions(this)
  public searchActions = new SearchActions(this)
  public saveLoad = new SaveLoad(this, this.http)

  private _searchJson:SearchJson = StartSearchJson

  public shapeTypes = Object.keys(ChartStyles.nodesTypes)
  public linkTypes = Object.keys(ChartStyles.linkTypes)
  public nodesColors = NodeColors


  public typesMapping:TypeMapping[] = null

  public currentFile:CurrentFile = null
  public fileElement:HTMLTextAreaElement = null
  private linesElement:HTMLElement = null;
  private fileContainer: HTMLElement;

  public titleElement:HTMLElement = null

  public previousSelectedNode:Node | Edge = null;
  public previousDblClickedNode:Node | Edge = null;
  public lastDblClickedNode:Node | Edge = null;

  public _markedText:string = null
  public resultIndex = 0;

  constructor(public http:HttpClient, private jsonPipe:JsonPipe) {
    console.log(this.shapeTypes)
    this.searchJson = StartSearchJson
    this.typesMapping = typesMapping
  }

  ngAfterViewInit():void {
    this.chartActions.initialize()
    this.chart.initialize()
    this.searchActions.initialize()
    this.saveLoad.initialize()
  }

  public set searchJson(value: SearchJson) {
    this._searchJson = value
  }

  public get searchJson(): SearchJson {
    return this._searchJson
  }

  setFileSelection(index, selectionLength, lineNumber) {
    this.fileElement.focus()
    this.fileElement.selectionStart = index
    this.fileElement.selectionEnd = index + selectionLength
    let lineHeight = parseInt(this.fileElement.style.lineHeight)
    this.fileContainer.scrollTop = lineHeight*(parseInt(lineNumber)-20)
  }

  public getLinesNumbersText(file: CurrentFile) : string {
    if(!file) return ""
    return file.lines.map((line, index)=>{return index}).join('\n')
  }

  set selectedNode(element:Node | Edge) {
    this.previousSelectedNode = this.selectedNode
    if (element == null || element===undefined) {
      return
    }
    console.log('selected:', element)

    let elementAtts = this.chart.getAttributes(element)
    if (ChartUtils.isFileNode(element)) {
      this.setCurrentFile({
        content: elementAtts.fileContent,
        name: this.chart.getTitle(element),
        node: element,
        lines: elementAtts.fileContent.split('\n')
      })
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
        })
      } else {
        this.currentFile = null
      }
    }

    setTimeout(()=>{
        if (ChartUtils.isNode(element)) {
          if(ChartUtils.isOfFile(element)) {
            let attributes = ChartUtils.getAttributes(element) as MatchInfo
            this.setFileSelection(attributes.indexInLine + attributes.lineStartIndex, attributes.value.length, attributes.lineNumber)
          } else if(ChartUtils.isFileNode(element)) {
            this.setFileSelection(0, 0, 0)
          }
        }
      }, 0)
  }


  public setCurrentFile(fileObject: CurrentFile) {
    this.currentFile = {
      content: fileObject.content.replace('\r\n', '\n'),
      name: fileObject.name,
      node: fileObject.node,
      lines: fileObject.lines
    }
  }

  public createMatchFromSelection() {
    let ofFileNodeId = ChartUtils.isFileNode(this.selectedNode as Node) ? this.selectedNode.id : ChartUtils.getOfFile(this.selectedNode as Node)
    let match: MatchInfo = CreateUtils.createMatchFromSelection(
      ofFileNodeId,
      this.fileElement.innerHTML,
      window.getSelection().toString(),
      this.fileElement.selectionStart,
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

  private doubleClickOnNode(node:IdType) {
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
      if(selectedEdges.length === 1) return this.chart.edges.get(selectedEdges[0]) as Edge
      else return null
    }
  }

  ngOnInit():void {
    this.fileElement = document.getElementById('fileContent') as HTMLTextAreaElement
    this.titleElement = document.getElementById('nodeTitle') as HTMLElement
    this.fileContainer = document.getElementById('fileContainer') as HTMLElement
    this.fileElement.onkeydown = (e) => {
      if (e.ctrlKey) return
      e.preventDefault()
    }
    this.fileElement.onselect = (e) => {
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
    this.chartActions.clearChart()
  }

  public createShape(shapeType:string) {
    this.selectedNode = this.chartActions.createShape(this.selectedNode, shapeType)
    this.titleElement.focus()
  }as

  public setTitle(event) {
    if(!this.selectedNode) return
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
    linkedNodesIds.map(id=>this.chart.getItem(id)).forEach(node=>this.chartActions.setPathNode(node))
    let linkedToNode = linkedNodesIds.pop()
    let newLinks = []
    linkedNodesIds.forEach(nodeId=> {
      newLinks.push(this.chart.createLink(nodeId, linkedToNode, ChartStyles.linkTypes[linkType]))
    })
    this.chartActions.addNodesToChart(newLinks)
  }

  public reload() { this.saveLoad.reload()}

  public clearVisiIds() {
    this.http.post('http://localhost:2900'+EndPoints.clearVisiIds, {}).subscribe((response) => {
      console.log('clear visi ids response', response)
    })
  }

  public rewriteVisiIds() {
    this.http.post('http://localhost:2900'+EndPoints.rewriteVisiIds, {}).subscribe((response) => {
      console.log('rewrite visi ids response', response)
    })
  }

  public saveToFile() { this.saveLoad.saveToFile()}

  public loadFromFile(event) {
    var file = event.srcElement.files[0];
    if (file) {
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (evt) => {
        let loaded:{nodes: Node[], edges: Edge[]} = (JSON.parse(evt.target['result']))
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
    {"remark": "add /s as regex option so . catptures new line as well"},
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
