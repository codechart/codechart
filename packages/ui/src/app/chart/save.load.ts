import {ChartActions} from "./chart.actions";
import {ChartUtils} from "./chart.utils";
import {ChartStyles} from "./chart.styles";
import {ChartWrapper} from "./chart.wrapper";
import {CreateUtils} from "./create.utils";
import {AppComponent} from "../app.component";
import {Edge, IdType, Node} from "vis";
import {
  FindInFilesResponse, MatchInfo, ReloadIdMatch, VISI_PREFIX, SaveNodesResponse, SaveJson,
  SaveNode, CreateTypes, EndPoints
} from "../types.nodejs";
import {HttpClient} from "@angular/common/http";

export class SaveLoad {
  private chart:ChartWrapper
  private chartActions:ChartActions

  constructor(private app:AppComponent, public http:HttpClient) {
  }

  initialize() {
    this.chart = this.app.chart
    this.chartActions = this.app.chartActions
  }

  public loadDataFromFindInFiles(response:FindInFilesResponse[]) {
    console.log('find in files response', response)
    let addedNodesAndLinks = []
    response.forEach(file => {
      let fileNodeId = file.file
      let fileValue = file.file
      let fileNode = this.chart.createNode(fileNodeId, fileValue, ChartStyles.fileNode)
      fileNode = ChartUtils.setElementAttributesAndGet(fileNode, {fileContent: file.content, level: 0})
      addedNodesAndLinks.push(fileNode)

      file.matches.forEach((match:MatchInfo) => {
        if (match.line.indexOf(VISI_PREFIX) !== -1) {
          match.line = match.line.substring(0, match.line.indexOf(VISI_PREFIX))
        }
        let matchNodes = CreateUtils.createMatchNode(match, fileNodeId, this.chart, this.app.selectedNode as Node)
        addedNodesAndLinks = addedNodesAndLinks.concat(matchNodes)
      })
    })

    let nodesAndLinks = this.chartActions.addNodesToChart(addedNodesAndLinks)
    setTimeout(() => {
      this.chartActions.dimNodes(nodesAndLinks)
    }, 100)
  }

  public reload() {
    let matches: MatchInfo[] = this.chart.nodes.get().filter(node=>{return !ChartUtils.isFileNode(node)}).map(item=>{return ChartUtils.getAttributes(item)})
    this.http.post('http://localhost:2900'+EndPoints.loadFromCode, matches).subscribe((response: FindInFilesResponse[]) => {
      console.log('load response', response)
      this.app.selectedNode = null
      this.loadDataFromFindInFiles(response)
    })
  }

  public saveToFile() {
    let savedNodes:SaveNode[] = this.chart.nodes.get().map((node:Node)=> {
      return CreateTypes.createSaveNode(ChartUtils.getLineNumber(node) as number, ChartUtils.getOfFile(node), node.id as string)
    })
    let saveToFileJson:SaveJson = {nodes: savedNodes}
    this.http.post('http://localhost:2900'+EndPoints.saveToCode, saveToFileJson).subscribe((response:SaveNodesResponse[]) => {
      postResponseSave(response)
    })

    let saveChartToJson = () => {
      let savedEdges = this.chart.edges.get().map((edge:Edge)=>{ delete edge.physics
        return edge})
      let savedNodes = this.chart.nodes.get().map((node:Node)=>{ delete node.physics
        return node})
      let jsonContent = {nodes: savedNodes, edges: savedEdges}
      let fileJson = "data:text/json;charset=utf-8," + JSON.stringify(jsonContent)
      let encodedUri = encodeURI(fileJson);
      let link = document.createElement('a');
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", 'a' + ".json");
      document.body.appendChild(link); // Required for FF
      link.click(); // This will download the data file named "my_data.csv".
      document.body.removeChild(link)
    }

    let postResponseSave = (response:SaveNodesResponse[]) => {
      response.forEach(updatedId=> {
        console.log('save response', response)
        let currentId = updatedId.savedId
        let node = this.chart.getItem(currentId) as Node
        let nodePositions = this.chart.getPosition(currentId)
        node.id = updatedId.exisitingId
        let nodeEdges = this.chart.getItems(this.chartActions.getSurroundingEdgesIds(currentId)).edges.map(edge=> {
          if (edge.from === currentId) edge.from = updatedId.exisitingId
          else edge.to = updatedId.exisitingId
          return edge
        })

        this.chart.deleteItems({nodes: [currentId], edges: []})
        let newNodes = [node].concat(nodeEdges)
        console.log('deleted and added', currentId, newNodes)
        setTimeout(()=> {
          this.chart.addNodesAndLinks(newNodes)
        }, 0)
      })
      saveChartToJson()
    }
  }

  public load(loaded: {nodes: Node[], edges: Edge[]}) {
    this.chartActions.clearChart()
    console.log('loading nodes', loaded.nodes)
    this.chartActions.addNodesToChart(loaded.nodes.concat(loaded.edges));
  }
}
