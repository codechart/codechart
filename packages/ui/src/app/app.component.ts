import {Component, OnInit, AfterViewInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import Link = KeyLines.Link;
import Shape = KeyLines.Shape;
import Node = KeyLines.Node;
import {VlaActions} from "./other/vlaActions";
import {SearchActions} from "./other/searchActions";
import { VlaStyles, VlaExcludedFieldsWhenSavingJson } from "./other/vla.styles";
import {TypesMapping, SearchJson} from "./other/jsons";
import { JsonPipe } from "@angular/common";

export interface FindInFilesResponse {file: string, content: string, matches: string[]}
export interface TypeMapping {type: string, regexCondition: string, titleExtraction: string, style: any}
export interface SearchJson { title: string, pattern: string, flags: string, path: string, fileExtensions: string}
export interface MatchInfo {line: string, value: string, lineNumber: number, index: number}
export interface FileJson {nodes: any, resultsHistory: HistoryItem[]}
export interface HistoryItem {results: any, searchJson: SearchJson, color: string}
export interface CurrentFile {content: string, name: string, lines: string[], node: Node | Link | Shape}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [JsonPipe]
})
export class AppComponent implements OnInit, AfterViewInit {
  private _searchJson: SearchJson = null
  public vlaActions = new VlaActions(this)
  public _reduceSizeOfOldNodes = false

  public searchActions = new SearchActions(this)

  public allData: any[] = []
  public typesMapping: TypeMapping[] = null
  public level = 1;


  public chart: KeyLines.Chart
  public currentFile: CurrentFile = null
  public _visibleNodeProps: any = {};
  public fileElement: HTMLTextAreaElement = null
  public titleElement: HTMLElement = null
  public resultsHistory: HistoryItem[] = [];
  public previousSelectedNode: Node | Link | Shape = null;
  public previousDblClickedNode: KeyLines.Node | KeyLines.Link | KeyLines.Shape = null;
  public lastDblClickedNode: KeyLines.Node | KeyLines.Link | KeyLines.Shape = null;
  public _markedText: string = null
  private linesElement: HTMLElement = null;

  constructor(public http: HttpClient, private jsonPipe: JsonPipe) {
    this.searchJson = SearchJson
    this.typesMapping = TypesMapping
    this.resultsHistory = []
  }

  ngAfterViewInit(): void {
    // this.vlaActions.addNodesToChart([this.vlaActions.createNode('_start', 'START', {e: 3, b: 'orange'})])
  }

  public set reduceSizeOfOldNodes(shouldReduce: boolean) {
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

  set selectedNode(node: Node | Link | Shape) {
    this.previousSelectedNode = this.selectedNode
    if (node == null) {
      this.visibleNodeProps = null
      return
    }
    console.log(node)

    if (node.d.type === 'file') {
      this.currentFile = {
        content: node.d.fileContent,
        name: node.t,
        node: node,
        lines: node.d.fileContent.split('\n')
      }
      this.visibleNodeProps = Object.assign(node, {d: Object.assign(node.d, {fileContent: 'not displayed'})})
    } else {
      if(node.d.ofFile) {
        let connectedToFileNode = this.chart.getItem(node.d.ofFile)
        this.currentFile = {
          content: connectedToFileNode.d.fileContent,
          name: connectedToFileNode.t,
          node: connectedToFileNode as KeyLines.Node,
          lines: connectedToFileNode.t.split('\n')
        }
      } else {
        this.currentFile = null
      }

      this.visibleNodeProps = Object.assign({}, node)
      setTimeout(() => {
        if(this.isNode(node) && this.isOfFile(node)) {
          this.fileElement.focus()
          this.fileElement.selectionStart = node.d.index
          this.fileElement.selectionEnd = node.d.index + node.t.length
          this.fileElement.scrollTop = parseInt(this.fileElement.style.lineHeight) * (parseInt(node.d.lineNumber) - 2)
          this.linesElement.scrollTop = parseInt(this.fileElement.style.lineHeight) * (parseInt(node.d.lineNumber) - 2)
        }
        // this.fileElement.blur()
      }, 200)
    }
  }

  set visibleNodeProps(props: any) {
    VlaExcludedFieldsWhenSavingJson.forEach(fieldName => {delete props[fieldName]})
    this._visibleNodeProps = Object.assign(props)
  }

  get visibleNodeProps() {
    return this.jsonPipe.transform(this._visibleNodeProps)
  }

  isNode(node) {
    return node.type==='node'
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

  private doubleClickOnNode(node: KeyLines.Node | KeyLines.Link | KeyLines.Shape) {
    this.previousDblClickedNode = this.lastDblClickedNode
    this.lastDblClickedNode = node
    this.setNodeStyleNormal(node)
    this.toggleNodeLock(node)
  }

  private toggleNodeLock(node) {
    node = node as KeyLines.Node
    if(node.d.locked) {
      node.d.locked = false
      this.vlaActions.loadNodePrevStyle(node)
    }
    else {
      node.d.locked = true
      this.vlaActions.setNodeStyleAndSave(node, VlaStyles.lockedNode)
    }
    this.chart.setProperties(node)
  }

  private setNodeStyleNormal(clickedItem: KeyLines.Node | KeyLines.Link | KeyLines.Shape) {
    // set clicked node and link to previous link size to 1
    if (clickedItem.d.locked) {
      return
    }
    let resizeNodesAndLinks: Array<KeyLines.Node | KeyLines.Link> = []
    if (clickedItem.type === 'node') {
      let resizedNode: KeyLines.Node = Object.assign({}, clickedItem) as KeyLines.Node
      resizedNode.e = 1
      resizeNodesAndLinks.push(resizedNode)
      if (this.previousSelectedNode !== null && !this.selectedNode === null) {
        this.chart.graph().neighbours(this.selectedNode.id).links.forEach((link) => {
          let linkItem = this.chart.getItem(link) as KeyLines.Link
          if ((linkItem.id1 === this.selectedNode.id && linkItem.id2 === this.previousSelectedNode.id)
            ||
            (linkItem.id2 === this.selectedNode.id && linkItem.id1 === this.previousSelectedNode.id)) {
            resizeNodesAndLinks.push(Object.assign(linkItem, {w: 1}))
          }
        })
      }
    } else {
      resizeNodesAndLinks.push(Object.assign(clickedItem, {w: 1}))
    }
    this.chart.setProperties(resizeNodesAndLinks)
  }

  get selectedNode(): Node | Link | Shape {
    if(!this.chart) return null
    let selectedIds = this.chart.selection()
    if(selectedIds.length>1) {
      console.log('getSelectedNode returneed more than one item. returning null')
      return null
    }
    let selectedNode = this.chart.getItem(selectedIds[0])
    return selectedNode
  }

  public klChartReady(chart: KeyLines.Chart) {
    this.chart = chart
    let chartStyle = {
      selectedNode: {
        b: '#E9219D'
      },
      selectedLink: {
        c: '#E9219D'
      },
      hover: 0,
      dragPan: true,
      handMode: true
    };
    this.chart.options(chartStyle);

    this.chart.bind('click', (clickedId) => {
      this.selectedNode = this.chart.getItem(clickedId) as KeyLines.Node
      console.log('click on vla. clicked Id:', clickedId)
      return true
    });
    this.chart.bind('dblclick', (clickedId) => {
      let item = this.chart.getItem(clickedId)
      this.doubleClickOnNode(item)
      console.log('dblclick on vla. clicked Id:', clickedId)
      return true
    })
    this.chart.bind('delete', () => {
      this.allData = []
      this.chart.each({type: 'all'}, (item)=>{this.allData.push(item)})
      if(this.selectedNode.d.type==='file') {
        this.chart.removeItem(this.vlaActions.getNeighborNodesIds(this.selectedNode))
      }
      this.resultsHistory.unshift({searchJson: null, results: [...this.allData], color: 'rgb(0,0,0)'})
      return false
    })

    this.vlaActions.createAndSelectStartNode()
  }

  ngOnInit(): void {
    this.fileElement = document.getElementById('fileContent') as HTMLTextAreaElement
    this.titleElement = document.getElementById('nodeTitle') as HTMLElement
    this.linesElement = document.getElementById('linesContainer') as HTMLElement
    this.fileElement.onkeydown = (e) => {
      if(e.ctrlKey) return
      e.preventDefault()
      if(e.key==='Delete' && this.selectedNode!==null) {
        this.chart.removeItem(this.chart.selection())
      }
    }
    this.fileElement.onselect = (e) => {
      this.markedText = window.getSelection().toString()
    }
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


  public createRemark() {
    this.selectedNode = this.vlaActions.createRemark(this.selectedNode)
    this.titleElement.focus()
  }

  public setSelectedNodeJson(nodeJson) {
    nodeJson = JSON.parse(nodeJson)
    VlaExcludedFieldsWhenSavingJson.forEach(fieldName => {delete nodeJson[fieldName]})
    this.chart.setProperties(Object.assign(this.selectedNode, nodeJson))
  }

  public setTitle(event) {
    this.chart.setProperties(Object.assign(this.selectedNode, {t: event.target.value}))
  }

  public loadDataFromFindInFiles(response: FindInFilesResponse[]) {
    console.log('find in files response', response)
    let addedNodesAndLinks = []
    response.forEach(file => {
      let fileNodeId = file.file
      let fileValue = file.file
      addedNodesAndLinks.push(this.vlaActions.createNode(fileNodeId, fileValue, {
        d: {fileContent: file.content},
        "ha0": {
          "c": 'rgb(0,0,0)',
          "r": 35,
          "w": 1
        }
      }))

      file.matches.forEach((match: any) => {
        addedNodesAndLinks = addedNodesAndLinks.concat(this.vlaActions.createMatchNode(match, fileNodeId))
      })
    })

    this.vlaActions.addNodesToChart(addedNodesAndLinks)
  }

  public undo() {
    if(!this.resultsHistory.length) {
      console.log('reaced start of history')
      this.vlaActions.createAndSelectStartNode()
      return
    }
    this.allData = this.resultsHistory.shift().results
    this.reload()
  }

  public linkNodes() {
    let linkedNodes = this.chart.selection()
    let linkedToNode = linkedNodes.pop()
    let newLinks = []
    linkedNodes.forEach(nodeId=>{
      newLinks.push(this.vlaActions.createLink(nodeId, linkedToNode, {}))
    })
    this.vlaActions.addNodesToChart(newLinks)
  }

  public saveToFile() {
    let jsonContent: FileJson = {nodes: this.chart.serialize(), resultsHistory: this.resultsHistory}
    jsonContent.nodes = []
    this.chart.each({type: "all"}, (item) => {
        jsonContent.nodes.push(item)
      }
    )

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
        let loaded: FileJson = (JSON.parse(evt.target['result'])) as FileJson
        console.log('loading nodes', loaded.nodes)
        this.vlaActions.addNodesToChart(loaded.nodes, {setColor: false});
        this.resultsHistory = loaded.resultsHistory
      }
      reader.onerror = (evt) => {
        console.log('error reading file');
      }
    }
  }

  public reload() {
    this.chart.load({type: "LinkChart", items: this.allData}).then(() => {
      this.chart.options({arrows: 'normal'});
      return this.chart.layout()
    })
    console.log('added nodes and links', this.allData)
  }

  public saveTypeMapping(value) {
    this.typesMapping = JSON.parse(value)
  }

  public getNodeContent(node): { content: string, startIndex: number, endIndex: number } {
    if(this.currentFile===null) {
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
