import {Component, OnInit, AfterViewInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {VlaActions} from "./other/vlaActions";
import {SearchActions} from "./other/searchActions";
import {VlaStyles, Consts, ChartWrapper, ChartUtils} from "./other/vla.styles";
import {TypesMapping, StartSearchJson} from "./other/jsons";
import {JsonPipe} from "@angular/common";
import {Network, DataSet, Node, Edge, IdType} from 'vis'

export interface FindInFilesResponse {file:string, content:string, matches:string[]}
export interface TypeMapping {type:string, regexCondition:string, titleExtraction:string, style:any}
export interface SearchJson { title:string, pattern:string, flags:string, path:string, fileExtensions:string, isRegex: boolean}
export interface MatchInfo {line:string, value:string, lineNumber:number, index:number}
export interface CurrentFile {content:string, name:string, lines:string[], node:Node | Edge}

import * as $ from 'jquery'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [JsonPipe]
})
export class AppComponent implements OnInit, AfterViewInit {
  public chart:ChartWrapper = new ChartWrapper()
  public vlaActions = new VlaActions(this)

  private _searchJson:SearchJson = StartSearchJson

  public shapeTypes = Object.keys(VlaStyles.nodesTypes)
  public linkTypes = Object.keys(VlaStyles.linkTypes)


  public searchActions = new SearchActions(this)

  public typesMapping:TypeMapping[] = null

  public currentFile:CurrentFile = null
  public fileElement:HTMLTextAreaElement = null
  public titleElement:HTMLElement = null
  public previousSelectedNode:Node | Edge = null;
  public previousDblClickedNode:Node | Edge = null;
  public lastDblClickedNode:Node | Edge = null;

  public _markedText:string = null
  private linesElement:HTMLElement = null;
  public resultIndex = 0;

  constructor(public http:HttpClient, private jsonPipe:JsonPipe) {
    console.log(this.shapeTypes)
    this.searchJson = StartSearchJson
    this.typesMapping = TypesMapping
  }

  ngAfterViewInit():void {
    // this.vlaActions.addNodesToChart([this.vlaActions.createNode('_start', 'START', {e: 3, b: 'orange'})])
  }

  public set searchJson(value: SearchJson) {
    this._searchJson = value
  }

  public get searchJson(): SearchJson {
    return this._searchJson
  }

  set selectedNode(element:Node | Edge) {
    this.previousSelectedNode = this.selectedNode
    if (element == null || element===undefined) {
      return
    }
    console.log('selected:', element)

    let elementAtts = this.chart.getAttributes(element)
    if (elementAtts.type === 'file') {
      this.currentFile = {
        content: elementAtts.fileContent,
        name: this.chart.getTitle(element),
        node: element,
        lines: elementAtts.fileContent.split('\n')
      }
    } else {
      if (ChartUtils.isOfFile(element)) {
        let elementAtts = this.chart.getAttributes(element)
        let connectedToFileNode = this.chart.getNode(elementAtts.ofFile)
        this.currentFile = {
          content: this.chart.getAttributes(connectedToFileNode).fileContent,
          name: this.chart.getTitle(connectedToFileNode),
          node: connectedToFileNode as Node,
          lines: this.chart.getTitle(element).split('\n')
        }
      } else {
        this.currentFile = null
      }

      let elementAtts = this.chart.getAttributes(element)
      setTimeout(() => {
        if (ChartUtils.isNode(element) && ChartUtils.isOfFile(element)) {
          this.fileElement.focus()
          this.fileElement.selectionStart = elementAtts.index
          this.fileElement.selectionEnd = elementAtts.index + this.chart.getTitle(element).length
          this.fileElement.scrollTop = parseInt(this.fileElement.style.lineHeight) * (parseInt(elementAtts.lineNumber) - 2)
          this.linesElement.scrollTop = parseInt(this.fileElement.style.lineHeight) * (parseInt(elementAtts.lineNumber) - 2)
        }
        // this.fileElement.blur()
      }, 200)
    }
  }

  set markedText(text) {
    this.searchJson.pattern = text
    this._markedText = text
  }

  get markedText() {
    return this._markedText
  }

  private doubleClickOnNode(node:Node | Edge) {
    this.previousDblClickedNode = this.lastDblClickedNode
    this.lastDblClickedNode = node
    this.setNodeStyleNormal(node)
    this.toggleNodeLock(node)
  }

  private toggleNodeLock(node) {
    node = node as Node
    if (node.d.locked) {
      node.d.locked = false
      this.vlaActions.loadNodePrevStyle(node)
    }
    else {
      node.d.locked = true
      this.vlaActions.setNodeStyleAndSave(node, VlaStyles.lockedNode)
    }
    this.chart.setProperties(node)
  }

  private setNodeStyleNormal(clickedItem:Node | Edge) {
    // set clicked node and link to previous link size to 1
    if (this.chart.getAttributes(clickedItem).locked) {
      return
    }
    let resizeNodesAndLinks:Array<Node | Edge> = []
    if (clickedItem instanceof Node) {
      this.chart.setNodeSize(clickedItem, 1)
      resizeNodesAndLinks.push(clickedItem)
      if (this.previousSelectedNode !== null && !this.selectedNode === null) {
        this.chart.getNeighbours(this.selectedNode.id).edges.forEach((link) => {
          let linkItem = this.chart.getItem(link) as Edge
          if ((ChartUtils.getEdgeFrom(linkItem) === this.selectedNode.id && ChartUtils.getEdgeFrom(linkItem) === this.previousSelectedNode.id)
            ||
            (ChartUtils.getEdgeFrom(linkItem) === this.selectedNode.id && ChartUtils.getEdgeFrom(linkItem) === this.previousSelectedNode.id)) {
            resizeNodesAndLinks.push(Object.assign(linkItem, {w: 1}))
          }
        })
      }
    } else {
      this.chart.setEdgeSize(clickedItem as Edge, 1)
      resizeNodesAndLinks.push(clickedItem)
    }
    this.chart.setProperties(resizeNodesAndLinks)
  }

  get selectedNode(): Node | Edge {
    if (!this.chart) return null
    let selectedIds = this.chart.getSelection()
    let selectedNodes = selectedIds.nodes
    let selectedEdges = selectedIds.edges
    if (selectedNodes.length === 1) return this.chart.nodes.get(selectedNodes[0]) as Node
    else {
      if(selectedEdges.length === 1) return this.chart.nodes.get(selectedEdges[0]) as Edge
      else return null
    }
  }

  ngOnInit():void {
    this.fileElement = document.getElementById('fileContent') as HTMLTextAreaElement
    this.titleElement = document.getElementById('nodeTitle') as HTMLElement
    this.linesElement = document.getElementById('linesContainer') as HTMLElement
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
    this.chart.setDoubleClickEvent((clickedItem, clickedId) => {
      this.doubleClickOnNode(clickedItem)
      console.log('dblclick on vla. clicked Id:', clickedId)
      return true
    })
    this.chart.setKeyboardDeleteEvent((e) => {
      if (e.keyCode == 46) { // delete button pressed
        this.vlaActions.deleteSelected()
      }
    })
  }

  public getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  public clearChart() {
    this.vlaActions.clearChart()
  }

  public createShape(shapeType:string) {
    this.selectedNode = this.vlaActions.createShape(this.selectedNode, shapeType)
    this.titleElement.focus()
  }

  public setTitle(event) {
    this.chart.setTitle(this.selectedNode, event.target.value)
  }

  public loadDataFromFindInFiles(response:FindInFilesResponse[]) {
    console.log('find in files response', response)
    let addedNodesAndLinks = []
    response.forEach(file => {
      let fileNodeId = file.file
      let fileValue = file.file
      let fileNode = this.chart.createNode(fileNodeId, fileValue, VlaStyles.fileNode)
      ChartUtils.setNodeAttributes(fileNode, {fileContent: file.content, level: 0})
      addedNodesAndLinks.push(fileNode)

      file.matches.forEach((match:any) => {
        let matchNodes = this.vlaActions.createMatchNode(match, fileNodeId)
        matchNodes = matchNodes.map(item=> {
          return JSON.parse(JSON.stringify(item))
        })
        addedNodesAndLinks = addedNodesAndLinks.concat(matchNodes)
      })
    })

    this.vlaActions.addNodesToChart(addedNodesAndLinks)
  }

  public undo() {
    this.vlaActions.undo()
  }

  public linkNodes(linkType) {
    let linkedNodesIds = this.chart.getSelection().nodes
    linkedNodesIds.map(id=>this.chart.getItem(id)).forEach(node=>this.vlaActions.setPathNode(node))
    let linkedToNode = linkedNodesIds.pop()
    let newLinks = []
    linkedNodesIds.forEach(nodeId=> {
      newLinks.push(this.chart.createLink(nodeId, linkedToNode, VlaStyles.linkTypes[linkType]))
    })
    this.vlaActions.addNodesToChart(newLinks)
  }

  public saveToFile() {
    let jsonContent = {}

    let fileJson = "data:text/json;charset=utf-8," + JSON.stringify(jsonContent)
    let encodedUri = encodeURI(fileJson);
    let link = document.createElement('a');
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", 'a' + ".json");
    document.body.appendChild(link); // Required for FF
    link.click(); // This will download the data file named "my_data.csv".
    document.body.removeChild(link)
  }

  public loadFromFile(event) {
/*
    var file = event.srcElement.files[0];
    if (file) {
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (evt) => {
        let loaded:FileJson = (JSON.parse(evt.target['result'])) as FileJson
        console.log('loading nodes', loaded.nodes)
        this.vlaActions.addNodesToChart(loaded.nodes, {setColor: false});
        this.resultsHistory = loaded.resultsHistory
      }
      reader.onerror = (evt) => {
        console.log('error reading file');
      }
    }
*/
  }

  public clearDimmed() {
    this.vlaActions.clearDimmed();
  }

  public saveTypeMapping(value) {
    this.typesMapping = JSON.parse(value)
  }

  public getNodeContent(node):{ content:string, startIndex:number, endIndex:number } {
    if (this.currentFile === null) {
      console.log('no file selected')
      return
    }
    let index = node.d.index
    let stopConditionMax = 10000
    let stopCondition = 0
    let fileContent = this.currentFile.content
    while (fileContent.charAt(index) !== '{' && stopCondition < stopConditionMax) {
      index++
      stopCondition++
    }
    let startIndex = index;
    index++
    let count = 1
    while (count != 0 && stopCondition < stopConditionMax) {
      if (fileContent.charAt(index) === '{') count++
      else if (fileContent.charAt(index) === '}') count--
      index++
      stopCondition++
    }
    let endIndex = index + 1
    return {
      content: this.currentFile.content.substring(startIndex, endIndex),
      startIndex: startIndex,
      endIndex: endIndex
    }
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
