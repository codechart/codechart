import {Component, OnInit, AfterViewInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {VlaActions} from "./other/vlaActions";
import {SearchActions} from "./other/searchActions";
import {VlaStyles, VlaExcludedFieldsWhenSavingJson, ChartWrapper, ChartData, ChartUtils} from "./other/vla.styles";
import {TypesMapping, SearchJson} from "./other/jsons";
import {JsonPipe} from "@angular/common";
import {Network, DataSet, Node, Edge, IdType} from 'vis'

export interface FindInFilesResponse {file:string, content:string, matches:string[]}
export interface TypeMapping {type:string, regexCondition:string, titleExtraction:string, style:any}
export interface SearchJson { title:string, pattern:string, flags:string, path:string, fileExtensions:string}
export interface MatchInfo {line:string, value:string, lineNumber:number, index:number}
export interface FileJson {nodes:any, resultsHistory:HistoryItem[]}
export interface HistoryItem {results:any, searchJson:SearchJson, color:string}
export interface CurrentFile {content:string, name:string, lines:string[], node:Node | Edge}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [JsonPipe]
})
export class AppComponent implements OnInit, AfterViewInit {
  public chart:ChartWrapper = new ChartWrapper()
  public vlaActions = new VlaActions(this)

  private _searchJson:SearchJson = null
  public _reduceSizeOfOldNodes = false

  public shapeTypes = Object.keys(VlaStyles.nodesTypes)
  public linkTypes = Object.keys(VlaStyles.linkTypes)


  public searchActions = new SearchActions(this)

  public allData: ChartData = new ChartData()
  public typesMapping:TypeMapping[] = null

  public currentFile:CurrentFile = null
  public _visibleNodeProps:any = {};
  public fileElement:HTMLTextAreaElement = null
  public titleElement:HTMLElement = null
  public resultsHistory:HistoryItem[] = [];
  public previousSelectedNode:Node | Edge = null;
  public previousDblClickedNode:Node | Edge = null;
  public lastDblClickedNode:Node | Edge = null;
  public _markedText:string = null
  private linesElement:HTMLElement = null;
  public level = 0;

  constructor(public http:HttpClient, private jsonPipe:JsonPipe) {
    console.log(this.shapeTypes)
    this.searchJson = SearchJson
    this.typesMapping = TypesMapping
    this.resultsHistory = []
  }

  ngAfterViewInit():void {
    // this.vlaActions.addNodesToChart([this.vlaActions.createNode('_start', 'START', {e: 3, b: 'orange'})])
  }

  public set reduceSizeOfOldNodes(shouldReduce:boolean) {
    this._reduceSizeOfOldNodes = shouldReduce
  }

  public get reduceSizeOfOldNodes() {
    return this._reduceSizeOfOldNodes
  }

  public set searchJson(value) {
    this._searchJson = value
  }

  public get searchJson() {
    return this._searchJson
  }

  set selectedNode(element:Node | Edge) {
    this.previousSelectedNode = this.selectedNode
    if (element == null || element===undefined) {
      this.visibleNodeProps = {}
      return
    }
    console.log('selected element', element)

    let elementAtts = this.chart.getAttributes(element)
    if (elementAtts.type === 'file') {
      this.currentFile = {
        content: elementAtts.fileContent,
        name: this.chart.getTitle(element),
        node: element,
        lines: elementAtts.fileContent.split('\n')
      }
      this.visibleNodeProps = Object.assign(element, {d: Object.assign(elementAtts, {fileContent: 'not displayed'})})
    } else {
      if (this.isOfFile(element)) {
        let elementAtts = this.chart.getAttributes(element)
        let connectedToFileNode = this.chart.getNode(this.chart.getAttributes(element).ofFile)
        this.currentFile = {
          content: elementAtts.fileContent,
          name: this.chart.getTitle(element),
          node: connectedToFileNode as Node,
          lines: this.chart.getTitle(element).split('\n')
        }
      } else {
        this.currentFile = null
      }

      this.visibleNodeProps = Object.assign({}, element)
      let elementAtts = this.chart.getAttributes(element)
      setTimeout(() => {
        if (this.isNode(element) && this.isOfFile(element)) {
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

  set visibleNodeProps(props:any) {
    VlaExcludedFieldsWhenSavingJson.forEach(fieldName => {
      delete props[fieldName]
    })
    this._visibleNodeProps = Object.assign(props)
  }

  get visibleNodeProps() {
    return this.jsonPipe.transform(this._visibleNodeProps)
  }

  isNode(node) {
    return node.type === 'node'
  }

  isOfFile(node) {
    return node.d.ofFile
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

  get selectedNode():Node | Edge {
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
      if (e.key === 'Delete' && this.selectedNode !== null) {
        this.chart.deleteItems(this.chart.getSelection().nodes)
      }
    }
    this.fileElement.onselect = (e) => {
      this.markedText = window.getSelection().toString()
    }

    let chartElement = document.getElementById('vis_element')
    this.chart.setUp(chartElement)
    this.chart.setClickEvent((clickedItem, clickedId)=> {
      this.selectedNode = clickedItem
      console.log('click on vla. clicked Id:', clickedId)
      return {}
    })
    this.chart.setDoubleClickEvent((clickedItem, clickedId) => {
      this.doubleClickOnNode(clickedItem)
      console.log('dblclick on vla. clicked Id:', clickedId)
      return true
    })

    this.vlaActions.createAndSelectStartNode()

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

  public setSelectedNodeJson(nodeJson) {
    nodeJson = JSON.parse(nodeJson)
    VlaExcludedFieldsWhenSavingJson.forEach(fieldName => {
      delete nodeJson[fieldName]
    })
    this.chart.setProperties(Object.assign(this.selectedNode, nodeJson))
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
      let fileNode = this.chart.createNode(fileNodeId, fileValue, {
        d: {fileContent: file.content, level: 0}
      })
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
    if (!this.resultsHistory.length) {
      console.log('reaced start of history')
      this.vlaActions.createAndSelectStartNode()
      return
    }
    this.allData = this.resultsHistory.shift().results
    this.reload()
  }

  public linkNodes(linkType) {
    let linkedNodes = this.chart.getSelection().nodes
    let linkedToNode = linkedNodes.pop()
    let newLinks = []
    linkedNodes.forEach(nodeId=> {
      newLinks.push(this.chart.createLink(nodeId, linkedToNode, VlaStyles.linkTypes[linkType]))
    })
    this.vlaActions.addNodesToChart(newLinks)
  }

  public saveToFile() {
    let jsonContent:FileJson = {nodes: this.chart.convertToJson(), resultsHistory: this.resultsHistory}
    jsonContent.nodes = []

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
  }

  public recenter() {
    this.chart.recenter(this.chart.getSelection().nodes[0]);
  }

  public reload() {
    this.chart.reload()
    console.log('added nodes and links', this.allData)
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
